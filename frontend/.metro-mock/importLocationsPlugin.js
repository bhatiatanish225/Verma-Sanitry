
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
  