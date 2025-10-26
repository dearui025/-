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
import { MetricData } from "@/lib/types/metrics";
import { ArcticonsDeepseek } from "@/lib/icons";
import { t } from "@/lib/i18n"; // 导入翻译函数

interface MetricsChartProps {
  metricsData: MetricData[];
  loading: boolean;
  lastUpdate: string;
  totalCount?: number;
  language?: "en" | "zh"; // 添加语言属性
}

const chartConfig = {
  totalCashValue: {
    label: "Cash Value",
    color: "#0066FF", // Deepseek 蓝色
  },
} satisfies ChartConfig;

// Deepseek 品牌色
const DEEPSEEK_BLUE = "#0066FF";

// 自定义最后一个点的渲染（带动画）
interface CustomDotProps {
  cx?: number;
  cy?: number;
  index?: number;
  payload?: MetricData;
  dataLength: number;
}

const CustomDot = (props: CustomDotProps) => {
  const { cx, cy, index, payload, dataLength } = props;

  // 只在最后一个点显示 logo 和价格
  if (!payload || !cx || !cy || index !== dataLength - 1) {
    return null;
  }

  const price = payload.totalCashValue;
  
  // 检查价格数据是否有效
  if (typeof price !== 'number' || isNaN(price)) {
    console.warn('Invalid price data for CustomDot:', payload);
    return null;
  }
  
  // 确保返回值在合理范围内
  if (!isFinite(price)) {
    console.warn('Non-finite price data for CustomDot:', price);
    return null;
  }
  
  const priceText = `$${price?.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  // 确保坐标在合理范围内
  const adjustedCx = cx && cx > 0 ? cx : 0;
  const adjustedCy = cy && cy > 0 ? cy : 0;

  // CustomDot 必须返回 SVG 元素，因为它是在 recharts 的 SVG 上下文中渲染的
  // 可以使用 <g> 包裹多个 SVG 元素，或使用 <foreignObject> 嵌入 HTML
  return (
    <g>
      {/* 动画圆圈 - 纯 SVG */}
      <circle
        cx={adjustedCx}
        cy={adjustedCy}
        r={20}
        fill={DEEPSEEK_BLUE}
        opacity={0.2}
        className="animate-ping"
      />
      {/* 主圆点 - 纯 SVG */}
      <circle
        cx={adjustedCx}
        cy={adjustedCy}
        r={8}
        fill={DEEPSEEK_BLUE}
        stroke="#fff"
        strokeWidth={2}
      />

      {/* Logo 和价格容器 - 使用 foreignObject 嵌入 HTML/React 组件 */}
      <foreignObject x={adjustedCx + 15} y={adjustedCy - 35} width={200} height={70}>
        <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3 shadow-lg">
          {/* Deepseek Logo */}
          <div className="relative w-12 h-12 rounded-full bg-[#0066FF] flex items-center justify-center flex-shrink-0 shadow-md">
            <ArcticonsDeepseek className="w-7 h-7 text-black" />
          </div>
          {/* 价格信息 */}
          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground font-semibold tracking-wide">
              DeepSeek AI
            </div>
            <div className="text-lg font-mono font-bold whitespace-nowrap text-foreground">
              {priceText}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              实时账户价值
            </div>
          </div>
        </div>
      </foreignObject>
    </g>
  );
};

export function MetricsChart({
  metricsData,
  loading,
  totalCount,
  language = "en", // 添加默认值
}: MetricsChartProps) {
  // 调试：检查传入的数据
  console.log('MetricsChart received data:', { 
    metricsDataLength: metricsData.length, 
    loading, 
    totalCount, 
    language 
  });
  
  // 确保数据格式正确
  const validMetricsData = metricsData.filter(item => 
    item && 
    typeof item.totalCashValue === 'number' && 
    !isNaN(item.totalCashValue) &&
    item.createdAt
  ).map((item, index) => {
    // 处理 positions 字段
    let processedItem = item;
    if (typeof item.positions === 'string') {
      try {
        processedItem = {
          ...item,
          positions: JSON.parse(item.positions)
        };
      } catch (e) {
        processedItem = {
          ...item,
          positions: []
        };
      }
    }
    
    // 确保所有数值字段都是数字类型
    return {
      ...processedItem,
      totalCashValue: Number(processedItem.totalCashValue),
      availableCash: Number(processedItem.availableCash),
      currentTotalReturn: Number(processedItem.currentTotalReturn),
      currentPositionsValue: Number(processedItem.currentPositionsValue),
      contractValue: Number(processedItem.contractValue),
      sharpeRatio: Number(processedItem.sharpeRatio),
    };
  });
  
  // 获取最后一个数据点用于显示固定信息
  const lastDataPoint = validMetricsData.length > 0 ? validMetricsData[validMetricsData.length - 1] : null;
  
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[500px]">
          <div className="text-lg">Loading metrics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{t("totalAccountValue", language)}</CardTitle>
        <CardDescription className="text-xs">
          {t("realTimeTracking", language)}
          {metricsData.length > 0 && totalCount && (
            <div className="mt-1">
              {metricsData.length} of {totalCount.toLocaleString()} points
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-4 pb-4">
        {validMetricsData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[400px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={validMetricsData}
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

                  const data = payload[0].payload as MetricData;
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
                          <span className="text-sm font-medium">{t("cashLabel", language)}:</span>
                          <span className="text-sm font-mono font-bold">
                            ${data.totalCashValue?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium">{t("returnLabel", language)}:</span>
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
                strokeWidth={3}
                dot={(props) => (
                  <CustomDot {...props} dataLength={validMetricsData.length} />
                )}
                activeDot={{
                  r: 8,
                  fill: DEEPSEEK_BLUE,
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
                isAnimationActive={true}
                animationDuration={500}
              />
              {/* 添加持久化显示的工具提示 - 固定在右上角 */}
              {lastDataPoint && (
                <foreignObject x="0" y="0" width="100%" height="100%">
                  <div className="absolute top-4 right-4 z-10 rounded-lg border bg-background p-3 shadow-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <ArcticonsDeepseek className="w-6 h-6 text-blue-500" />
                      <span className="text-sm font-mono font-bold">
                        Deepseek AI
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground">{t("cashLabel", language)}:</span>
                        <span className="text-sm font-mono font-bold">
                          ${lastDataPoint.totalCashValue?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground">{t("returnLabel", language)}:</span>
                        <span
                          className={`text-sm font-mono font-bold ${
                            (lastDataPoint.currentTotalReturn || 0) >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {((lastDataPoint.currentTotalReturn || 0) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </foreignObject>
              )}
              {/* 添加渐变填充效果 */}
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={DEEPSEEK_BLUE} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={DEEPSEEK_BLUE} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            {t("noMetricsData", language)}
            {/* 调试信息 */}
            <div className="absolute top-2 left-2 text-xs bg-background/80 p-2 rounded">
              原始数据: {metricsData.length} 条<br />
              有效数据: {validMetricsData.length} 条
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}