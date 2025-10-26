const os = require('os');

console.log('=== 系统资源检查 ===');
console.log('操作系统:', os.type(), os.release());
console.log('CPU架构:', os.arch());
console.log('CPU核心数:', os.cpus().length);
console.log('总内存:', Math.round(os.totalmem() / 1024 / 1024 / 1024), 'GB');
console.log('空闲内存:', Math.round(os.freemem() / 1024 / 1024 / 1024), 'GB');
console.log('使用内存:', Math.round((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024), 'GB');
console.log('内存使用率:', Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100), '%');

// 检查页面文件信息
const exec = require('child_process').exec;
exec('wmic pagefileset get InitialSize,MaximumSize', (error, stdout, stderr) => {
  if (!error) {
    console.log('\n=== 页面文件信息 ===');
    console.log(stdout);
  }
});