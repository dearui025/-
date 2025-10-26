import { generateObject } from "ai";
import { z } from "zod";
import { deepseekR1 } from "./lib/ai/model";

async function testAI() {
  console.log("开始测试AI运行逻辑...");
  
  try {
    // 测试模型连接
    console.log("测试DeepSeek R1模型连接...");
    
    const testPrompt = `
    This is a test prompt to verify the AI model is working.
    Please respond with a simple JSON object containing:
    - a "message" field with the text "AI test successful"
    - a "status" field with the value "ok"
    `;
    
    const testSystemPrompt = "You are a helpful assistant that responds in JSON format.";
    
    const { object } = await generateObject({
      model: deepseekR1,
      system: testSystemPrompt,
      prompt: testPrompt,
      output: "object",
      mode: "json",
      schema: z.object({
        message: z.string(),
        status: z.string(),
      }),
    });
    
    console.log("AI响应:", object);
    console.log("✅ AI测试成功!");
    
  } catch (error) {
    console.error("❌ AI测试失败:", error.message);
    console.error("错误堆栈:", error.stack);
  }
}

testAI();