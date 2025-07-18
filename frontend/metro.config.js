// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for the importLocationsPlugin error
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Create a mock for the missing module
const mockDir = path.join(__dirname, '.metro-mock');
if (!fs.existsSync(mockDir)) {
  fs.mkdirSync(mockDir, { recursive: true });
}

const mockModulePath = path.join(mockDir, 'importLocationsPlugin.js');
if (!fs.existsSync(mockModulePath)) {
  fs.writeFileSync(mockModulePath, `
    // Mock implementation for importLocationsPlugin
    module.exports = {
      createImportLocationsPlugin: () => ({
        visitor: {
          ImportDeclaration() {},
          ExportNamedDeclaration() {},
          ExportAllDeclaration() {}
        }
      })
    };
  `);
}

// Add the mock to extraNodeModules
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'metro/src/ModuleGraph/worker/importLocationsPlugin': mockModulePath
};

// Ensure we process all files in node_modules
config.watchFolders = [
  ...config.watchFolders || [],
  path.resolve(__dirname, 'node_modules'),
  mockDir
];

// Disable minification for debugging
config.transformer.minifierConfig = {
  compress: false,
  mangle: false
};

module.exports = config;
