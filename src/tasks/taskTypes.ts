/**
 * Classification of why a task failed, useful for analytics and debugging.
 */
export type FailureCategory =
    | "navigation_failure"
    | "interaction_failure"
    | "extraction_failure"
    | "hallucinated_output"
    | "timeout"
    | "ambiguous_instruction"
    | "site_complexity";

/**
 * Defines the validation strategy used to determine if a task succeeded.
 */
export interface TaskValidator {
    type: "exact" | "contains" | "regex" | "manual";
    // Optional parameter used based on the type (e.g. RegExp string). 
    // If omitted, the system can default to comparing against EvalTask.expectedOutput.
    value?: string;
}

/**
 * Represents a single evaluation task assigned to the browser agent.
 */
export interface EvalTask {
    id: string; // Unique identifier for the task, eg: 'nav-001'
    label: string; // Human-readable name
    category: "navigation" | "extraction" | "action" | "robustness";
    startUrl: string; // Where the agent should start
    instruction: string; // The prompt given to the agent
    expectedOutput: string; // Ground truth or reference output
    validator: TaskValidator; // How to score the agent's output against the expected output
    maxDurationSec: number; // Hard limit for the task execution
    notes?: string; // Optional context or dev notes
}

/**
 * Represents the outcome of executing a single EvalTask.
 */
export interface EvalRunResult {
    taskId: string;
    startedAt: string; // ISO 8601 timestamp
    endedAt: string; // ISO 8601 timestamp
    durationSec: number;
    status: "pass" | "partial" | "fail";
    score: 0 | 1 | 2; // Explicit integer score (e.g., 2=pass, 1=partial, 0=fail)
    output: string; // What the agent actually predicted/returned
    finalUrl?: string; // The URL where the agent finished
    errorMessage?: string; // Any system or unhandled errors
    failureCategory?: FailureCategory; // Categorization if the task failed
    notes?: string; // Evaluator/runner notes
    sessionId?: string; // Browserbase session ID
    sessionUrl?: string; // Browserbase developer URL for replay
}
