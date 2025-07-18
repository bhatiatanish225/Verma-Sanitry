// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);

// Configure resolver to include web and native extensions
defaultConfig.resolver.sourceExts = [...defaultConfig.resolver.sourceExts, 'mjs', 'web.js', 'web.ts', 'web.tsx'];
defaultConfig.resolver.assetExts = [...defaultConfig.resolver.assetExts, 'bin'];

module.exports = defaultConfig; 