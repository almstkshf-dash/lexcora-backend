const fs = require('fs');
const path = require('path');

function walk(dir, results = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walk(filePath, results);
      }
    } else {
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        results.push(filePath);
      }
    }
  }
  return results;
}

const frontendPath = 'c:\\Users\\ceo\\OneDrive\\Desktop\\ليكسورا\\lexcora\\lexcora-frontend\\src';
const files = walk(frontendPath);

const issues = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('t(')) {
    const hasDeclaration = content.includes('const { t } =') || 
                           content.includes('const t =') || 
                           content.includes('const {t} =') || 
                           content.includes('const t=') ||
                           content.includes('let t =') ||
                           content.includes('var t =') ||
                           content.includes('t = useTranslations') ||
                           content.includes('(t)') || // passed as argument
                           content.includes(', t)') || // passed as argument
                           content.includes(' t,') || // passed as argument
                           content.includes(' t)') || // passed as argument
                           file.includes('useTranslations.js'); // the hook itself

    if (!hasDeclaration) {
      issues.push(file);
    }
  }
}

console.log('Files with t() usage but no visible declaration:');
issues.forEach(f => console.log(f));
