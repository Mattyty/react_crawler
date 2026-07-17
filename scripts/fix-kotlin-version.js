const fs = require('fs');
const path = require('path');

// Fix build.gradle - pin Kotlin version
const buildGradlePath = path.join(__dirname, '..', 'android', 'build.gradle');
if (fs.existsSync(buildGradlePath)) {
  let content = fs.readFileSync(buildGradlePath, 'utf8');
  
  // Replace the buildscript to pin Kotlin version
  const oldBuildscript = `buildscript {
  repositories {
    google()
    mavenCentral()
  }
  dependencies {
    classpath('com.android.tools.build:gradle')
    classpath('com.facebook.react:react-native-gradle-plugin')
    classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')
  }
}`;

  const newBuildscript = `buildscript {
  ext {
    kotlinVersion = findProperty('kotlinVersion') ?: '2.0.21'
  }
  repositories {
    google()
    mavenCentral()
  }
  dependencies {
    classpath('com.android.tools.build:gradle')
    classpath('com.facebook.react:react-native-gradle-plugin')
    classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:\$kotlinVersion")
  }
}`;

  if (content.includes("classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')")) {
    content = content.replace(oldBuildscript, newBuildscript);
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

console.log('✅ Kotlin version fix complete');
