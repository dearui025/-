"use client";

import { ArcticonsDeepseek } from "@/lib/icons";

export default function TestIcon() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">图标测试</h1>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <ArcticonsDeepseek className="w-16 h-16 text-blue-500" />
          <p className="mt-2">正常大小</p>
        </div>
        <div className="flex flex-col items-center">
          <ArcticonsDeepseek className="w-10 h-10 text-black" />
          <p className="mt-2">小尺寸</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16 rounded-full bg-[#0066FF] flex items-center justify-center">
            <ArcticonsDeepseek className="w-10 h-10 text-black" />
          </div>
          <p className="mt-2">带背景</p>
        </div>
      </div>
    </div>
  );
}