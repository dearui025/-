"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Clock } from "lucide-react";
import { t, type TranslationKey } from "@/lib/i18n";

interface RealTimeInfoProps {
  language?: "en" | "zh";
}

interface AccountInfo {
  totalCashValue: number;
  availableCash: number;
  currentTotalReturn: number;
  currentPositionsValue: number;
  sharpeRatio: number;
  lastUpdated: string;
}

export function RealTimeInfo({ language = "en" }: RealTimeInfoProps) {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchAccountInfo = useCallback(async () => {
    try {
      // 获取最新的指标数据
      const metricsResponse = await fetch("/api/metrics");
      if (!metricsResponse.ok) return;

      const metricsData = await metricsResponse.json();
      
      if (metricsData.success && metricsData.data.metrics.length > 0) {
        // 获取最新的数据点
        const latestMetric = metricsData.data.metrics[metricsData.data.metrics.length - 1];
        
        setAccountInfo({
          totalCashValue: latestMetric.totalCashValue,
          availableCash: latestMetric.availableCash,
          currentTotalReturn: latestMetric.currentTotalReturn,
          currentPositionsValue: latestMetric.currentPositionsValue,
          sharpeRatio: latestMetric.sharpeRatio,
          lastUpdated: latestMetric.createdAt,
        });
        
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Error fetching account info:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 初始加载
    fetchAccountInfo();
    
    // 每5秒更新一次数据
    const interval = setInterval(fetchAccountInfo, 5000);
    
    return () => clearInterval(interval);
  }, [fetchAccountInfo]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("realTimeInfo" as TranslationKey, language)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!accountInfo) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("realTimeInfo" as TranslationKey, language)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            {t("noDataAvailable" as TranslationKey, language)}
          </div>
        </CardContent>
      </Card>
    );
  }

  const returnPercentage = (accountInfo.currentTotalReturn * 100).toFixed(2);
  const isPositiveReturn = accountInfo.currentTotalReturn >= 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("realTimeInfo" as TranslationKey, language)}
          </div>
          <div className="text-xs text-muted-foreground font-normal">
            {lastUpdate}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 总账户价值 */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{t("totalAccountValue" as TranslationKey, language)}</span>
          </div>
          <div className="text-lg font-bold">
            ${accountInfo.totalCashValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        {/* 总回报率 */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            {isPositiveReturn ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm font-medium">{t("totalReturn" as TranslationKey, language)}</span>
          </div>
          <div className={`text-lg font-bold ${isPositiveReturn ? "text-green-500" : "text-red-500"}`}>
            {returnPercentage}%
          </div>
        </div>

        {/* 可用现金 */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{t("availableCash" as TranslationKey, language)}</span>
          </div>
          <div className="text-lg font-bold">
            ${accountInfo.availableCash.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        {/* 持仓价值 */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{t("positionsValue" as TranslationKey, language)}</span>
          </div>
          <div className="text-lg font-bold">
            ${accountInfo.currentPositionsValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        {/* 夏普比率 */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{t("sharpeRatio" as TranslationKey, language)}</span>
          </div>
          <div className={`text-lg font-bold ${accountInfo.sharpeRatio >= 0 ? "text-green-500" : "text-red-500"}`}>
            {accountInfo.sharpeRatio.toFixed(2)}
          </div>
        </div>

        {/* 最后更新时间 */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          {t("lastUpdated" as TranslationKey, language)}: {new Date(accountInfo.lastUpdated).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}