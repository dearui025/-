"use client";

import { useEffect, useState } from "react";
import { getAccountInformationAndPerformance } from "@/lib/trading/account-information-and-performance";

export default function TestAccountInfoPage() {
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccountInfo() {
      try {
        setLoading(true);
        const info = await getAccountInformationAndPerformance(Number(process.env.NEXT_PUBLIC_START_MONEY || 10000));
        setAccountInfo(info);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAccountInfo();
  }, []);

  if (loading) {
    return <div className="p-8">加载中...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">错误: {error}</div>;
  }

  if (!accountInfo) {
    return <div className="p-8">无数据</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">账户信息测试</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">账户概览</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>总账户价值:</span>
              <span className="font-mono">${accountInfo.totalCashValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>可用现金:</span>
              <span className="font-mono">${accountInfo.availableCash.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>持仓价值:</span>
              <span className="font-mono">${accountInfo.currentPositionsValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>总回报率:</span>
              <span className="font-mono">{(accountInfo.currentTotalReturn * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">持仓详情</h2>
          {accountInfo.positions.length > 0 ? (
            <div className="space-y-3">
              {accountInfo.positions.map((position: any, index: number) => (
                <div key={index} className="border-b pb-2 last:border-b-0">
                  <div className="font-medium">{position.symbol}</div>
                  <div className="text-sm text-gray-600">
                    数量: {position.amount.toFixed(4)}
                  </div>
                  <div className="text-sm text-gray-600">
                    平均价格: ${position.avgPrice.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    当前价格: ${position.currentPrice.toFixed(2)}
                  </div>
                  <div className="text-sm font-medium">
                    价值: ${position.value.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">无持仓</div>
          )}
        </div>
      </div>
    </div>
  );
}