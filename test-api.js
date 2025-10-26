import http from 'http';

// 发送GET请求到API
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/metrics',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Headers:', res.headers);
    console.log('Response Body:', data);
    
    try {
      const jsonData = JSON.parse(data);
      console.log('Success:', jsonData.success);
      console.log('Metrics Count:', jsonData.data?.metrics?.length || 0);
      if (jsonData.data?.metrics?.length > 0) {
        console.log('Sample Metric:', jsonData.data.metrics[0]);
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
});

req.end();