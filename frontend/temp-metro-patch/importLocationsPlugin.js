
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
