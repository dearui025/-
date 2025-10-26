import { prisma } from "@/lib/prisma";
import { ModelType } from "@prisma/client";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
    // 检查是否存在测试数据文件
    const testMetricsPath = path.join(process.cwd(), 'prisma', 'test-metrics.json');
    let metrics;
    
    try {
      if (fs.existsSync(testMetricsPath)) {
        const testMetricsData = JSON.parse(fs.readFileSync(testMetricsPath, 'utf8'));
        metrics = testMetricsData;
        console.log('Using test metrics data');
      } else {
        metrics = await prisma.metrics.findFirst({
          where: {
            model: ModelType.Deepseek,
          },
        });
      }
    } catch (error) {
      console.log('Error reading test metrics, falling back to database');
      metrics = await prisma.metrics.findFirst({
        where: {
          model: ModelType.Deepseek,
        },
      });
    }

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

    // 处理数据，确保格式正确
    const processedMetrics = databaseMetrics.map((item: any) => {
      // 正确映射数据结构，确保所有字段都在顶层
      const mappedItem = {
        ...item.accountInformationAndPerformance,
        createdAt: item?.createdAt || new Date().toISOString(),
      };
      
      // 确保 positions 字段是数组
      if (typeof mappedItem.positions === 'string') {
        try {
          mappedItem.positions = JSON.parse(mappedItem.positions);
        } catch (e) {
          mappedItem.positions = [];
        }
      }
      
      // 确保所有数值字段都是数字类型
      mappedItem.totalCashValue = Number(mappedItem.totalCashValue);
      mappedItem.availableCash = Number(mappedItem.availableCash);
      mappedItem.currentTotalReturn = Number(mappedItem.currentTotalReturn);
      mappedItem.currentPositionsValue = Number(mappedItem.currentPositionsValue);
      mappedItem.contractValue = Number(mappedItem.contractValue);
      mappedItem.sharpeRatio = Number(mappedItem.sharpeRatio);
      
      return mappedItem;
    });

    // 过滤掉无效数据，但放宽条件
    const metricsData = processedMetrics.filter((item: any) => {
      // 检查必要字段是否存在且有效
      const hasValidData = (
        typeof item.totalCashValue === 'number' && 
        !isNaN(item.totalCashValue) && 
        isFinite(item.totalCashValue) &&
        item.createdAt
      );
      
      // 如果availableCash <= 0，我们仍然保留数据，因为这可能是有效的交易状态
      return hasValidData;
    });

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