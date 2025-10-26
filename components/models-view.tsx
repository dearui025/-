"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, TrendingUp, TrendingDown, Minus, Wallet } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { t, type TranslationKey } from "@/lib/i18n"; // 导入翻译函数

interface Trading {
  id: string;
  symbol: string;
  opeartion: "Buy" | "Sell" | "Hold";
  leverage?: number | null;
  amount?: number | null;
  pricing?: number | null;
  stopLoss?: number | null;
  takeProfit?: number | null;
  createdAt: string;
}

interface Chat {
  id: string;
  model: string;
  chat: string;
  reasoning: string;
  userPrompt: string;
  tradings: Trading[];
  createdAt: string;
  updatedAt: string;
}

type TabType = "completed-trades" | "model-chat" | "positions";

interface ModelsViewProps {
  language?: "en" | "zh";
}

export function ModelsView({ language = "en" }: ModelsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("model-chat");
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChatId, setExpandedChatId] = useState<string | null>(null);
  // 添加持仓价格状态
  const [positionsWithPrices, setPositionsWithPrices] = useState<any[]>([]);
  const [pricesLoading, setPricesLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    try {
      const response = await fetch("/api/model/chat");
      if (!response.ok) return;

      const data = await response.json();
      setChats(data.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 30000);
    return () => clearInterval(interval);
  }, [fetchChats]);

  // 只获取 Buy 和 Sell 操作的交易
  const completedTrades = chats.flatMap((chat) =>
    chat.tradings
      .filter((t) => t.opeartion === "Buy" || t.opeartion === "Sell")
      .map((t) => ({ ...t, chatId: chat.id, model: chat.model }))
  );

  // 获取持仓信息（从最近的交易中推断）
  const getCurrentPositions = () => {
    // 简化实现：从交易记录中获取最近的持仓信息
    const positions: any[] = [];
    
    // 按交易对分组，计算净持仓
    const positionMap: Record<string, { symbol: string; amount: number; avgPrice: number; }> = {};
    
    // 遍历所有交易记录，计算净持仓
    chats.forEach(chat => {
      chat.tradings.forEach(trade => {
        if (trade.opeartion === "Buy" && trade.amount && trade.pricing) {
          if (!positionMap[trade.symbol]) {
            positionMap[trade.symbol] = {
              symbol: trade.symbol,
              amount: 0,
              avgPrice: 0
            };
          }
          // 简化的平均价格计算
          const totalValue = positionMap[trade.symbol].amount * positionMap[trade.symbol].avgPrice + trade.amount * trade.pricing;
          const totalAmount = positionMap[trade.symbol].amount + trade.amount;
          positionMap[trade.symbol].amount = totalAmount;
          positionMap[trade.symbol].avgPrice = totalAmount > 0 ? totalValue / totalAmount : 0;
        } else if (trade.opeartion === "Sell" && trade.amount && trade.pricing) {
          if (!positionMap[trade.symbol]) {
            positionMap[trade.symbol] = {
              symbol: trade.symbol,
              amount: 0,
              avgPrice: 0
            };
          }
          positionMap[trade.symbol].amount -= trade.amount;
          // 简化处理，不调整平均价格
        }
      });
    });
    
    // 过滤掉数量为0或负数的持仓
    Object.values(positionMap).forEach(pos => {
      if (pos.amount > 0) {
        positions.push({
          symbol: pos.symbol,
          amount: pos.amount,
          avgPrice: pos.avgPrice,
          currentValue: pos.amount * pos.avgPrice // 简化处理，实际应获取当前市场价格
        });
      }
    });
    
    return positions;
  };

  // 获取持仓的实时价格
  const fetchPositionPrices = async (positions: any[]) => {
    try {
      // 提取所有持仓的交易对符号
      const symbols = positions.map(pos => pos.symbol);
      
      // 批量获取价格
      const prices: Record<string, number> = {};
      for (const symbol of symbols) {
        try {
          // 通过API获取价格而不是直接调用Node.js模块
          const response = await fetch(`/api/pricing/${symbol}`);
          const data = await response.json();
          
          if (data.success) {
            prices[symbol] = data.data.price;
          } else {
            console.error(`Failed to fetch price for ${symbol}:`, data.error);
            prices[symbol] = 0; // 失败时设为0
          }
        } catch (error) {
          console.error(`Failed to fetch price for ${symbol}:`, error);
          prices[symbol] = 0; // 失败时设为0
        }
      }
      
      // 更新持仓信息，添加当前价格
      return positions.map(pos => ({
        ...pos,
        currentPrice: prices[pos.symbol] || 0,
        currentValue: pos.amount * (prices[pos.symbol] || 0) // 使用实时价格计算当前价值
      }));
    } catch (error) {
      console.error("Error fetching position prices:", error);
      // 返回原始持仓信息（不包含实时价格）
      return positions;
    }
  };

  // 当持仓变化时，获取实时价格
  useEffect(() => {
    const positions = getCurrentPositions();
    if (positions.length > 0) {
      setPricesLoading(true);
      fetchPositionPrices(positions)
        .then(updatedPositions => {
          setPositionsWithPrices(updatedPositions);
          setPricesLoading(false);
        })
        .catch(error => {
          console.error("Error updating positions with prices:", error);
          setPositionsWithPrices(positions); // 使用原始持仓信息
          setPricesLoading(false);
        });
    } else {
      setPositionsWithPrices([]);
      setPricesLoading(false);
    }
  }, [chats]); // 当chats变化时重新获取价格

  const renderOperationIcon = (operation: string) => {
    switch (operation) {
      case "Buy":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "Sell":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "Hold":
        return <Minus className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getSymbolName = (symbol: string, language: "en" | "zh") => {
    const symbolNames: Record<string, { en: string; zh: string }> = {
      BTC: { en: "Bitcoin", zh: "比特币" },
      ETH: { en: "Ethereum", zh: "以太坊" },
      BNB: { en: "Binance Coin", zh: "币安币" },
      SOL: { en: "Solana", zh: "索拉纳" },
      DOGE: { en: "Dogecoin", zh: "狗狗币" },
      XRP: { en: "Ripple", zh: "瑞波币" },
    };
    
    return symbolNames[symbol]?.[language] || symbol;
  };

  const renderCompletedTrades = () => {
    if (loading) {
      return <div className="text-center py-8 text-sm">{t("loadingTrades" as TranslationKey, language)}</div>;
    }

    if (completedTrades.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {t("noCompletedTrades" as TranslationKey, language)}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="text-xs text-muted-foreground mb-2">
          {completedTrades.length} {completedTrades.length === 1 ? t("completedTrade" as TranslationKey, language) : t("completedTrades" as TranslationKey, language)}
        </div>
        {completedTrades.map((trade, idx) => (
          <Card key={`${trade.id}-${idx}`} className="overflow-hidden">
            <CardContent className="p-4">
              {/* Header with operation */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b">
                <div className="flex items-center gap-2">
                  {renderOperationIcon(trade.opeartion)}
                  <span className="font-bold text-base">
                    {trade.opeartion === "Buy" ? t("buy" as TranslationKey, language) : trade.opeartion === "Sell" ? t("sell" as TranslationKey, language) : t("hold" as TranslationKey, language)}
                  </span>
                  <span className="font-mono font-bold text-base">
                    {trade.symbol}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getSymbolName(trade.symbol, language)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(trade.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {/* Trade details grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {/* Price */}
                {trade.pricing && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground font-medium">
                      {trade.opeartion === "Buy" ? t("entryPrice" as TranslationKey, language) : t("exitPrice" as TranslationKey, language)}
                    </div>
                    <div className="font-mono font-bold text-base">
                      $
                      {trade.pricing.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                )}

                {/* Amount */}
                {trade.amount && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground font-medium">
                      {t("amount" as TranslationKey, language)}
                    </div>
                    <div className="font-mono font-semibold">
                      {trade.amount}{" "}
                      {trade.symbol?.includes("/") ? "units" : trade.symbol}
                    </div>
                  </div>
                )}

                {/* Leverage */}
                {trade.leverage && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground font-medium">
                      {t("leverage" as TranslationKey, language)}
                    </div>
                    <div className="font-mono font-semibold text-purple-600">
                      {trade.leverage}x
                    </div>
                  </div>
                )}

                {/* Total Value */}
                {trade.pricing && trade.amount && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground font-medium">
                      {t("totalValue" as TranslationKey, language)}
                    </div>
                    <div className="font-mono font-bold text-base">
                      $
                      {(trade.pricing * trade.amount).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </div>
                  </div>
                )}

                {/* Stop Loss */}
                {trade.stopLoss && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground font-medium">
                      {t("stopLoss" as TranslationKey, language)}
                    </div>
                    <div className="font-mono font-semibold text-red-500">
                      ${trade.stopLoss.toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Take Profit */}
                {trade.takeProfit && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground font-medium">
                      {t("takeProfit" as TranslationKey, language)}
                    </div>
                    <div className="font-mono font-semibold text-green-500">
                      ${trade.takeProfit.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Model info at bottom */}
              <div className="mt-3 pt-3 border-t">
                <div className="text-xs text-muted-foreground">
                  Model:{" "}
                  <span className="font-medium text-foreground">
                    {trade.model}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderModelChat = () => {
    if (loading) {
      return <div className="text-center py-8 text-sm">{t("loadingChats" as TranslationKey, language)}</div>;
    }

    if (chats.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {t("noChatHistory" as TranslationKey, language)}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {chats.map((chat) => {
          const isExpanded = expandedChatId === chat.id;
          const decisions = chat.tradings;

          return (
            <Card key={chat.id} className="overflow-hidden max-w-[600px]">
              {/* Collapsed Header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-sm">{chat.model}</h3>
                      <span className="text-xs text-muted-foreground">
                        • {decisions.length} decision
                        {decisions.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {/* Chat preview with markdown */}
                    <div
                      className={`prose prose-sm max-w-none dark:prose-invert text-xs ${
                        isExpanded ? "" : "line-clamp-2"
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {chat.chat}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(chat.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    {/* User Prompt */}
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                        <span className="text-sm">📝</span>
                        {t("userPrompt" as TranslationKey, language)}
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 max-h-40 overflow-y-auto">
                        <div className="prose prose-sm max-w-none dark:prose-invert text-xs">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {chat.userPrompt}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>

                    {/* Chain of Thought */}
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                        <span className="text-sm">🧠</span>
                        {t("chainOfThought" as TranslationKey, language)}
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 max-h-40 overflow-y-auto">
                        <div className="prose prose-sm max-w-none dark:prose-invert text-xs">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {chat.reasoning}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>

                    {/* Decisions */}
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                        <span className="text-sm">⚡</span>
                        {t("tradingDecisions" as TranslationKey, language)}
                      </div>
                      <div className="space-y-2">
                        {decisions.map((decision, idx) => (
                          <div
                            key={idx}
                            className={`rounded-lg p-3 border-l-4 ${
                              decision.opeartion === "Buy"
                                ? "bg-green-50 dark:bg-green-950/20 border-green-500"
                                : decision.opeartion === "Sell"
                                ? "bg-red-50 dark:bg-red-950/20 border-red-500"
                                : "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500"
                            }`}
                          >
                            {/* Decision header */}
                            <div className="flex items-center gap-2 mb-2">
                              {renderOperationIcon(decision.opeartion)}
                              <span className="font-bold text-sm">
                                {decision.opeartion === "Buy" ? t("buy" as TranslationKey, language) : decision.opeartion === "Sell" ? t("sell" as TranslationKey, language) : t("hold" as TranslationKey, language)}
                              </span>
                              <span className="font-mono font-bold text-sm">
                                {decision.symbol}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {getSymbolName(decision.symbol, language)}
                              </span>
                            </div>

                            {/* Decision details */}
                            <div className="space-y-1.5 text-xs">
                              {decision.pricing && (
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">
                                    {decision.opeartion === "Buy"
                                      ? t("entryPrice" as TranslationKey, language)
                                      : decision.opeartion === "Sell"
                                      ? t("exitPrice" as TranslationKey, language)
                                      : "Current Price:"}
                                  </span>
                                  <span className="font-mono font-semibold">
                                    ${decision.pricing.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {decision.amount && (
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">
                                    {t("amount" as TranslationKey, language)}:
                                  </span>
                                  <span className="font-mono font-semibold">
                                    {decision.amount}
                                  </span>
                                </div>
                              )}
                              {decision.leverage && (
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">
                                    {t("leverage" as TranslationKey, language)}:
                                  </span>
                                  <span className="font-mono font-semibold text-purple-600">
                                    {decision.leverage}x
                                  </span>
                                </div>
                              )}
                              {decision.pricing && decision.amount && (
                                <div className="flex justify-between items-center pt-1.5 mt-1.5 border-t border-current/20">
                                  <span className="text-muted-foreground font-semibold">
                                    Total:
                                  </span>
                                  <span className="font-mono font-bold">
                                    $
                                    {(
                                      decision.pricing * decision.amount
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {(decision.stopLoss || decision.takeProfit) && (
                                <div className="pt-1.5 mt-1.5 border-t border-current/20 space-y-1">
                                  {decision.stopLoss && (
                                    <div className="flex justify-between items-center">
                                      <span className="text-muted-foreground">
                                        {t("stopLoss" as TranslationKey, language)}:
                                      </span>
                                      <span className="font-mono font-semibold text-red-500">
                                        ${decision.stopLoss.toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                  {decision.takeProfit && (
                                    <div className="flex justify-between items-center">
                                      <span className="text-muted-foreground">
                                        {t("takeProfit" as TranslationKey, language)}:
                                      </span>
                                      <span className="font-mono font-semibold text-green-500">
                                        ${decision.takeProfit.toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Expand/Collapse button */}
              <button
                onClick={() => setExpandedChatId(isExpanded ? null : chat.id)}
                className="w-full border-t px-4 py-2 text-xs text-muted-foreground hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
              >
                <span>{isExpanded ? "Show less" : "Expand more"}</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            </Card>
          );
        })}
      </div>
    );
  };

  // 渲染持仓信息
  const renderPositions = () => {
    const positions = getCurrentPositions();
    
    if (loading || pricesLoading) {
      return <div className="text-center py-8 text-sm">{t("loadingPositions" as TranslationKey, language)}</div>;
    }

    if (positionsWithPrices.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <Wallet className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
          <div>{t("noPositions" as TranslationKey, language)}</div>
          <div className="text-xs mt-2">{t("noPositionsDesc" as TranslationKey, language)}</div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-xs text-muted-foreground">
          {positionsWithPrices.length} {positionsWithPrices.length === 1 ? t("position" as TranslationKey, language) : t("positions" as TranslationKey, language)}
        </div>
        {positionsWithPrices.map((position, idx) => (
          <Card key={idx} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-full p-2">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-bold">{position.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      {getSymbolName(position.symbol.replace('/USDT', ''), language)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold">
                    {position.amount.toFixed(4)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg: ${position.avgPrice.toFixed(2)}
                  </div>
                </div>
              </div>
              {/* 添加当前价格显示 */}
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">{t("currentPrice" as TranslationKey, language)}:</span>
                <span className="font-mono font-bold">
                  ${position.currentPrice ? position.currentPrice.toFixed(2) : 'N/A'}
                </span>
              </div>
              <div className="mt-1 pt-1 border-t flex justify-between text-sm">
                <span className="text-muted-foreground">{t("currentValue" as TranslationKey, language)}:</span>
                <span className="font-mono font-bold">
                  ${position.currentValue.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-lg">{t("modelActivity" as TranslationKey, language)}</CardTitle>
        <CardDescription className="text-xs">
          {t("modelActivityDesc" as TranslationKey, language)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col px-4 pb-4 min-h-0">
        {/* Tabs */}
        <div className="flex gap-2 border-b mb-4 flex-shrink-0">
          <button
            onClick={() => setActiveTab("model-chat")}
            className={`pb-2 px-3 text-xs font-medium transition-colors ${
              activeTab === "model-chat"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("chatTab" as TranslationKey, language)}
          </button>
          <button
            onClick={() => setActiveTab("completed-trades")}
            className={`pb-2 px-3 text-xs font-medium transition-colors ${
              activeTab === "completed-trades"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("tradesTab" as TranslationKey, language)}
          </button>
          <button
            onClick={() => setActiveTab("positions")}
            className={`pb-2 px-3 text-xs font-medium transition-colors ${
              activeTab === "positions"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("positionsTab" as TranslationKey, language)}
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 -mx-4 px-4">
          {activeTab === "model-chat" && renderModelChat()}
          {activeTab === "completed-trades" && renderCompletedTrades()}
          {activeTab === "positions" && renderPositions()}
        </div>
      </CardContent>
    </Card>
  );
}