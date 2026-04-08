import { TaskValidator } from '../tasks/taskTypes';

/**
 * Core validation logic to determine if the agent's output matches expected truth.
 */
export const validateOutcome = (
    expectedOutput: string,
    actualOutput: string,
    validator: TaskValidator
): boolean => {
    // Gracefully handle undefined outputs
    if (!actualOutput) return false;

    const expected = expectedOutput.trim().toLowerCase();
    const actual = actualOutput.trim().toLowerCase();
    
    // Simplistic heuristic to normalize JSON output by stripping whitespace/quotes/brackets
    // so {"concurrentSessions": 1} roughly matches "concurrentSessions:1"
    const normalize = (str: string) => str.replace(/[\s"'{}]/g, '');

    switch (validator.type) {
        case 'exact':
            return normalize(actual) === normalize(expected);
            
        case 'contains':
            const searchTarget = validator.value ? validator.value.toLowerCase() : expected;
            return actual.includes(searchTarget);
            
        case 'regex':
            if (!validator.value) return false;
            try {
                // Use original casing for Regex since they might be case-sensitive
                const regex = new RegExp(validator.value);
                return regex.test(actualOutput); 
            } catch {
                return false; // Regex compilation error = fail
            }
            
        case 'manual':
            // Automated pipeline cannot strictly validate 'manual' tasks
            return false; 
    }
};
