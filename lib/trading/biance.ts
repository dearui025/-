import ccxt from "ccxt";
import { HttpProxyAgent } from 'http-proxy-agent';

// 创建Binance实例
export const binance = new ccxt.binance({
  apiKey: process.env.BINANCE_API_KEY,
  secret: process.env.BINANCE_API_SECRET,
  hostname: 'testnet.binance.vision', // 使用币安现货测试网主机名
  options: {
    defaultType: "spot", // 使用现货交易
    adjustForTimeDifference: true, // 自动调整时间差
    recvWindow: 60000, // 增加接收窗口到60秒
    timeout: 30000, // 增加超时时间到30秒
  },
  // 配置代理
  agent: new HttpProxyAgent('http://127.0.0.1:7890'),
  // 添加额外的时间调整
  enableRateLimit: true, // 启用速率限制
});

// 根据环境变量设置沙盒模式
if (process.env.BINANCE_USE_SANDBOX === "true") {
  binance.setSandboxMode(true);
  console.log("Binance sandbox mode enabled");
} else {
  binance.setSandboxMode(false);
  console.log("Binance production mode enabled");
}