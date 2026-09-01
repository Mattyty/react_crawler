import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  onMenuPress: () => void;
  onTitlePress?: () => void;
}

export function Header({ onMenuPress, onTitlePress }: Props) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onMenuPress} hitSlop={8}>
        <Text style={styles.menuIcon}>☰</Text>
      </Pressable>
      <Pressable onPress={onTitlePress} hitSlop={8} style={styles.logoTextWrap} disabled={!onTitlePress}>
        <Text style={styles.logoLine1}>THE CITY</Text>
        <Text style={styles.logoLine2}>UNCOVERED</Text>
      </Pressable>
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
    backgroundColor: '#141417',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  menuIcon: { color: '#E1B12C', fontSize: 20, fontWeight: '200' },
  logoTextWrap: { justifyContent: 'center' },
  logoLine1: { color: '#FFFFFF', fontSize: 20, fontWeight: '300', letterSpacing: 1.5 },
  logoLine2: { color: '#E1B12C', fontSize: 20, fontWeight: '300', letterSpacing: 1.5 },
  spacer: { flex: 1 },
  logoImage: { width: 40, height: 40 },
});
