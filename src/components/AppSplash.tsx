import React from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

export function AppSplash() {
  return (
    <View style={styles.container}>
      {/* Logo centred */}
      <Image
        source={require('@/assets/images/spinner-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Spinner in front of logo */}
      <View style={styles.spinnerArea}>
        <ActivityIndicator size="large" color="#E1B12C" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141417',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerArea: {
    position: 'absolute',
    top: '30%',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 160,
  },
});
