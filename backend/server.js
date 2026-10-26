require('dotenv').config();
const createApp = require('./src/app');

const PORT = process.env.PORT || 5000;
const app = createApp();

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔═══════════════════════════════════════════════════╗');
  console.log('  ║                                                   ║');
  console.log('  ║   🎬  CineBook API Server                        ║');
  console.log(`  ║   🌐  http://localhost:${PORT}                     ║`);
  console.log(`  ║   💊  http://localhost:${PORT}/api/health           ║`);
  console.log(`  ║   🌍  Environment: ${(process.env.NODE_ENV || 'development').padEnd(20)}     ║`);
  console.log('  ║                                                   ║');
  console.log('  ║   ⚠️  JSON file storage — not for production      ║');
  console.log('  ║                                                   ║');
  console.log('  ╚═══════════════════════════════════════════════════╝');
  console.log('');
});
