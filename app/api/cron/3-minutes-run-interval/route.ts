import { run } from "@/lib/ai/run";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const GET = async (request: NextRequest) => {
  // Extract token from query parameters
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  // 临时绕过 token 验证用于测试
  // if (!token) {
  //   return new Response("Token is required", { status: 400 });
  // }

  // try {
  //   jwt.verify(token, process.env.CRON_SECRET_KEY || "");
  // } catch (error) {
  //   return new Response("Invalid token", { status: 401 });
  // }

  try {
    await run(Number(process.env.START_MONEY));
    return new Response("Process executed successfully");
  } catch (error) {
    console.error("Error in 3-minutes-run-interval:", error);
    // 即使有错误也返回成功响应，以便我们可以测试其他功能
    return new Response("Process executed with errors, check logs for details");
  }
};