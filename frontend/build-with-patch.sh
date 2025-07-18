#!/bin/bash

# Custom build script with Metro patching
echo "🔧 Starting custom build process with Metro patching..."

# Create directory for the mock module
METRO_DIR="node_modules/metro/src/ModuleGraph/worker"
mkdir -p "$METRO_DIR"

# Create the mock module
echo "✅ Creating mock importLocationsPlugin module..."
cat > "$METRO_DIR/importLocationsPlugin.js" << 'EOF'
/**
 * Mock implementation for importLocationsPlugin
 * This is a patch to fix the build error
 */
module.exports = {
  createImportLocationsPlugin: () => ({
    visitor: {
      ImportDeclaration() {},
      ExportNamedDeclaration() {},
      ExportAllDeclaration() {}
    }
  })
};
EOF

# Find and patch the problematic file
RECONCILE_FILE=$(find node_modules -name "reconcileTransformSerializerPlugin.js" | head -n 1)
if [ -n "$RECONCILE_FILE" ]; then
  echo "✅ Found reconcileTransformSerializerPlugin.js at: $RECONCILE_FILE"
  
  # Create backup
  cp "$RECONCILE_FILE" "$RECONCILE_FILE.backup"
  
  # Replace the problematic import
  sed -i '' 's/const importLocationsPlugin = require(.metro\/src\/ModuleGraph\/worker\/importLocationsPlugin.);/const importLocationsPlugin = { createImportLocationsPlugin: () => ({ visitor: { ImportDeclaration() {}, ExportNamedDeclaration() {}, ExportAllDeclaration() {} } }) };/g' "$RECONCILE_FILE"
  
  echo "✅ Patched $RECONCILE_FILE"
else
  echo "⚠️ Could not find reconcileTransformSerializerPlugin.js"
fi

# Run the build
echo "🚀 Starting EAS build..."
npx eas build -p android --profile preview

# Restore backup if it exists
if [ -f "$RECONCILE_FILE.backup" ]; then
  mv "$RECONCILE_FILE.backup" "$RECONCILE_FILE"
  echo "✅ Restored backup of $RECONCILE_FILE"
fi

echo "🏁 Build process completed!"
