import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  onMenuPress: () => void;
}

export function Header({ onMenuPress }: Props) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onMenuPress} hitSlop={8}>
        <Text style={styles.menuIcon}>☰</Text>
      </Pressable>
      <Text style={styles.logo}>CRAWLER</Text>
      <View style={styles.spacer} />
      <Image
        source={require('@/assets/images/crawler-logo.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#121212',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  menuIcon: { color: '#E1B12C', fontSize: 26 },
  logo: { color: '#E1B12C', fontSize: 22, fontWeight: '700' },
  spacer: { flex: 1 },
  logoImage: { width: 40, height: 40 },
});
