const fs = require('fs');
const path = require('path');

const localesDir = 'messages';
const locales = fs.readdirSync(localesDir).map(file => file.replace('.json', ''));

// Helper function to get all nested keys from an object
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Helper function to count keys in each section
function countSectionKeys(content) {
  const sections = {};
  for (const section in content) {
    if (typeof content[section] === 'object' && content[section] !== null) {
      sections[section] = Object.keys(content[section]).length;
    }
  }
  return sections;
}

console.log('Checking translation files...\n');

// Get English content as reference
const enPath = path.join(localesDir, 'en.json');
const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const enSections = Object.keys(enContent);
const enAllKeys = getAllKeys(enContent);

console.log(`English (reference): ${enAllKeys.length} total keys`);
enSections.forEach(section => {
  const sectionKeys = Object.keys(enContent[section]).length;
  console.log(`  ${section}: ${sectionKeys} keys`);
});

console.log('\nOther languages:');
locales.forEach(locale => {
  if (locale === 'en') return;

  const filePath = path.join(localesDir, `${locale}.json`);
  if (fs.existsSync(filePath)) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const allKeys = getAllKeys(content);
    const sections = countSectionKeys(content);

    console.log(`${locale}: ${allKeys.length} total keys`);
    Object.keys(sections).forEach(section => {
      console.log(`  ${section}: ${sections[section]} keys`);
    });
  }
});

console.log('\nChecking for missing keys and sections...\n');

locales.forEach(locale => {
  if (locale === 'en') return;

  const filePath = path.join(localesDir, `${locale}.json`);
  if (fs.existsSync(filePath)) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const allKeys = getAllKeys(content);
    const missingSections = [];
    const missingKeys = [];

    // Check for missing sections
    enSections.forEach(section => {
      if (!content[section]) {
        missingSections.push(section);
      } else {
        // Check for missing keys in each section
        const enSectionKeys = Object.keys(enContent[section]);
        const localeSectionKeys = Object.keys(content[section]);
        const missingSectionKeys = enSectionKeys.filter(key => !localeSectionKeys.includes(key));

        if (missingSectionKeys.length > 0) {
          missingSectionKeys.forEach(key => {
            missingKeys.push(`${section}.${key}`);
          });
        }
      }
    });

    // Check for extra keys that don't exist in English
    const extraKeys = allKeys.filter(key => !enAllKeys.includes(key));

    if (missingSections.length > 0 || missingKeys.length > 0 || extraKeys.length > 0) {
      console.log(`${locale}:`);
      if (missingSections.length > 0) {
        console.log(`  ❌ Missing sections: ${missingSections.join(', ')}`);
      }
      if (missingKeys.length > 0) {
        console.log(`  ❌ Missing keys: ${missingKeys.join(', ')}`);
      }
      if (extraKeys.length > 0) {
        console.log(`  ⚠️  Extra keys: ${extraKeys.join(', ')}`);
      }
    } else {
      console.log(`${locale}: ✅ All keys present and synchronized`);
    }
  } else {
    console.log(`${locale}: ❌ Translation file not found`);
  }
});
