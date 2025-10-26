# Paper Trading 设置详细步骤指南

## 第一步：访问Binance测试网

1. 打开浏览器，访问: https://testnet.binance.vision/
2. 点击右上角的"注册"按钮创建账户，或使用已有账户登录

## 第二步：创建API密钥

1. 登录后，点击页面顶部的"API管理"
2. 点击"创建API"按钮
3. 输入API名称，例如: `nof1-ai-paper-trading`
4. 选择权限：
   - ✅ 读取权限 (Read)
   - ✅ 现货交易权限 (Spot & Margin Trading)
5. 点击"创建API密钥"

## 第三步：配置IP白名单

1. 创建完成后，系统会提示您设置IP白名单
2. 在"IP白名单"字段中输入您的公网IP地址: `122.10.198.55`
3. 点击"确认"完成设置

## 第四步：获取测试资金

1. 返回测试网主页
2. 点击左侧菜单中的"钱包"
3. 点击"Faucet"选项卡
4. 选择您需要的资产（如USDT）并点击"领取"

## 第五步：更新项目配置

1. 打开项目根目录下的 [.env](file:///C:/Users/Administrator/Desktop/open-nof1.ai-master/.env) 文件
2. 找到以下行并替换为您的新API密钥：
   ```
   BINANCE_API_KEY="您的新API Key"
   BINANCE_API_SECRET="您的新Secret Key"
   ```
3. 确保以下配置保持不变：
   ```
   BINANCE_USE_SANDBOX="true"
   START_MONEY=10000
   ```

## 第六步：测试Paper Trading

1. 打开终端并导航到项目目录
2. 运行测试脚本：
   ```
   bun paper-trading-test.js
   ```

## 故障排除

如果仍然遇到问题，请检查：

1. API密钥是否已启用
2. IP地址是否正确添加到白名单
3. 是否选择了正确的权限
4. 代理设置是否正确（应为 http://127.0.0.1:7890）

## 联系支持

如果以上步骤都无法解决问题，请联系Binance支持团队获取帮助。