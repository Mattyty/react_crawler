const fs = require('fs');
const path = require('path');

const KOTLIN_VERSION = '2.1.20';

// Fix build.gradle - pin Kotlin version
const buildGradlePath = path.join(__dirname, '..', 'android', 'build.gradle');
if (fs.existsSync(buildGradlePath)) {
  let content = fs.readFileSync(buildGradlePath, 'utf8');

  // Replace any hardcoded Kotlin plugin version
  const kotlinPluginRegex = /classpath\(['"]org\.jetbrains\.kotlin:kotlin-gradle-plugin(?::[\d.]+)?['"]\)/;
  if (kotlinPluginRegex.test(content)) {
    content = content.replace(
      kotlinPluginRegex,
      `classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:${KOTLIN_VERSION}')`
    );
    fs.writeFileSync(buildGradlePath, content);
    console.log(`✅ Fixed build.gradle - pinned Kotlin to ${KOTLIN_VERSION}`);
  } else {
    console.log('ℹ️ build.gradle Kotlin plugin classpath not found (may use version catalog)');
  }
}

// Fix gradle.properties - ensure kotlinVersion is set
const gradlePropsPath = path.join(__dirname, '..', 'android', 'gradle.properties');
if (fs.existsSync(gradlePropsPath)) {
  let props = fs.readFileSync(gradlePropsPath, 'utf8');
  if (props.includes('kotlinVersion=')) {
    props = props.replace(/kotlinVersion=.*/, `kotlinVersion=${KOTLIN_VERSION}`);
  } else {
    props += `\nkotlinVersion=${KOTLIN_VERSION}\n`;
  }
  fs.writeFileSync(gradlePropsPath, props);
  console.log(`✅ Set kotlinVersion=${KOTLIN_VERSION} in gradle.properties`);
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
  // Update existing version reference if present
  if (settings.includes('resolutionStrategy')) {
    settings = settings.replace(/useVersion\(["'][\d.]+["']\)/g, `useVersion("${KOTLIN_VERSION}")`);
    fs.writeFileSync(settingsGradlePath, settings);
    console.log(`✅ Updated Kotlin resolution strategy to ${KOTLIN_VERSION}`);
  } else if (settings.includes('pluginManagement {')) {
    settings = settings.replace(
      'pluginManagement {',
      `pluginManagement {
    resolutionStrategy {
        eachPlugin {
            if (requested.id.id == "org.jetbrains.kotlin.android") {
                useVersion("${KOTLIN_VERSION}")
            }
        }
    }`
    );
    fs.writeFileSync(settingsGradlePath, settings);
    console.log(`✅ Added Kotlin resolution strategy to settings.gradle`);
  }
}

console.log(`✅ Kotlin version fix complete (${KOTLIN_VERSION})`);
