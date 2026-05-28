import { LlmProvider, LlmConfig } from "./types";
import { OpenAIProvider } from "./openai-provider";
import { DeepSeekProvider } from "./deepseek-provider";
import { MockProvider } from "./mock-provider";

export function createLlmProvider(config: LlmConfig): LlmProvider {
  switch (config.provider) {
    case "openai":
      if (!config.apiKey) {
        throw new Error("OpenAI API key is required");
      }
      return new OpenAIProvider(config.apiKey, config.model);
    case "deepseek":
      if (!config.apiKey) {
        throw new Error("DeepSeek API key is required");
      }
      return new DeepSeekProvider(config.apiKey, config.model);
    case "mock":
    default:
      return new MockProvider();
  }
}

export * from "./types";
