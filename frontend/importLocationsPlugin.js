/**
 * This is a shim file to fix the missing importLocationsPlugin module error
 * It provides a minimal implementation of the missing module
 */

module.exports = {
  worker: {
    importLocationsPlugin: {
      createImportLocationsPlugin: () => ({
        visitor: {
          ImportDeclaration() {},
          ExportNamedDeclaration() {},
          ExportAllDeclaration() {}
        }
      })
    }
  }
};
