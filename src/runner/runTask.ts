import { Stagehand } from "@browserbasehq/stagehand";
import { config } from "../config/env";
import { getModelConfig } from "../config/model";
import { EvalTask, EvalRunResult } from "../tasks/taskTypes";
import fs from 'fs/promises';
import path from 'path';

// Helper for ISO timestamps
const getTimestamp = () => new Date().toISOString();

/**
 * Runs a single evaluation task using Stagehand.
 * Captures all raw outcomes and saves them to results/raw.
 */
export const runTask = async (task: EvalTask): Promise<Partial<EvalRunResult>> => {
    console.log(`\n▶ Starting task: ${task.id}...`);
    const startedAt = getTimestamp();
    const startTimeMs = Date.now();
    
    let errorMessage: string | undefined = undefined;
    let output = "";
    let finalUrl: string | undefined = undefined;
    let sessionId: string | undefined = undefined;
    let sessionUrl: string | undefined = undefined;

    const modelConfig = getModelConfig();
    
    // Initialize Stagehand
    // Note: The Stagehand constructor arguments can drift across beta releases.
    const stagehand = new Stagehand({
        env: "BROWSERBASE",
        apiKey: config.browserbaseApiKey,
        projectId: config.browserbaseProjectId,
        modelName: modelConfig.modelName as any, 
    });

    try {
        await stagehand.init();
        const page = stagehand.page;

        // SDK UNCERTAINTY 1: Session Retrieval
        // Plucking the active Browserbase sessionId from the Stagehand class isn't deeply documented.
        // We'll peek into the context/internals to extract it for logging if available.
        sessionId = (stagehand as any).context?.browserbaseSessionId || (stagehand as any).sessionId || "unknown";
        sessionUrl = `https://browserbase.com/sessions/${sessionId}`;

        // Timeout boundary enforcing task.maxDurationSec natively
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Timeout exceeded ${task.maxDurationSec}s`)), task.maxDurationSec * 1000);
        });

        // Run the agent driven logic
        await Promise.race([
            (async () => {
                console.log(`  - Navigating to ${task.startUrl}`);
                await page.goto(task.startUrl);
                
                // If it's a structural or interaction-heavy task, let's ask Stagehand to "act" first
                if (task.category === "navigation" || task.category === "action") {
                    console.log(`  - Acting: ${task.instruction}`);
                    await page.act({ action: task.instruction });
                }

                console.log(`  - Extracting final response...`);
                
                // SDK UNCERTAINTY 2: Extraction Schema
                // Stagehand usually enforces Zod schemas for typed extraction.
                // Since this is a simple string-based config MVP, we try to cast or allow 'any'
                // and just prompt the LLM to yield basic JSON string.
                const extraction = await (page as any).extract({
                    instruction: `Evaluate this objective: "${task.instruction}". Provide the requested expected fields in a simple JSON format if possible.`
                });
                
                // Normalize result into string
                output = typeof extraction === "string" ? extraction : JSON.stringify(extraction, null, 2);
                finalUrl = page.url();
            })(),
            timeoutPromise
        ]);

    } catch (e: any) {
        errorMessage = e.message || String(e);
        console.error(`  ! Task ${task.id} failed natively: ${errorMessage}`);
    } finally {
        console.log(`  - Closing browser...`);
        await stagehand.close();
    }

    const endedAt = getTimestamp();
    const durationSec = (Date.now() - startTimeMs) / 1000;

    // We build the raw layout, reserving status and score for the scoring engine
    const rawResult: Partial<EvalRunResult> = {
        taskId: task.id,
        startedAt,
        endedAt,
        durationSec,
        output,
        finalUrl,
        errorMessage,
        sessionId,
        sessionUrl,
    };

    // Auto-save to the 'raw' folder
    const fileName = `${task.id}_${Date.now()}.json`;
    const outputDir = path.join(process.cwd(), "results", "raw");
    const outputPath = path.join(outputDir, fileName);
    
    // Low-risk safety: ensure directory exists before writing!
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(rawResult, null, 2), "utf-8");
    console.log(`✔ Finished. Raw results saved to ${outputPath}`);
    
    return rawResult;
};
