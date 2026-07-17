const { withGradleProperties } = require('expo/config-plugins');

module.exports = function withKotlinVersion(config) {
  return withGradleProperties(config, (config) => {
    // Remove existing kotlinVersion if present
    config.modResults = config.modResults.filter(
      (item) => !(item.type === 'property' && item.key === 'kotlinVersion')
    );
    // Add kotlinVersion=2.1.20 to match prebuilt expo modules
    config.modResults.push({
      type: 'property',
      key: 'kotlinVersion',
      value: '2.1.20',
    });
    return config;
  });
};
