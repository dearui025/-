"use client";

import { ModelsView } from "@/components/models-view";

export default function TestPositionsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">持仓显示测试</h1>
      <div className="max-w-2xl">
        <ModelsView language="zh" />
      </div>
    </div>
  );
}