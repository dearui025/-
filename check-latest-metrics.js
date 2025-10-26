import fs from 'fs';

try {
  const data = JSON.parse(fs.readFileSync('prisma/test-metrics.json', 'utf8'));
  const metrics = JSON.parse(data.metrics);
  
  console.log('最新5条数据:');
  const latestMetrics = metrics.slice(-5);
  latestMetrics.forEach((m, i) => {
    console.log(`  ${i+1}. 时间: ${m.createdAt}`);
    console.log(`     持仓价值: ${m.accountInformationAndPerformance.currentPositionsValue}`);
    console.log(`     总价值: ${m.accountInformationAndPerformance.totalCashValue}`);
    console.log(`     可用现金: ${m.accountInformationAndPerformance.availableCash}`);
    console.log(`     持仓详情: ${JSON.stringify(m.accountInformationAndPerformance.positions)}`);
    console.log('');
  });
} catch (error) {
  console.error('解析数据时出错:', error.message);
}