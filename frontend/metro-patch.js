/**
 * This is a patch for the Metro bundler to fix the importLocationsPlugin error
 */

// Mock the importLocationsPlugin module
const mockImportLocationsPlugin = {
  createImportLocationsPlugin: () => ({
    visitor: {
      ImportDeclaration() {},
      ExportNamedDeclaration() {},
      ExportAllDeclaration() {}
    }
  })
};

// Register the mock module
require.cache[require.resolve('metro/src/ModuleGraph/worker/importLocationsPlugin')] = {
  id: require.resolve('metro/src/ModuleGraph/worker/importLocationsPlugin'),
  filename: require.resolve('metro/src/ModuleGraph/worker/importLocationsPlugin'),
  loaded: true,
  exports: mockImportLocationsPlugin
};
