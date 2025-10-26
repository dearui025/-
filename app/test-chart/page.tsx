"use client";

import { useState, useEffect } from "react";
import { MetricsChart } from "@/components/metrics-chart";
import { MetricData } from "@/lib/types/metrics";

export default function TestChartPage() {
  const [metricsData, setMetricsData] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/metrics");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);
        
        if (data.success && data.data) {
          setMetricsData(data.data.metrics || []);
          setTotalCount(data.data.totalCount || 0);
          setLastUpdate(new Date().toLocaleTimeString());
          console.log("设置的metricsData:", data.data.metrics);
        }
      } catch (err) {
        console.error("Error fetching metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // 每10秒刷新一次数据
    const interval = setInterval(fetchMetrics, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">图表显示测试</h1>
            <p className="text-muted-foreground mt-2">
              验证修复后的图表数据展示
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">最后更新</div>
            <div className="text-lg font-mono">{lastUpdate}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="col-span-1">
            <MetricsChart
              metricsData={metricsData}
              loading={loading}
              lastUpdate={lastUpdate}
              totalCount={totalCount}
              language="zh"
            />
            
            {/* 调试信息 */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">调试信息:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>原始数据点: {metricsData.length}</div>
                <div>总数据点数: {totalCount}</div>
                <div>加载状态: {loading ? "加载中..." : "已完成"}</div>
                <div>最后更新: {lastUpdate}</div>
              </div>
            </div>
          </div>
          
          {/* 显示原始数据用于调试 */}
          {metricsData.length > 0 && (
            <div className="col-span-1">
              <h2 className="text-xl font-semibold mb-2">数据详情:</h2>
              <div className="bg-muted p-4 rounded-lg max-h-96 overflow-auto">
                <pre className="text-xs">
                  {JSON.stringify(metricsData.slice(0, 5), null, 2)}
                </pre>
                {metricsData.length > 5 && (
                  <p className="text-muted-foreground text-sm mt-2">
                    ... 还有 {metricsData.length - 5} 条数据
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}