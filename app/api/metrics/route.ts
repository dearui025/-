import { prisma } from "@/lib/prisma";
import { ModelType } from "@prisma/client";
import { NextResponse } from "next/server";

// 最大返回数据点数量
const MAX_DATA_POINTS = 50;

/**
 * 从数组中均匀采样指定数量的元素
 * @param data - 原始数据数组
 * @param sampleSize - 需要采样的数量
 * @returns 均匀分布的采样数据
 */
function uniformSample<T>(data: T[], sampleSize: number): T[] {
  if (data.length <= sampleSize) {
    return data;
  }

  const result: T[] = [];
  const step = (data.length - 1) / (sampleSize - 1);

  for (let i = 0; i < sampleSize; i++) {
    const index = Math.round(i * step);
    result.push(data[index]);
  }

  return result;
}

export const GET = async () => {
  try {
    const metrics = await prisma.metrics.findFirst({
      where: {
        model: ModelType.Deepseek,
      },
    });

    if (!metrics) {
      return NextResponse.json({
        data: {
          metrics: [],
          totalCount: 0,
        },
        success: true,
      });
    }

    // 解析存储在字符串中的 metrics 数据
    let databaseMetrics = [];
    try {
      // 先将 metrics.metrics 转换为 unknown，再转换为 string
      databaseMetrics = JSON.parse((metrics.metrics as unknown as string) || "[]");
    } catch (error) {
      console.error("Error parsing metrics data:", error);
      databaseMetrics = [];
    }

    const metricsData = databaseMetrics
      .map((item: any) => {
        return {
          ...item.accountInformationAndPerformance,
          createdAt: item?.createdAt || new Date().toISOString(),
        };
      })
      .filter((item: any) => (item as any).availableCash > 0);

    // 均匀采样数据，最多返回 MAX_DATA_POINTS 条
    const sampledMetrics = uniformSample(metricsData, MAX_DATA_POINTS);

    console.log(
      `📊 Total metrics: ${metricsData.length}, Sampled: ${sampledMetrics.length}`
    );

    return NextResponse.json({
      data: {
        metrics: sampledMetrics,
        totalCount: metricsData.length,
        model: metrics?.model || ModelType.Deepseek,
        name: metrics?.name || "Deepseek Trading Bot",
        createdAt: metrics?.createdAt || new Date().toISOString(),
        updatedAt: metrics?.updatedAt || new Date().toISOString(),
      },
      success: true,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json({
      data: {
        metrics: [],
        totalCount: 0,
        model: ModelType.Deepseek,
        name: "Deepseek Trading Bot",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      success: true,
    });
  }
};