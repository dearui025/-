import cron from "node-cron";
import jwt from "jsonwebtoken";

const runMetricsInterval = async () => {
  console.log("Running task 20 seconds metrics interval");
  const token = jwt.sign(
    {
      sub: "cron-token",
    },
    process.env.CRON_SECRET_KEY || ""
  );

  await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/cron/20-seconds-metrics-interval?token=${token}`,
    {
      method: "GET",
    }
  );

  console.log("20 seconds metrics interval executed");
};

// every 20 seconds
cron.schedule("*/10 * * * * *", async () => {
  await runMetricsInterval();
});

const runChatInterval = async () => {
  console.log("Running task every 3 minutes");
  const token = jwt.sign(
    {
      sub: "cron-token",
    },
    process.env.CRON_SECRET_KEY || ""
  );

  await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/cron/3-minutes-run-interval?token=${token}`,
    {
      method: "GET",
    }
  );
};

// every 3 minutes
cron.schedule("*/3 * * * *", async () => {
  await runChatInterval();
});

// 立即执行一次任务以确保初始化
console.log("Initializing cron tasks...");
// 移除直接的await调用，改为使用setTimeout确保不会阻塞模块加载
setTimeout(() => {
  runChatInterval().catch(console.error);
}, 1000);

export { runMetricsInterval, runChatInterval };