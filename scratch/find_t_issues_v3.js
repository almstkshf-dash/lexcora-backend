const fs = require('fs');
const path = require('path');

function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
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
  const lines = content.split('\n');
  
  let hasTCall = false;
  let hasDeclaration = content.includes('const { t } =') || 
                       content.includes('const {t} =') || 
                       content.includes('const t =') || 
                       content.includes('const t=') ||
                       content.includes('let t =') ||
                       content.includes('var t =') ||
                       content.includes('t = useTranslations') ||
                       /\(.*\bt\b.*\)/.test(content) || 
                       /\{.*\bt\b.*\}/.test(content) || 
                       file.includes('useTranslations.js') || 
                       file.includes('LanguageContext.js') ||
                       file.includes('config.js') ||
                       file.includes('.test.js');

  if (hasDeclaration) continue;

  for (let i = 0; i < lines.length; i++) {
    if (/\bt\s*\(/.test(lines[i])) {
      issues.push({ file, line: i + 1, content: lines[i].trim() });
    }
  }
}

console.log(JSON.stringify(issues, null, 2));
