const { createDeepSeek } = require('@ai-sdk/deepseek');

// 从环境变量获取API密钥
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
  console.error('错误: 未找到DEEPSEEK_API_KEY环境变量');
  process.exit(1);
}

console.log('正在测试DeepSeek API连接...');

const deepseek = createDeepSeek({
  apiKey: DEEPSEEK_API_KEY,
});

async function testDeepSeek() {
  console.log("开始测试DeepSeek AI模型...");
  
  try {
    // 测试运行AI模型
    await run(10000);
    console.log("DeepSeek AI模型执行成功！");
  } catch (error) {
    console.error("DeepSeek AI模型执行失败:", error);
  }
}

testDeepSeek();