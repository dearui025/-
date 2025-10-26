// 调试指标数据格式
const https = require('https');

function debugMetrics() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/metrics',
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('API响应状态:', res.statusCode);
        console.log('响应数据结构:');
        console.log(JSON.stringify(response, null, 2));
        
        if (response.data && response.data.metrics && response.data.metrics.length > 0) {
          console.log('\n第一个数据点结构:');
          console.log(JSON.stringify(response.data.metrics[0], null, 2));
          
          // 检查必需的字段
          const firstMetric = response.data.metrics[0];
          console.log('\n字段检查:');
          console.log('- totalCashValue:', firstMetric.totalCashValue);
          console.log('- createdAt:', firstMetric.createdAt);
          console.log('- currentTotalReturn:', firstMetric.currentTotalReturn);
        }
      } catch (error) {
        console.error('解析响应时出错:', error);
        console.log('原始响应:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('请求失败:', error);
  });

  req.end();
}

debugMetrics();