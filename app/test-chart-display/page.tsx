"use client";

import { useState, useEffect } from "react";
import { MetricsChart } from "@/components/metrics-chart";
import { MetricData } from "@/lib/types/metrics";

export default function TestChartDisplay() {
  const [metricsData, setMetricsData] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"en" | "zh">("zh");

  // 生成测试数据来验证图表显示
  const generateTestData = () => {
    const testData: MetricData[] = [];
    const now = new Date();
    const baseValue = 10000;
    
    // 生成20个数据点，每个点之间有小幅度变化
    for (let i = 0; i < 20; i++) {
      const timeOffset = (19 - i) * 30; // 每30秒一个数据点
      const time = new Date(now.getTime() - timeOffset * 1000);
      
      // 添加一些随机变化（±5%）
      const variation = (Math.random() - 0.5) * 0.1; // ±5%
      const totalCashValue = baseValue * (1 + variation);
      
      testData.push({
        positions: [],
        sharpeRatio: Math.random() * 2 - 1, // -1到1之间的随机值
        availableCash: parseFloat((totalCashValue * 0.8).toFixed(2)),
        contractValue: 0,
        totalCashValue: parseFloat(totalCashValue.toFixed(2)),
        currentTotalReturn: parseFloat(variation.toFixed(4)),
        currentPositionsValue: parseFloat((totalCashValue * 0.2).toFixed(2)),
        createdAt: time.toISOString(),
      });
    }
    
    setMetricsData(testData);
    setLoading(false);
  };

  useEffect(() => {
    generateTestData();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">图表显示测试</h1>
        <div className="space-x-2">
          <button 
            onClick={() => setLanguage("en")}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            English
          </button>
          <button 
            onClick={() => setLanguage("zh")}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            中文
          </button>
          <button 
            onClick={generateTestData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            生成新数据
          </button>
        </div>
      </div>
      
      <div className="h-[500px]">
        <MetricsChart 
          metricsData={metricsData}
          loading={loading}
          lastUpdate={new Date().toLocaleTimeString()}
          totalCount={metricsData.length}
          language={language}
        />
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">数据详情:</h2>
        <div className="max-h-60 overflow-auto">
          <pre className="text-sm">
            {JSON.stringify(metricsData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}