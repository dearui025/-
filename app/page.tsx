"use client";

import { useEffect, useState, useCallback } from "react";
import { MetricsChart } from "@/components/metrics-chart";
import { CryptoCard } from "@/components/crypto-card";
import { ModelsView } from "@/components/models-view";
import { RealTimeInfo } from "@/components/real-time-info"; // 添加实时信息组件
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // 添加按钮组件
import { RefreshCw } from "lucide-react"; // 添加刷新图标
import { MarketState } from "@/lib/trading/current-market-state";
import { MetricData } from "@/lib/types/metrics";
import { t, type TranslationKey } from "@/lib/i18n"; // 修改导入
import { SiXrp } from "react-icons/si"; // 添加XRP图标

interface CryptoPricing {
  btc: MarketState;
  eth: MarketState;
  sol: MarketState;
  doge: MarketState;
  bnb: MarketState;
  xrp: MarketState; // 添加XRP支持
}

interface MetricsResponse {
  data: {
    metrics: MetricData[];
    totalCount: number;
    model: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  success: boolean;
}

interface PricingResponse {
  data: {
    pricing: CryptoPricing;
  };
  success: boolean;
}

export default function Home() {
  const [metricsData, setMetricsData] = useState<MetricData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pricing, setPricing] = useState<CryptoPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [language, setLanguageState] = useState<"en" | "zh">("zh");
  const [isRefreshing, setIsRefreshing] = useState(false); // 添加刷新状态

  // 切换语言
  const toggleLanguage = () => {
    const newLang = language === "en" ? "zh" : "en";
    setLanguageState(newLang);
    // 注意：这里不调用setLanguage函数，因为类型不匹配
  };

  // 获取图表数据
  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch("/api/metrics");
      if (!response.ok) return;

      const data: MetricsResponse = await response.json();
      if (data.success && data.data) {
        setMetricsData(data.data.metrics || []);
        setTotalCount(data.data.totalCount || 0);
        setLastUpdate(new Date().toLocaleTimeString());
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setLoading(false);
    }
  }, []);

  // 获取价格数据
  const fetchPricing = useCallback(async () => {
    try {
      const response = await fetch("/api/pricing");
      if (!response.ok) return;

      const data: PricingResponse = await response.json();
      if (data.success && data.data.pricing) {
        setPricing(data.data.pricing);
      }
    } catch (err) {
      console.error("Error fetching pricing:", err);
    }
  }, []);

  // 手动刷新数据
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 触发cron任务更新数据
      await fetch("/api/cron/20-seconds-metrics-interval");
      
      // 等待一段时间确保数据更新完成
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 重新获取数据
      await fetchMetrics();
      await fetchPricing();
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchMetrics, fetchPricing]);

  useEffect(() => {
    // 初始加载
    fetchMetrics();
    fetchPricing();

    const metricsInterval = setInterval(fetchMetrics, 10000);

    const pricingInterval = setInterval(fetchPricing, 10000);

    return () => {
      clearInterval(metricsInterval);
      clearInterval(pricingInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              {t("pageTitle" as TranslationKey, language)}
              <span className="text-muted-foreground text-sm ml-2">
                {t("inspiredBy" as TranslationKey, language)}
              </span>
            </h1>
            <p className="text-muted-foreground mt-2">
              {t("pageSubtitle" as TranslationKey, language)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdate && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground">{t("lastUpdated" as TranslationKey, language)}</div>
                <div className="text-lg font-mono">{lastUpdate}</div>
              </div>
            )}
            {/* 刷新按钮 */}
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? t("refreshing" as TranslationKey, language) : t("refresh" as TranslationKey, language)}
            </Button>
            {/* 语言切换按钮 */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              {language === "en" ? "中文" : "English"}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-8 border-b pb-4">
          <button className="text-sm font-medium border-b-2 border-primary pb-2">
            {t("liveTab" as TranslationKey, language)}
          </button>
        </div>

        {/* Crypto Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {pricing ? (
            <>
              <CryptoCard
                symbol="BTC"
                name={t("bitcoin" as TranslationKey, language)}
                price={`$${pricing.btc.current_price.toLocaleString()}`}
              />
              <CryptoCard
                symbol="ETH"
                name={t("ethereum" as TranslationKey, language)}
                price={`$${pricing.eth.current_price.toLocaleString()}`}
              />
              <CryptoCard
                symbol="SOL"
                name={t("solana" as TranslationKey, language)}
                price={`$${pricing.sol.current_price.toLocaleString()}`}
              />
              <CryptoCard
                symbol="BNB"
                name={t("binanceCoin" as TranslationKey, language)}
                price={`$${pricing.bnb.current_price.toLocaleString()}`}
              />
              <CryptoCard
                symbol="DOGE"
                name={t("dogecoin" as TranslationKey, language)}
                price={`$${pricing.doge.current_price.toFixed(4)}`}
              />
              <CryptoCard
                symbol="XRP"
                name="瑞波币"
                price={`$${pricing.xrp.current_price.toFixed(4)}`}
              />
            </>
          ) : (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-20 bg-muted rounded"></div>
              </Card>
            ))
          )}
        </div>

        {/* Main Content - Chart and Models Side by Side */}
        <div className="flex flex-row gap-6">
          {/* Left: Chart */}
          <div className="flex-[2]">
            <MetricsChart
              metricsData={metricsData}
              loading={loading}
              lastUpdate={lastUpdate}
              totalCount={totalCount}
              language={language}
            />
            {/* 调试信息 */}
            <div className="mt-2 text-xs text-muted-foreground">
              数据点数量: {metricsData.length}
              {metricsData.length > 0 && (
                <>
                  <br />最后更新: {new Date(metricsData[metricsData.length - 1].createdAt).toLocaleString()}
                  <br />账户价值: ${metricsData[metricsData.length - 1].totalCashValue?.toFixed(2)}
                  <br />数据格式检查: {metricsData[metricsData.length - 1].hasOwnProperty('totalCashValue') ? '✓' : '✗'}
                </>
              )}
              <br />有效数据检查: {metricsData.filter(item => item && typeof item.totalCashValue === 'number' && !isNaN(item.totalCashValue) && item.createdAt).length} 条
            </div>
          </div>

          {/* Right: Models View and Real-time Info */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex-1">
              <ModelsView language={language} />
            </div>
            <div className="flex-1">
              <RealTimeInfo language={language} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>{t("highestModel" as TranslationKey, language)}</p>
          <p className="mt-2">{t("platformName" as TranslationKey, language)}</p>
        </div>
      </div>
    </div>
  );
}