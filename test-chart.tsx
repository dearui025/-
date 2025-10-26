"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { ArcticonsDeepseek } from "@/lib/icons";

// 测试数据
const testData = [
  {
    totalCashValue: 10000,
    createdAt: "2025-10-26T19:00:00.000Z",
    currentTotalReturn: 0
  },
  {
    totalCashValue: 10100,
    createdAt: "2025-10-26T19:01:00.000Z",
    currentTotalReturn: 0.01
  },
  {
    totalCashValue: 10050,
    createdAt: "2025-10-26T19:02:00.000Z",
    currentTotalReturn: 0.005
  },
  {
    totalCashValue: 10200,
    createdAt: "2025-10-26T19:03:00.000Z",
    currentTotalReturn: 0.02
  },
  {
    totalCashValue: 10150,
    createdAt: "2025-10-26T19:04:00.000Z",
    currentTotalReturn: 0.015
  }
];

const chartConfig = {
  totalCashValue: {
    label: "Cash Value",
    color: "#0066FF",
  },
} satisfies ChartConfig;

const DEEPSEEK_BLUE = "#0066FF";

export default function TestChart() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">图表测试</h1>
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">账户总价值</CardTitle>
          <CardDescription className="text-xs">
            实时跟踪 • 每10秒更新
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-4 pb-4">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[400px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={testData}
              margin={{
                left: 8,
                right: 8,
                top: 8,
                bottom: 8,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="createdAt"
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                minTickGap={50}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                width={70}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) {
                    return null;
                  }

                  const data = payload[0].payload;
                  const date = new Date(data.createdAt);

                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-xl">
                      <div>
                        <ArcticonsDeepseek className="w-10 h-10 text-blue-500" />
                        <span className="text-sm font-mono font-bold">
                          Deepseek-R1-0528
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {date.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium">现金:</span>
                          <span className="text-sm font-mono font-bold">
                            ${data.totalCashValue?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium">回报:</span>
                          <span
                            className={`text-sm font-mono font-bold ${
                              (data.currentTotalReturn || 0) >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {((data.currentTotalReturn || 0) * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Line
                dataKey="totalCashValue"
                type="monotone"
                stroke={DEEPSEEK_BLUE}
                strokeWidth={2}
                dot={{ r: 4, fill: DEEPSEEK_BLUE }}
                activeDot={{
                  r: 6,
                  fill: DEEPSEEK_BLUE,
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}