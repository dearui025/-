const ccxt = require('ccxt');

// 创建Binance现货测试网实例
const binance = new ccxt.binance({
  apiKey: 'LUgIf7D9vqlTVcqHF13TbFY2WeZHsO0Uuycym17wx5Vy2uxdAora8o4PkHbNE7rb',
  secret: 'fuq93IPY0GatDDNHMg0sqSpOsfHIvteaDA1iHhLNct5GXmgcz2IvSfd01pjq7fG3',
  hostname: 'testnet.binance.vision', // 现货测试网
  options: {
    defaultType: 'spot',
    adjustForTimeDifference: true,
    recvWindow: 60000,
    timeout: 30000,
  },
  agent: new (require('http-proxy-agent').HttpProxyAgent)('http://127.0.0.1:7890'),
  enableRateLimit: true,
});

async function testBinanceSpotConnection() {
  try {
    console.log('Testing Binance Spot Testnet Connection...');
    console.log('API Key:', 'LUgIf7D9vqlTVcqHF13TbFY2WeZHsO0Uuycym17wx5Vy2uxdAora8o4PkHbNE7rb'.substring(0, 10) + '...');
    console.log('Hostname:', 'testnet.binance.vision');
    
    // 测试连接
    const time = await binance.fetchTime();
    console.log('Server Time:', new Date(time).toISOString());
    
    // 测试账户信息
    const balance = await binance.fetchBalance();
    console.log('Account Balance:', Object.keys(balance.total).length > 0 ? 'Balance fetched successfully' : 'No balance data');
    
    // 测试市场数据
    const ticker = await binance.fetchTicker('BTC/USDT');
    console.log('BTC/USDT Price:', ticker.last);
    
    console.log('Binance Spot Testnet Connection Successful!');
  } catch (error) {
    console.error('Binance Spot Testnet Connection Error:', error.message);
    console.error('Error Details:', error);
    
    // 如果是认证错误，提供更多信息
    if (error.message.includes('Invalid Api-Key ID')) {
      console.log('\n=== 解决方案 ===');
      console.log('1. 请确认API密钥是为币安现货测试网(testnet.binance.vision)创建的');
      console.log('2. 访问 https://testnet.binance.vision/ 登录并创建新的API密钥');
      console.log('3. 确保API密钥已启用并具有现货交易权限');
      console.log('4. 检查API密钥是否已过期或被禁用');
      console.log('\n注意：币安测试网已不再支持期货交易，仅支持现货交易');
    } else if (error.message.includes('Connection refused') || error.message.includes('connect')) {
      console.log('\n=== 网络连接问题 ===');
      console.log('1. 确保Clash代理正在运行');
      console.log('2. 检查代理设置是否正确(127.0.0.1:7890)');
      console.log('3. 验证网络连接是否正常');
    }
  }
}

testBinanceSpotConnection();