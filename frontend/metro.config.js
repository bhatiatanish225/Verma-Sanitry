// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for the importLocationsPlugin error
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Add additional modules to extraNodeModules
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'metro/src/ModuleGraph/worker/importLocationsPlugin': path.join(__dirname, 'importLocationsPlugin.js')
};

// Ensure we process all files in node_modules
config.watchFolders = [
  ...config.watchFolders || [],
  path.resolve(__dirname, 'node_modules')
];

// Disable minification for debugging
config.transformer.minifierConfig = {
  compress: false,
  mangle: false
};

module.exports = config;
