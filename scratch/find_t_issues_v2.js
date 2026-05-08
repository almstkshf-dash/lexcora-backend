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
  
  // Use regex to find t( but not preceded by a word character (except potentially $ or _)
  // This helps avoid matching functionNamesEndingInT(
  if (/\bt\s*\(/.test(content)) {
    const hasDeclaration = content.includes('const { t } =') || 
                           content.includes('const {t} =') || 
                           content.includes('const t =') || 
                           content.includes('const t=') ||
                           content.includes('let t =') ||
                           content.includes('var t =') ||
                           content.includes('t = useTranslations') ||
                           /\(.*\bt\b.*\)/.test(content) || // passed as argument in function definition
                           /\{.*\bt\b.*\}/.test(content) || // passed as destructured prop
                           file.includes('useTranslations.js') || // the hook itself
                           file.includes('LanguageContext.js'); // might define it

    if (!hasDeclaration) {
      // Check if it's used in a way that suggests it's a global or imported (unlikely in this project)
      issues.push(file);
    }
  }
}

console.log('Files with t() usage but no local declaration found:');
issues.forEach(f => console.log(f));
