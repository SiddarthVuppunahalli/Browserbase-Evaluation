import fs from 'fs/promises';
import path from 'path';
import { summarizeRuns, SuiteSummary } from './summarizeRuns';

/**
 * Transforms a SuiteSummary object into a human-readable Markdown string.
 */
const generateReport = (summary: SuiteSummary): string => {
    
    // Select the first 3 runs as "notable examples" to display
    const notableRuns = summary.runs.slice(0, 3).map(run => {
        const sessionLink = run.sessionUrl ? `[View Session Replay](${run.sessionUrl})` : "No session recorded";
        // Sanitize output length so it doesn't break table grids
        const shortOutput = (run.output || "").substring(0, 80).replace(/\n/g, ' ');
        
        return `* **${run.taskId}** (Score: \`${run.score}\`, Status: \`${run.status}\`)\n  * Extracted: \`${shortOutput}${run.output.length > 80 ? '...' : ''}\`\n  * ${sessionLink}`;
    }).join('\n\n');

    // Build metric tables
    const passRateTbl = Object.entries(summary.passRateByCategory)
        .map(([cat, stats]) => `| ${cat} | ${stats.passed}/${stats.total} | **${stats.rate}** |`)
        .join('\n');

    const failureTbl = Object.entries(summary.failuresByType)
        .map(([type, count]) => `| ${type} | ${count} |`)
        .join('\n');

    return `# Browserbase Evaluation: Findings Report

## 1. Project Objective
This project serves as a small reliability harness for browser-agent behaviors using Stagehand and Browserbase. It validates the agent's ability to navigate basic DOMs and extract structured data accurately, rather than overclaiming to be a massive industry benchmark.

## 2. Overall Execution Summary
* **Total Executed:** ${summary.totalTasks} tasks
* **Pass (Perfect):** ${summary.pass}
* **Partial (Manual/Plausible):** ${summary.partial}
* **Fail (Crash/Timeout):** ${summary.fail}

## 3. Pass Rate by Category
| Category | Pass / Total | Pass Rate |
|----------|--------------|-----------|
${passRateTbl || '| None run | 0/0 | N/A |'}

## 4. Failure Distribution
| Failure Category | Count |
|--------------|-------|
${failureTbl || '| No failures detected | 0 |'}

## 5. Notable Run Examples
${notableRuns || '*No runs have been executed yet. Run `npm run run:suite` to populate.*'}

## 6. Lessons Learned
1. **Extraction Brittleness:** Extracting deeply nested JSON perfectly via basic prompts is tricky; the LLM often yields slight schema casing variations that break rigid exact-match parsers.
2. **Timing & Plausibility:** Browser-agents are heavily dependent on waiting for Document states. Tasks that fail outright usually reveal DOM rendering delays rather than LLM reasoning failures.
3. **Manual Validation Bottleneck:** Subjective tasks (like "extract a good summary of a page") severely limit Continuous Integration speeds, because they strictly require human-in-the-loop validation tools to verify reliably over time.

## 7. Suggested Next Experiments
* **Enforce Strict Schema:** We should evolve \`TaskValidator\` into Zod schemas passed directly to Stagehand's \`extract\` method.
* **Auto-retry Logic:** Currently, if a task fails due to a random navigation timeout, it hard fails. A 10-second retry loop could drastically boost reliability on SPAs.
* **Authentication Profiles:** Add \`session.cookies\` support to evaluate the agent operating robustly behind logins.
`;
};

// Entrypoint for `npm run report`
const run = async () => {
    console.log("Analyzing scored JSON results in memory...");
    const summary = await summarizeRuns();
    
    console.log("Compiling markdown snapshot...");
    const markdown = generateReport(summary);

    // Save to results/reports natively
    const outputDir = path.join(process.cwd(), "results", "reports");
    const outPath = path.join(outputDir, "findings.md");
    
    // Create safely
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outPath, markdown, "utf-8");

    // Also overwrite the root tracker
    const rootOutPath = path.join(process.cwd(), "findings.md");
    await fs.writeFile(rootOutPath, markdown, "utf-8");

    console.log(`\n✅ Markdown findings report generated: ${outPath}`);
};

if (require.main === module) {
    run().catch(console.error);
}
