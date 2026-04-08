import { FailureCategory, EvalRunResult, EvalTask } from '../tasks/taskTypes';

/**
 * Applies a simple heuristic tree to assign exactly ONE primary failure reason.
 */
export const classifyFailure = (rawResult: Partial<EvalRunResult>, task: EvalTask): FailureCategory => {
    const errorString = rawResult.errorMessage?.toLowerCase() || "";

    // 1. Timeout catch
    if (errorString.includes('timeout')) {
        return "timeout";
    }

    // 2. Native OS / Browserbase / Rendering Crashes
    if (rawResult.errorMessage) {
        if (task.category === 'navigation' || task.category === 'action') {
            return "interaction_failure";
        }
        return "navigation_failure"; 
    }

    // 3. The agent didn't crash, but it gave us absolutely nothing
    if (!rawResult.output || rawResult.output.trim() === '') {
        if (task.category === 'navigation') return "site_complexity"; // Probably got stuck loading/solving captchas
        return "extraction_failure";
    }

    // 4. Default: It extracted something successfully, but it was just completely wrong based on validators
    return "hallucinated_output";
};
