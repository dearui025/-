// 国际化配置
export const translations = {
  en: {
    // 页面标题和描述
    pageTitle: "Open Nof1.ai",
    pageSubtitle: "Real-time trading metrics and performance",
    inspiredBy: "inspired by Alpha Arena",
    
    // 导航标签
    liveTab: "LIVE",
    
    // 更新时间
    lastUpdated: "Last updated",
    
    // 加密货币名称
    bitcoin: "Bitcoin",
    ethereum: "Ethereum",
    solana: "Solana",
    binanceCoin: "BNB",
    dogecoin: "Dogecoin",
    
    // 模型活动面板
    modelActivity: "Model Activity",
    modelActivityDesc: "Real-time trading decisions and AI reasoning",
    chatTab: "CHAT",
    tradesTab: "TRADES",
    positionsTab: "POSITIONS",
    positionsComingSoon: "Positions view coming soon...",
    loadingChats: "Loading chats...",
    noChatHistory: "No chat history yet",
    loadingTrades: "Loading trades...",
    noCompletedTrades: "No completed trades yet",
    completedTrade: "completed trade",
    completedTrades: "completed trades",
    
    // 图表面板
    totalAccountValue: "Total Account Value",
    realTimeTracking: "Real-time tracking • Updates every 10s",
    loadingMetrics: "Loading metrics...",
    noMetricsData: "No metrics data available",
    
    // 工具提示
    cashLabel: "Cash:",
    returnLabel: "Return:",
    
    // 交易操作
    buy: "Buy",
    sell: "Sell",
    hold: "Hold",
    
    // 交易详情
    entryPrice: "Entry Price",
    exitPrice: "Exit Price",
    amount: "Amount",
    leverage: "Leverage",
    totalValue: "Total Value",
    stopLoss: "Stop Loss",
    takeProfit: "Take Profit",
    
    // 聊天详情
    userPrompt: "User Prompt",
    chainOfThought: "Chain of Thought",
    tradingDecisions: "Trading Decisions",
    
    // 页脚
    highestModel: "HIGHEST: 🏆 DEEPSEEK CHAT",
    platformName: "nof1.ai - Real-time AI Trading Platform",
  },
  zh: {
    // 页面标题和描述
    pageTitle: "Open Nof1.ai",
    pageSubtitle: "实时交易指标和表现",
    inspiredBy: "灵感来自 Alpha Arena",
    
    // 导航标签
    liveTab: "实时",
    
    // 更新时间
    lastUpdated: "最后更新",
    
    // 加密货币名称
    bitcoin: "比特币",
    ethereum: "以太坊",
    solana: "索拉纳",
    binanceCoin: "币安币",
    dogecoin: "狗狗币",
    
    // 模型活动面板
    modelActivity: "模型活动",
    modelActivityDesc: "实时交易决策和AI推理",
    chatTab: "聊天",
    tradesTab: "交易",
    positionsTab: "持仓",
    positionsComingSoon: "持仓视图即将推出...",
    loadingChats: "加载聊天记录...",
    noChatHistory: "暂无聊天历史",
    loadingTrades: "加载交易...",
    noCompletedTrades: "暂无已完成交易",
    completedTrade: "笔已完成交易",
    completedTrades: "笔已完成交易",
    
    // 图表面板
    totalAccountValue: "账户总价值",
    realTimeTracking: "实时跟踪 • 每10秒更新",
    loadingMetrics: "加载指标...",
    noMetricsData: "暂无指标数据",
    
    // 工具提示
    cashLabel: "现金:",
    returnLabel: "回报:",
    
    // 交易操作
    buy: "买入",
    sell: "卖出",
    hold: "持有",
    
    // 交易详情
    entryPrice: "入场价",
    exitPrice: "出场价",
    amount: "数量",
    leverage: "杠杆",
    totalValue: "总价值",
    stopLoss: "止损",
    takeProfit: "止盈",
    
    // 聊天详情
    userPrompt: "用户提示",
    chainOfThought: "思考链",
    tradingDecisions: "交易决策",
    
    // 页脚
    highestModel: "最高分: 🏆 DEEPSEEK CHAT",
    platformName: "nof1.ai - 实时AI交易平台",
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export function t(key: TranslationKey, lang: Language = "en"): string {
  return translations[lang][key] || translations.en[key] || key;
}

export function setLanguage(lang: Language) {
  if (typeof window !== "undefined") {
    localStorage.setItem("language", lang);
  }
}

export function getLanguage(): Language {
  if (typeof window !== "undefined") {
    const storedLang = localStorage.getItem("language");
    if (storedLang && (storedLang === "en" || storedLang === "zh")) {
      return storedLang;
    }
  }
  return "en";
}