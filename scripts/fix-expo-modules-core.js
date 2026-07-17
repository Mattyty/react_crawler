const fs = require('fs');
const path = require('path');

// Fix 1: CSSProps.kt - remove extra context parameter from BoxShadow.parse
const cssPropsPath = path.join(__dirname, '..', 'node_modules', 'expo-modules-core', 'android', 'src', 'main', 'java', 'expo', 'modules', 'kotlin', 'views', 'decorators', 'CSSProps.kt');

if (fs.existsSync(cssPropsPath)) {
  let content = fs.readFileSync(cssPropsPath, 'utf8');
  if (content.includes('BoxShadow.parse(shadows.getMap(i), view.context)')) {
    content = content.replace(
      'BoxShadow.parse(shadows.getMap(i), view.context)',
      'BoxShadow.parse(shadows.getMap(i))'
    );
    fs.writeFileSync(cssPropsPath, content);
    console.log('✅ Fixed CSSProps.kt - removed extra context parameter');
  } else {
    console.log('ℹ️ CSSProps.kt already patched or different version');
  }
}

// Fix 2: ReactNativeFeatureFlags.kt - remove reference to non-existent API
const flagsPath = path.join(__dirname, '..', 'node_modules', 'expo-modules-core', 'android', 'src', 'main', 'java', 'expo', 'modules', 'rncompatibility', 'ReactNativeFeatureFlags.kt');

if (fs.existsSync(flagsPath)) {
  let content = fs.readFileSync(flagsPath, 'utf8');
  if (content.includes('enableBridgelessArchitecture()')) {
    const patched = `package expo.modules.rncompatibility

/**
 * Compatibility helper - patched for RN 0.76.
 */
object ReactNativeFeatureFlags {
  val enableBridgelessArchitecture = false
}
`;
    fs.writeFileSync(flagsPath, patched);
    console.log('✅ Fixed ReactNativeFeatureFlags.kt');
  } else {
    console.log('ℹ️ ReactNativeFeatureFlags.kt already patched');
  }
}

console.log('✅ expo-modules-core patches applied');
