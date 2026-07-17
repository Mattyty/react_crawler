const fs = require('fs');
const path = require('path');

// Fix build.gradle - pin Kotlin version
const buildGradlePath = path.join(__dirname, '..', 'android', 'build.gradle');
if (fs.existsSync(buildGradlePath)) {
  let content = fs.readFileSync(buildGradlePath, 'utf8');
  
  if (content.includes("classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')")) {
    content = content.replace(
      "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')",
      "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:2.0.21')"
    );
    fs.writeFileSync(buildGradlePath, content);
    console.log('✅ Fixed build.gradle - pinned Kotlin to 2.0.21');
  } else {
    console.log('ℹ️ build.gradle already has Kotlin version pinned');
  }
}

// Fix gradle.properties - add kotlinVersion
const gradlePropsPath = path.join(__dirname, '..', 'android', 'gradle.properties');
if (fs.existsSync(gradlePropsPath)) {
  let props = fs.readFileSync(gradlePropsPath, 'utf8');
  if (!props.includes('kotlinVersion=')) {
    props += '\nkotlinVersion=2.0.21\n';
    fs.writeFileSync(gradlePropsPath, props);
    console.log('✅ Added kotlinVersion=2.0.21 to gradle.properties');
  } else {
    console.log('ℹ️ gradle.properties already has kotlinVersion');
  }
}

// Remove enableBundleCompression if present
const appBuildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');
if (fs.existsSync(appBuildGradlePath)) {
  let appContent = fs.readFileSync(appBuildGradlePath, 'utf8');
  if (appContent.includes('enableBundleCompression')) {
    appContent = appContent.replace(/\s*enableBundleCompression.*\n/, '\n');
    fs.writeFileSync(appBuildGradlePath, appContent);
    console.log('✅ Removed enableBundleCompression from app/build.gradle');
  }
}

// Fix settings.gradle - force Kotlin plugin version in pluginManagement
const settingsGradlePath = path.join(__dirname, '..', 'android', 'settings.gradle');
if (fs.existsSync(settingsGradlePath)) {
  let settings = fs.readFileSync(settingsGradlePath, 'utf8');
  if (!settings.includes('resolutionStrategy')) {
    // Add resolution strategy at the top of pluginManagement
    const insertion = `
pluginManagement {
    resolutionStrategy {
        eachPlugin {
            if (requested.id.id == "org.jetbrains.kotlin.android") {
                useVersion("2.0.21")
            }
        }
    }
}
`;
    // If pluginManagement already exists, inject resolutionStrategy into it
    if (settings.includes('pluginManagement {')) {
      settings = settings.replace(
        'pluginManagement {',
        `pluginManagement {
    resolutionStrategy {
        eachPlugin {
            if (requested.id.id == "org.jetbrains.kotlin.android") {
                useVersion("2.0.21")
            }
        }
    }`
      );
    }
    fs.writeFileSync(settingsGradlePath, settings);
    console.log('✅ Added Kotlin resolution strategy to settings.gradle');
  }
}

console.log('✅ Kotlin version fix complete');
