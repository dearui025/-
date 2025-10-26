// Next.js自定义服务器文件
// 用于确保cron任务在服务器启动时正确初始化
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import './cron'; // 导入并启动cron任务

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    // 处理请求
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const port = process.env.PORT || 3000;
  
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
    console.log('> Cron tasks have been initialized');
  });
});