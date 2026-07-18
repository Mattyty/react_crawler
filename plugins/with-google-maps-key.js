const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withGoogleMapsKey(config) {
  return withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];
    if (!mainApplication) return config;

    // Ensure meta-data array exists
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
        'android:value': 'AIzaSyDo9TG7H0t2ACrWHBg6BLhR_oS9DPyKTo8',
      },
    });

    return config;
  });
};
