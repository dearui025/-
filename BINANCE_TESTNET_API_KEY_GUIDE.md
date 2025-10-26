# 币安测试网API密钥创建指南

## 1. 访问币安测试网

1. 打开浏览器，访问币安现货测试网：https://testnet.binance.vision/
2. 点击页面上的"Log in"按钮

## 2. 注册/登录测试网账户

1. 如果您还没有测试网账户，点击"Register now"进行注册
2. 如果已有账户，直接输入邮箱和密码登录
3. 注意：测试网账户与主网账户是分开的，需要单独注册

## 3. 创建API密钥

1. 登录后，点击页面右上角的头像或用户名
2. 选择"API Management"或"API管理"
3. 点击"Create API"或"创建API"按钮

## 4. 配置API密钥

1. 输入API密钥标签名称，例如"open-nof1-ai"
2. 选择适当的权限：
   - ✅ Read (读取权限) - 必需
   - ✅ Spot & Margin Trading (现货和杠杆交易权限) - 必需
   - 🔒 其他权限根据需要选择，但不要选择不必要的权限

## 5. 安全设置

1. 系统会生成API Key和Secret Key
2. **重要**：立即保存这两个密钥，页面关闭后将无法再次查看Secret Key
3. 记录IP白名单设置（可选但推荐）：
   - 添加您的服务器IP地址以增加安全性
   - 如果是本地测试，可以暂时不设置IP限制

## 6. 更新项目配置

1. 打开项目根目录下的`.env`文件
2. 找到以下行并更新：
   ```
   BINANCE_API_KEY="您的新API Key"
   BINANCE_API_SECRET="您的新Secret Key"
   ```
3. 保存文件

## 7. 验证配置

1. 重启开发服务器：
   ```bash
   cd c:\Users\Administrator\Desktop\open-nof1.ai-master
   bun run dev
   ```
2. 测试API连接：
   ```bash
   cd c:\Users\Administrator\Desktop\open-nof1.ai-master
   bun test-binance.js
   ```

## 常见问题

### API密钥仍然无效
- 确保使用的是现货测试网(https://testnet.binance.vision/)而非期货测试网
- 检查API密钥是否已启用
- 确认API密钥具有现货交易权限

### 网络连接问题
- 确保Clash代理正在运行
- 检查防火墙设置
- 验证代理配置是否正确

### 测试网资金
- 登录测试网后，可以在"钱包"或"Wallet"中查看测试资金
- 如果余额为0，可以使用测试网的"水龙头"功能获取测试资金

## 注意事项

1. 测试网资金是虚拟的，不能提现或转换为真实资金
2. 测试网环境尽可能模拟主网，但可能存在一些差异
3. 请勿在测试网中泄露您的主网API密钥
4. 定期轮换API密钥以确保安全