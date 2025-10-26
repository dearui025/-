# Paper Trading (模拟交易) 设置指南

## 当前状态

项目已经配置为使用Binance测试网进行Paper Trading：
- 已启用沙盒模式 (`BINANCE_USE_SANDBOX="true"`)
- 使用现货交易 (`defaultType: "spot"`)
- 连接到Binance现货测试网 (`hostname: 'testnet.binance.vision'`)

## 解决API密钥认证问题

当前遇到的错误："Invalid API-key, IP, or permissions for action" 表明需要正确配置API密钥。

### 步骤1：创建新的测试网API密钥

1. 访问 Binance 现货测试网: https://testnet.binance.vision/
2. 注册/登录账户
3. 进入 "API管理" 页面
4. 点击 "创建API" 按钮
5. 设置API名称（例如："nof1-ai-paper-trading"）
6. 选择权限：
   - ✅ 读取权限 (Read)
   - ✅ 现货交易权限 (Spot Trading)
7. 创建API密钥

### 步骤2：配置IP白名单

1. 在API密钥创建完成后，进入API管理页面
2. 找到刚创建的API密钥
3. 点击 "编辑限制" 或 "Edit Restrictions"
4. 添加您的公网IP地址到白名单：`122.10.198.55`
5. 保存更改

### 步骤3：获取测试资金

1. 登录测试网账户
2. 进入 "钱包" 或 "Wallet" 页面
3. 查找 "水龙头" 或 "Faucet" 功能
4. 领取测试USDT资金

### 步骤4：更新项目配置

1. 打开项目根目录下的 `.env` 文件
2. 更新以下配置：
   ```
   BINANCE_API_KEY="您的新API Key"
   BINANCE_API_SECRET="您的新Secret Key"
   BINANCE_USE_SANDBOX="true"
   START_MONEY=10000
   ```

## Paper Trading 工作原理

### 1. 沙盒模式
```javascript
binance.setSandboxMode(true); // 启用Paper Trading模式
```

### 2. 交易类型
- 使用现货交易而非期货交易
- 所有交易都在测试网环境中执行
- 不涉及真实资金

### 3. 风险控制
- 项目已配置风险管理规则
- 买入时自动设置止损（买入价的95%）
- 买入时自动设置止盈（买入价的110%）

## 测试Paper Trading功能

### 运行测试脚本
```bash
cd c:\Users\Administrator\Desktop\open-nof1.ai-master
bun paper-trading-test.js
```

### 启动开发服务器
```bash
cd c:\Users\Administrator\Desktop\open-nof1.ai-master
bun run dev
```

### 触发交易
```bash
curl http://localhost:3000/api/cron/3-minutes-run-interval
```

## 常见问题

### 1. API密钥认证失败
- 确认API密钥已启用
- 检查IP白名单设置
- 验证API密钥权限

### 2. 资金不足
- 使用测试网水龙头获取测试资金
- 确认账户有足够USDT余额

### 3. 网络连接问题
- 确保Clash代理正在运行
- 检查代理设置 (127.0.0.1:7890)

## 监控和日志

### 查看交易日志
1. 访问 Web 仪表板
2. 查看 "模型活动" 面板
3. 查看交易决策和执行结果

### 数据库记录
所有交易都会保存到本地SQLite数据库中：
- 位置: `prisma/dev.db`
- 表: `Chat` 和 `Trading`

## 最佳实践

### 1. 定期检查
- 定期验证API密钥有效性
- 检查测试网资金余额
- 监控交易执行情况

### 2. 风险管理
- 设置合理的止损止盈点
- 控制单笔交易金额
- 分散交易品种

### 3. 测试策略
- 先在Paper Trading环境中测试策略
- 逐步增加交易金额
- 记录和分析交易结果

## 下一步行动

1. 按照上述步骤创建并配置新的API密钥
2. 更新环境变量配置
3. 重启开发服务器
4. 测试自动交易功能
5. 监控交易执行情况