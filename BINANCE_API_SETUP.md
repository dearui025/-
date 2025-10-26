# 币安API密钥设置说明

## 当前状态

根据测试结果，提供的API密钥无法通过认证。错误信息显示"Invalid Api-Key ID"，这表明：

1. API密钥可能不是为对应的测试网环境创建的
2. API密钥可能已过期或被禁用
3. API密钥可能没有适当的权限

## 重要信息

根据项目内存中的信息和币安官方公告：
> **币安测试网已不再支持期货交易，仅支持现货交易**

这意味着我们需要使用现货测试网而非期货测试网。

## 解决方案

### 方案一：创建新的现货测试网API密钥（推荐）

1. 访问币安现货测试网：https://testnet.binance.vision/
2. 注册/登录账户
3. 进入API管理页面
4. 创建新的API密钥，确保具有现货交易权限
5. 更新项目.env文件中的API密钥

### 方案二：验证现有API密钥

1. 登录币安现货测试网
2. 检查API密钥是否存在于API管理页面
3. 确认API密钥已启用
4. 验证API密钥权限设置

## 项目配置更新

项目已更新为使用现货测试网：
- 主机名：testnet.binance.vision
- 交易类型：现货交易(defaultType: "spot")

## 环境变量配置

确保.env文件包含正确的API密钥：

```
BINANCE_API_KEY="您的现货测试网API Key"
BINANCE_API_SECRET="您的现货测试网Secret Key"
BINANCE_USE_SANDBOX="true"
```

## 测试连接

使用以下命令测试连接：

```bash
cd c:\Users\Administrator\Desktop\open-nof1.ai-master
bun test-binance-futures.js
```

## 常见问题

### 为什么期货测试网API密钥不工作？

1. 币安已停止支持期货测试网
2. 提供的API密钥可能不是为现货测试网创建的

### 如何获取测试资金？

登录现货测试网后，可以在钱包页面获取测试USDT。

### 代理设置

项目已配置使用Clash代理：
- HTTP_PROXY=http://127.0.0.1:7890
- HTTPS_PROXY=http://127.0.0.1:7890

确保Clash代理正在运行。

## 下一步行动

1. 创建新的现货测试网API密钥
2. 更新.env文件中的API密钥
3. 重启开发服务器
4. 测试自动交易功能