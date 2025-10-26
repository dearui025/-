import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ModelType } from "@prisma/client";

export const GET = async (request: NextRequest) => {
  try {
    console.log("获取聊天记录...");
    
    const chat = await prisma.chat.findMany({
      where: {
        model: ModelType.Deepseek,
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        tradings: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    console.log(`找到 ${chat.length} 条聊天记录`);
    
    return NextResponse.json({
      data: chat,
    });
  } catch (error: any) {
    console.error("获取聊天记录时出错:", error);
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
};