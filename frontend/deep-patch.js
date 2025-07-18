/**
 * Deep patch script for Metro bundler issues
 * This script directly modifies the problematic files in node_modules
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting deep patch process...');

// Function to find all instances of a file in node_modules
function findFiles(dir, filename, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules inside node_modules to avoid infinite recursion
      if (file !== 'node_modules') {
        findFiles(filePath, filename, results);
      }
    } else if (file === filename) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Create mock module content
const mockModuleContent = `
/**
 * Mock implementation for importLocationsPlugin
 * This is a patch to fix the build error
 */
module.exports = {
  createImportLocationsPlugin: () => ({
    visitor: {
      ImportDeclaration() {},
      ExportNamedDeclaration() {},
      ExportAllDeclaration() {}
    }
  })
};
`;

// Find all instances of reconcileTransformSerializerPlugin.js
const nodeModulesDir = path.join(__dirname, 'node_modules');
console.log('🔍 Searching for problematic files...');

// Create directory for the mock module
const metroModuleGraphDir = path.join(nodeModulesDir, 'metro', 'src', 'ModuleGraph', 'worker');
fs.mkdirSync(metroModuleGraphDir, { recursive: true });

// Create the mock module
const importLocationsPluginPath = path.join(metroModuleGraphDir, 'importLocationsPlugin.js');
fs.writeFileSync(importLocationsPluginPath, mockModuleContent);
console.log(`✅ Created mock module at: ${importLocationsPluginPath}`);

// Find all reconcileTransformSerializerPlugin.js files
const reconcileFiles = findFiles(nodeModulesDir, 'reconcileTransformSerializerPlugin.js');
console.log(`🔍 Found ${reconcileFiles.length} instances of reconcileTransformSerializerPlugin.js`);

// Patch each file
let patchCount = 0;
for (const filePath of reconcileFiles) {
  console.log(`🔧 Examining: ${filePath}`);
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the file imports the problematic module
  if (content.includes("require('metro/src/ModuleGraph/worker/importLocationsPlugin')")) {
    // Create backup
    const backupPath = `${filePath}.backup`;
    fs.writeFileSync(backupPath, content);
    console.log(`📦 Created backup at: ${backupPath}`);
    
    // Replace the import with inline mock
    const patchedContent = content.replace(
      "const importLocationsPlugin = require('metro/src/ModuleGraph/worker/importLocationsPlugin');",
      `// Patched by deep-patch.js
const importLocationsPlugin = {
  createImportLocationsPlugin: () => ({
    visitor: {
      ImportDeclaration() {},
      ExportNamedDeclaration() {},
      ExportAllDeclaration() {}
    }
  })
};`
    );
    
    // Write patched content
    fs.writeFileSync(filePath, patchedContent);
    console.log(`✅ Patched: ${filePath}`);
    patchCount++;
  }
}

console.log(`🎉 Patched ${patchCount} files successfully!`);

// Additional fix: create a symlink to ensure the module is found
try {
  // Find all metro-config directories
  const metroConfigDirs = findFiles(nodeModulesDir, 'metro-config').filter(p => fs.statSync(p).isDirectory());
  
  for (const dir of metroConfigDirs) {
    const targetDir = path.join(dir, 'node_modules', 'metro', 'src', 'ModuleGraph', 'worker');
    fs.mkdirSync(targetDir, { recursive: true });
    
    const targetFile = path.join(targetDir, 'importLocationsPlugin.js');
    fs.writeFileSync(targetFile, mockModuleContent);
    console.log(`✅ Created additional mock at: ${targetFile}`);
  }
} catch (error) {
  console.error('⚠️ Error creating additional mocks:', error);
}

console.log('🏁 Deep patch process completed!');
