/**
 * Custom build script to bypass Metro bundler issues
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting custom Android build process...');

// Step 1: Create a temporary directory for patched files
const tempDir = path.join(__dirname, 'temp-metro-patch');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Step 2: Create a patched version of the problematic file
const patchedFile = `
// Patched version of importLocationsPlugin
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

const patchedFilePath = path.join(tempDir, 'importLocationsPlugin.js');
fs.writeFileSync(patchedFilePath, patchedFile);

console.log('✅ Created patched importLocationsPlugin file');

// Step 3: Create a modified metro.config.js that uses our patched file
const metroConfig = `
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add our patched module to extraNodeModules
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'metro/src/ModuleGraph/worker/importLocationsPlugin': '${patchedFilePath.replace(/\\/g, '\\\\')}'
};

module.exports = config;
`;

const metroConfigPath = path.join(tempDir, 'metro.config.js');
fs.writeFileSync(metroConfigPath, metroConfig);

console.log('✅ Created patched metro.config.js');

// Step 4: Run the build with our patched configuration
try {
  console.log('🔨 Building Android app with patched configuration...');
  execSync(`METRO_CONFIG_PATH=${metroConfigPath} npx expo build:android`, { 
    stdio: 'inherit',
    env: {
      ...process.env,
      METRO_CONFIG_PATH: metroConfigPath
    }
  });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} finally {
  // Clean up temporary files
  console.log('🧹 Cleaning up temporary files...');
  fs.rmSync(tempDir, { recursive: true, force: true });
}
