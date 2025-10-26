const https = require('https');

https.get('https://api.ipify.org', (resp) => {
  let data = '';
  
  resp.on('data', (chunk) => {
    data += chunk;
  });
  
  resp.on('end', () => {
    console.log('您的公网IP地址是:', data);
    console.log('请将此IP地址添加到Binance测试网API密钥的IP白名单中');
    console.log('\n操作步骤:');
    console.log('1. 访问 https://testnet.binance.vision/');
    console.log('2. 登录您的账户');
    console.log('3. 进入"API管理"页面');
    console.log('4. 编辑您的API密钥限制');
    console.log('5. 将上述IP地址添加到IP白名单');
  });
  
}).on("error", (err) => {
  console.log("获取IP地址时出错: " + err.message);
});