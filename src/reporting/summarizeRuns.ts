import fs from 'fs/promises';
import path from 'path';
import { EvalRunResult } from '../tasks/taskTypes';
import { publicTasks } from '../tasks/publicTasks';

export interface SuiteSummary {
    totalTasks: number;
    pass: number;
    partial: number;
    fail: number;
    passRateByCategory: Record<string, { total: number, passed: number, rate: string }>;
    failuresByType: Record<string, number>;
    runs: EvalRunResult[];
}

/**
 * Aggregates all JSON outputs inside results/scored into a unified summary model.
 */
export const summarizeRuns = async (): Promise<SuiteSummary> => {
    const scoredDir = path.join(process.cwd(), "results", "scored");
    let files: string[] = [];
    
    try {
        files = await fs.readdir(scoredDir);
    } catch {
        // If directory is missing/empty, return an empty layout safely
        return { totalTasks: 0, pass: 0, partial: 0, fail: 0, passRateByCategory: {}, failuresByType: {}, runs: [] };
    }

    const runs: EvalRunResult[] = [];
    for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const filePath = path.join(scoredDir, file);
        const data = await fs.readFile(filePath, 'utf-8');
        try { runs.push(JSON.parse(data)); } catch { /* Ignore malformed JSON */ }
    }

    const summary: SuiteSummary = {
        totalTasks: runs.length,
        pass: 0,
        partial: 0,
        fail: 0,
        passRateByCategory: {},
        failuresByType: {},
        runs
    };

    runs.forEach(run => {
        // Tally high-level counters
        if (run.status === 'pass') summary.pass++;
        else if (run.status === 'partial') summary.partial++;
        else summary.fail++;

        // Track Category performance based on our source of truth
        const taskDef = publicTasks.find(t => t.id === run.taskId);
        const category = taskDef?.category || 'unknown';

        if (!summary.passRateByCategory[category]) {
            summary.passRateByCategory[category] = { total: 0, passed: 0, rate: '0%' };
        }
        
        summary.passRateByCategory[category].total++;
        if (run.status === 'pass') summary.passRateByCategory[category].passed++;

        // Calculate string percentage
        const pObj = summary.passRateByCategory[category];
        pObj.rate = ((pObj.passed / pObj.total) * 100).toFixed(0) + '%';

        // Track Failure categories if they exist
        if (run.failureCategory) {
            summary.failuresByType[run.failureCategory] = (summary.failuresByType[run.failureCategory] || 0) + 1;
        }
    });

    return summary;
};
