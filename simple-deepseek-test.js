const { createDeepSeek } = require('@ai-sdk/deepseek');

// 从环境变量获取API密钥
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

console.log('DEEPSEEK_API_KEY:', DEEPSEEK_API_KEY ? '已设置' : '未设置');

if (!DEEPSEEK_API_KEY) {
  console.error('错误: 未找到DEEPSEEK_API_KEY环境变量');
  process.exit(1);
}

// 创建DeepSeek实例
const deepseek = createDeepSeek({
  apiKey: DEEPSEEK_API_KEY,
});

console.log('DeepSeek实例创建成功');

// 测试模型列表
console.log('可用模型:');
console.log('- deepseek-chat');
console.log('- deepseek-reasoner');
console.log('- deepseek-coder');

// 简单测试
async function simpleTest() {
  try {
    console.log('开始简单测试...');
    
    // 使用deepseek-chat模型
    const model = deepseek('deepseek-chat');
    console.log('模型实例创建成功');
    
    // 发送简单请求
    const response = await model.doGenerate({
      prompt: 'Hello!',
      maxTokens: 10,
    });
    
    console.log('响应:', response.text);
    console.log('✅ DeepSeek测试成功!');
  } catch (error) {
    console.error('❌ DeepSeek测试失败:', error.message);
    console.error('错误详情:', error);
  }
}

simpleTest();