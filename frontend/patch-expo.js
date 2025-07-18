/**
 * This script patches the Expo Metro configuration to resolve the importLocationsPlugin issue
 */
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Expo patch process...');

// Path to the problematic file
const reconcilePluginPath = path.join(
  __dirname, 
  'node_modules', 
  '@expo', 
  'metro-config', 
  'build', 
  'serializer', 
  'reconcileTransformSerializerPlugin.js'
);

// Check if the file exists
if (!fs.existsSync(reconcilePluginPath)) {
  console.error('❌ Could not find the file to patch:', reconcilePluginPath);
  process.exit(1);
}

// Read the file content
let content = fs.readFileSync(reconcilePluginPath, 'utf8');

// Check if the file contains the problematic import
if (content.includes("require('metro/src/ModuleGraph/worker/importLocationsPlugin')")) {
  console.log('✅ Found the problematic import, patching...');
  
  // Create a mock implementation
  const mockImplementation = `
// Mock implementation for importLocationsPlugin
const importLocationsPlugin = {
  createImportLocationsPlugin: () => ({
    visitor: {
      ImportDeclaration() {},
      ExportNamedDeclaration() {},
      ExportAllDeclaration() {}
    }
  })
};
`;

  // Replace the problematic import with our mock
  content = content.replace(
    "const importLocationsPlugin = require('metro/src/ModuleGraph/worker/importLocationsPlugin');",
    mockImplementation
  );

  // Write the patched file
  fs.writeFileSync(reconcilePluginPath, content, 'utf8');
  console.log('✅ Successfully patched the file!');
} else {
  console.log('⚠️ Could not find the problematic import in the file.');
}

console.log('🏁 Patch process completed.');
