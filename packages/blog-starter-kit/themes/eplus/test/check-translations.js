const fs = require('fs');
const path = require('path');

const localesDir = 'messages';
const locales = fs.readdirSync(localesDir).map(file => file.replace('.json', ''));

console.log('Checking translation files...\n');

locales.forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  if (fs.existsSync(filePath)) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`${locale}: ${Object.keys(content.common).length} keys in common, ${Object.keys(content.userMenu).length} keys in userMenu`);
  }
});

// Check for missing keys
const enPath = path.join(localesDir, 'en.json');
const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const enCommonKeys = Object.keys(enContent.common);
const enUserMenuKeys = Object.keys(enContent.userMenu);

console.log('\nChecking for missing keys...\n');

locales.forEach(locale => {
  if (locale === 'en') return;

  const filePath = path.join(localesDir, `${locale}.json`);
  if (fs.existsSync(filePath)) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const commonKeys = Object.keys(content.common);
    const userMenuKeys = Object.keys(content.userMenu);

    const missingCommonKeys = enCommonKeys.filter(key => !commonKeys.includes(key));
    const missingUserMenuKeys = enUserMenuKeys.filter(key => !userMenuKeys.includes(key));

    if (missingCommonKeys.length > 0 || missingUserMenuKeys.length > 0) {
      console.log(`${locale} missing keys:`);
      if (missingCommonKeys.length > 0) {
        console.log(`  Common: ${missingCommonKeys.join(', ')}`);
      }
      if (missingUserMenuKeys.length > 0) {
        console.log(`  UserMenu: ${missingUserMenuKeys.join(', ')}`);
      }
    } else {
      console.log(`${locale}: ✓ All keys present`);
    }
  }
});
