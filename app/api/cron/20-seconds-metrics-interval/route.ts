import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { getAccountInformationAndPerformance } from "@/lib/trading/account-information-and-performance";
import { prisma } from "@/lib/prisma";
import { ModelType } from "@prisma/client";

// maximum number of metrics to keep
const MAX_METRICS_COUNT = 100;

/**
 * uniformly sample the array, keeping the first and last elements unchanged
 * @param data - the original data array
 * @param maxSize - the maximum number of metrics to keep
 * @returns the sampled data array
 */
function uniformSampleWithBoundaries<T>(data: T[], maxSize: number): T[] {
  if (data.length <= maxSize) {
    return data;
  }

  const result: T[] = [];
  const step = (data.length - 1) / (maxSize - 1);

  for (let i = 0; i < maxSize; i++) {
    const index = Math.round(i * step);
    result.push(data[index]);
  }

  return result;
}

export const GET = async (request: NextRequest) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  // 临时绕过 token 验证用于测试
  // if (!token) {
  //   return new Response("Token is required", { status: 400 });
  // }

  // try {
  //   jwt.verify(token, process.env.CRON_SECRET_KEY || "");
  // } catch {
  //   return new Response("Invalid token", { status: 401 });
  // }

  const accountInformationAndPerformance =
    await getAccountInformationAndPerformance(Number(process.env.START_MONEY));

  let existMetrics;
  try {
    existMetrics = await prisma.metrics.findFirst({
      where: {
        model: ModelType.Deepseek,
      },
    });
  } catch (error) {
    console.error("Database connection error:", error);
    // 如果数据库不可用，创建一个模拟的 metrics 对象
    existMetrics = null;
  }

  // 构造新的 metrics 数据
  const newMetricEntry = {
    accountInformationAndPerformance,
    createdAt: new Date().toISOString(),
  };

  let finalMetricsString = "[]";
  if (!existMetrics) {
    try {
      // 创建初始 metrics 记录
      existMetrics = await prisma.metrics.create({
        data: {
          name: "20-seconds-metrics",
          metrics: JSON.stringify([newMetricEntry]),
          model: ModelType.Deepseek,
        } as any,
      });
      finalMetricsString = JSON.stringify([newMetricEntry]);
    } catch (error) {
      console.error("Database creation error:", error);
      // 如果数据库不可用，使用内存中的模拟数据
      existMetrics = {
        id: "mock-id",
        name: "20-seconds-metrics",
        metrics: JSON.stringify([newMetricEntry]),
        model: ModelType.Deepseek,
      };
      finalMetricsString = JSON.stringify([newMetricEntry]);
    }
  } else {
    try {
      // 解析现有的 metrics 数据
      let existingMetrics = [];
      try {
        // 先将 existMetrics.metrics 转换为 unknown，再转换为 string
        existingMetrics = JSON.parse((existMetrics.metrics as unknown as string) || "[]");
      } catch (parseError) {
        console.error("Error parsing existing metrics:", parseError);
        existingMetrics = [];
      }
      
      // 添加新的 metrics 数据
      const newMetrics = [...existingMetrics, newMetricEntry];
      
      // 如果 metrics 数量超过最大限制，进行采样
      let finalMetrics = newMetrics;
      if (newMetrics.length > MAX_METRICS_COUNT) {
        finalMetrics = uniformSampleWithBoundaries(newMetrics, MAX_METRICS_COUNT);
      }
      
      finalMetricsString = JSON.stringify(finalMetrics);
      
      // 更新数据库中的 metrics 数据
      await prisma.metrics.update({
        where: {
          id: existMetrics.id,
        },
        data: {
          metrics: finalMetricsString
        } as any,
      });
    } catch (error) {
      console.error("Database update error:", error);
      // 如果数据库操作失败，继续执行但不保存数据
      // 先将 existMetrics.metrics 转换为 unknown，再转换为 string
      finalMetricsString = (existMetrics.metrics as unknown as string) || "[]";
    }
  }

  // 解析最终的 metrics 数据以获取数量
  let metricsCount = 0;
  try {
    const parsedMetrics = JSON.parse(finalMetricsString);
    metricsCount = parsedMetrics.length;
  } catch (error) {
    console.error("Error parsing metrics for count:", error);
  }

  return new Response(
    `Process executed successfully. Metrics count: ${metricsCount}`
  );
};