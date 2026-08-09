const fs = require('fs');
const path = require('path');

function rec(p) {
  try {
    if (p.includes('node_modules') || p.includes('.git') || p.includes('dist') || p.includes('.next')) return;
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      fs.readdirSync(p).forEach(f => rec(path.join(p, f)));
    } else if (stat.isFile() && p.endsWith('schema.prisma')) {
      console.log('PRISMA_SCHEMA:', p);
    }
  } catch(e) {}
}
rec('.');
