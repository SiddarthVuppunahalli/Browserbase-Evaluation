import { EvalTask, EvalRunResult, FailureCategory } from '../tasks/taskTypes';
import { validateOutcome } from './validators';
import { classifyFailure } from './classifyFailure';
import fs from 'fs/promises';
import path from 'path';

/**
 * Evaluation Order & Scoring:
 * PASS (2): Validation strictly matches.
 * PARTIAL (1): Agent yielded some schema/content output, or requires manual human grading.
 * FAIL (0): Catastrophic system error, timeout, or completely blank execution.
 */
export const scoreRun = async (task: EvalTask, rawResult: Partial<EvalRunResult>): Promise<EvalRunResult> => {
    let status: "pass" | "partial" | "fail" = "fail";
    let score: 0 | 1 | 2 = 0;
    let failureCategory: FailureCategory | undefined = undefined;

    // SCORING HEURISTICS

    // 1. Catastrophic Runtime/Timeout Error
    if (rawResult.errorMessage) {
        status = "fail";
        score = 0;
        failureCategory = classifyFailure(rawResult, task);
    } 
    // 2. Manual Fallback Required
    else if (task.validator.type === 'manual') {
        status = "partial"; // We grant 1 point for surviving runtime, but it sits in partial queue until graded
        score = 1;
        rawResult.notes = "Requires manual human evaluation to pass.";
        failureCategory = "ambiguous_instruction";
    } 
    // 3. Automated Validation
    else {
        const isMatch = validateOutcome(task.expectedOutput, rawResult.output || "", task.validator);

        if (isMatch) {
            // Perfect Content Validation
            status = "pass";
            score = 2;
        } else {
            // Strict match failed. Check if they get a Partial for plausible effort.
            const hasOutputSchema = rawResult.output && rawResult.output.trim().length > 0;
            
            // Plausibility check (Did they at least end up vaguely on the right website?)
            const expectedHost = new URL(task.startUrl).hostname;
            const actualHost = rawResult.finalUrl ? new URL(rawResult.finalUrl).hostname : "";
            
            if (hasOutputSchema && actualHost === expectedHost) {
                status = "partial";
                score = 1;
                rawResult.notes = "Agent extracted data on the right host, but output didn't strictly match validator.";
                failureCategory = "hallucinated_output";
            } else {
                status = "fail";
                score = 0;
                failureCategory = classifyFailure(rawResult, task);
            }
        }
    }

    // Hydrate the final result
    const scoredResult: EvalRunResult = {
        taskId: rawResult.taskId || task.id,
        startedAt: rawResult.startedAt!,
        endedAt: rawResult.endedAt!,
        durationSec: rawResult.durationSec!,
        output: rawResult.output || "",
        finalUrl: rawResult.finalUrl,
        errorMessage: rawResult.errorMessage,
        sessionId: rawResult.sessionId,
        sessionUrl: rawResult.sessionUrl,
        status,
        score,
        failureCategory,
        notes: rawResult.notes
    };

    // Save to results/scored/
    const outputDir = path.join(process.cwd(), "results", "scored");
    const outputPath = path.join(outputDir, `${scoredResult.taskId}_scored.json`);
    
    // Low-risk fallback: guarantee directory is alive
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(scoredResult, null, 2), "utf-8");

    return scoredResult;
};
