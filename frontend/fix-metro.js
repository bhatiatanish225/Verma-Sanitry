/**
 * This script attempts to fix the Metro bundler issue by creating a symlink
 * for the missing module and ensuring consistent versions
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting Metro fix process...');

// Create directories for our fix
const metroDir = path.join(__dirname, 'node_modules', 'metro', 'src', 'ModuleGraph', 'worker');
if (!fs.existsSync(metroDir)) {
  fs.mkdirSync(metroDir, { recursive: true });
  console.log('✅ Created directory structure:', metroDir);
}

// Create the missing module
const importLocationsPluginPath = path.join(metroDir, 'importLocationsPlugin.js');
const mockContent = `
/**
 * Mock implementation for the missing importLocationsPlugin module
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

fs.writeFileSync(importLocationsPluginPath, mockContent);
console.log('✅ Created mock importLocationsPlugin module at:', importLocationsPluginPath);

// Update package.json to use consistent Metro versions
try {
  console.log('📦 Updating package.json to use consistent Metro versions...');
  
  // Read package.json
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Update Metro version to be consistent
  if (packageJson.dependencies.metro) {
    packageJson.dependencies.metro = "0.76.8";
    console.log('✅ Updated Metro version to 0.76.8');
  }
  
  // Add resolutions for Metro packages to force consistent versions
  packageJson.resolutions = {
    ...packageJson.resolutions,
    "metro": "0.76.8",
    "metro-config": "0.76.8",
    "metro-core": "0.76.8",
    "metro-runtime": "0.76.8",
    "metro-source-map": "0.76.8",
    "metro-transform-worker": "0.76.8"
  };
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json with resolutions for Metro packages');
  
  // Install dependencies with the updated package.json
  console.log('📦 Reinstalling dependencies with consistent versions...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies reinstalled successfully');
  
} catch (error) {
  console.error('❌ Error updating package.json:', error);
}

console.log('🏁 Metro fix process completed. Try building your app now!');
