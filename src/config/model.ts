/**
 * Minimal MVP model config.
 * Hardcodes a single provider and model path to avoid complex 
 * multi-model orchestration logic.
 */
export const getModelConfig = () => {
    return {
        // Stagehand natively supports 'gpt-4o' via OpenAI as a default reliable choice.
        modelName: "gpt-4o",
        provider: "openai"
    };
};
