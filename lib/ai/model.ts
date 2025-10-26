import { createDeepSeek } from "@ai-sdk/deepseek";

const deepseekModel = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// 使用DeepSeek直接API而不是通过OpenRouter
export const deepseekv31 = deepseekModel("deepseek-chat"); // 使用deepseek-chat作为替代

export const deepseekR1 = deepseekModel("deepseek-chat"); // 使用deepseek-chat作为替代

export const deepseek = deepseekModel("deepseek-chat");

export const deepseekThinking = deepseekModel("deepseek-reasoner");