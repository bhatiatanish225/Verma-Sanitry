
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add our patched module to extraNodeModules
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'metro/src/ModuleGraph/worker/importLocationsPlugin': '/Users/siddhantgureja/Desktop/Verma-and-Co./frontend/temp-metro-patch/importLocationsPlugin.js'
};

module.exports = config;
