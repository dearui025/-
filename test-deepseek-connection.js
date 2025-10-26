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

async function testConnection() {
  try {
    console.log('创建DeepSeek模型实例...');
    const model = deepseek('deepseek-chat');
    
    console.log('发送测试请求...');
    const response = await model.doGenerate({
      inputFormat: 'prompt',
      prompt: 'Hello, DeepSeek! Please respond with a short greeting.',
      maxTokens: 50,
    });
    
    console.log('API响应:');
    console.log('输出:', response.text);
    console.log('完成原因:', response.finishReason);
    console.log('使用Token数:', response.usage);
    
    console.log('✅ DeepSeek API连接测试成功!');
  } catch (error) {
    console.error('❌ DeepSeek API连接测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testConnection();