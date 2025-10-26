"use client";

import { useState, useEffect } from "react";
import { MetricsChart } from "@/components/metrics-chart";
import { MetricData } from "@/lib/types/metrics";

export default function TestChartDisplay() {
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
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">图表显示测试</h1>
      <div className="mb-4">
        <p>数据点数量: {metricsData.length}</p>
        <p>加载状态: {loading ? "加载中..." : "已完成"}</p>
        <p>最后更新: {lastUpdate}</p>
      </div>
      
      <div className="w-full">
        <MetricsChart
          metricsData={metricsData}
          loading={loading}
          lastUpdate={lastUpdate}
          totalCount={totalCount}
          language="zh"
        />
      </div>
      
      {/* 显示原始数据用于调试 */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">原始数据:</h2>
        <pre className="bg-gray-100 p-4 rounded max-h-96 overflow-auto text-xs">
          {JSON.stringify(metricsData, null, 2)}
        </pre>
      </div>
    </div>
  );
}