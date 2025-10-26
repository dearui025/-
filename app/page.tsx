"use client";

import { useEffect, useState, useCallback } from "react";
import { MetricsChart } from "@/components/metrics-chart";
import { CryptoCard } from "@/components/crypto-card";
import { ModelsView } from "@/components/models-view";
import { Card } from "@/components/ui/card";
import { MarketState } from "@/lib/trading/current-market-state";
import { MetricData } from "@/lib/types/metrics";
import { t, setLanguage, getLanguage, type Language } from "@/lib/i18n";

interface CryptoPricing {
  btc: MarketState;
  eth: MarketState;
  sol: MarketState;
  doge: MarketState;
  bnb: MarketState;
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
  const [language, setLanguageState] = useState<Language>("en");

  // 切换语言
  const toggleLanguage = () => {
    const newLang: Language = language === "en" ? "zh" : "en";
    setLanguageState(newLang);
    setLanguage(newLang);
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

  useEffect(() => {
    // 从本地存储获取语言设置
    const savedLang = getLanguage();
    setLanguageState(savedLang);
    
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
              {t("pageTitle", language)}
              <span className="text-muted-foreground text-sm ml-2">
                {t("inspiredBy", language)}
              </span>
            </h1>
            <p className="text-muted-foreground mt-2">
              {t("pageSubtitle", language)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdate && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground">{t("lastUpdated", language)}</div>
                <div className="text-lg font-mono">{lastUpdate}</div>
              </div>
            )}
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
            {t("liveTab", language)}
          </button>
        </div>

        {/* Crypto Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {pricing ? (
            <>
              <CryptoCard
                symbol="BTC"
                name={t("bitcoin", language)}
                price={`$${pricing.btc.current_price.toLocaleString()}`}
              />
              <CryptoCard
                symbol="ETH"
                name={t("ethereum", language)}
                price={`$${pricing.eth.current_price.toLocaleString()}`}
              />
              <CryptoCard
                symbol="SOL"
                name={t("solana", language)}
                price={`$${pricing.sol.current_price.toLocaleString()}`}
              />
              <CryptoCard
                symbol="BNB"
                name={t("binanceCoin", language)}
                price={`$${pricing.bnb.current_price.toLocaleString()}`}
              />
              <CryptoCard
                symbol="DOGE"
                name={t("dogecoin", language)}
                price={`$${pricing.doge.current_price.toFixed(4)}`}
              />
            </>
          ) : (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, i) => (
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
          </div>

          {/* Right: Models View */}
          <div className="flex-1">
            <ModelsView language={language} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>{t("highestModel", language)}</p>
          <p className="mt-2">{t("platformName", language)}</p>
        </div>
      </div>
    </div>
  );
}
