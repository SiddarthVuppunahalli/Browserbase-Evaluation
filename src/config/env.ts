import dotenv from 'dotenv';
import path from 'path';

// Load variables from .env up front
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface AppConfig {
    browserbaseApiKey: string;
    browserbaseProjectId: string;
    openaiApiKey: string;
}

/**
 * Validates that a required environment variable is present and not empty.
 * Throws a descriptive error at startup if validation fails.
 */
const requireEnvVar = (name: string): string => {
    const value = process.env[name];
    if (!value || value.trim() === '') {
        throw new Error(`Startup Error: Missing required environment variable '${name}'. Please add it to your .env file.`);
    }
    return value.trim();
};

// Exported singleton config object ensuring fail-fast behavior.
export const config: AppConfig = {
    // Required to authenticate with the Browserbase platform
    browserbaseApiKey: requireEnvVar('BROWSERBASE_API_KEY'),
    // Required to route sessions to a specific Browserbase project
    browserbaseProjectId: requireEnvVar('BROWSERBASE_PROJECT_ID'),
    // Required by Stagehand to drive the browser agent
    openaiApiKey: requireEnvVar('OPENAI_API_KEY'),
};
