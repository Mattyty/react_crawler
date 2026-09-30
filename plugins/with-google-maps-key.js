// Config plugin: injects the Google Maps Android API key into AndroidManifest.
//
// react-native-maps on Android uses the Google Maps SDK as the host view for
// MapView, even when we only render our own UrlTile (MapTiler) overlay on top.
// Without this key the native map fails to initialise and the app crashes when
// opening the map tab. The Maps SDK for Android has unlimited free map loads,
// so this does not incur per-load cost (unlike the Static Maps API).
const { withAndroidManifest } = require('expo/config-plugins');

const GOOGLE_MAPS_ANDROID_KEY = 'AIzaSyDo9TG7H0t2ACrWHBg6BLhR_oS9DPyKTo8';

module.exports = function withGoogleMapsKey(config) {
  return withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];
    if (!mainApplication) {
      return config;
    }

    if (!mainApplication['meta-data']) {
      mainApplication['meta-data'] = [];
    }

    // Remove existing Google Maps key entry if present
    mainApplication['meta-data'] = mainApplication['meta-data'].filter(
      (item) => item.$?.['android:name'] !== 'com.google.android.geo.API_KEY'
    );

    // Add the Google Maps API key
    mainApplication['meta-data'].push({
      $: {
        'android:name': 'com.google.android.geo.API_KEY',
        'android:value': GOOGLE_MAPS_ANDROID_KEY,
      },
    });

    return config;
  });
};
