import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Bar } from '@/lib/types';

interface Props {
  bars: Bar[];
  onPress: (bar: Bar) => void;
}

export function FlashSection({ bars, onPress }: Props) {
  return (
    <FlatList
      horizontal
      data={bars}
      keyExtractor={(item) => String(item.id)}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 6, paddingTop: 12 }}
      renderItem={({ item }) => (
        <Pressable onPress={() => onPress(item)} style={styles.flashCard}>
          <Image source={{ uri: item.image_url || 'https://picsum.photos/300/180' }} style={styles.flashImage} />
          <View style={styles.flashOverlay}>
            <Text style={styles.flashName}>{item.name}</Text>
            <Text style={styles.flashDesc}>{item.flash_description || 'Flash deal!'}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  flashCard: { width: 300, height: 180, borderRadius: 12, overflow: 'hidden', marginRight: 12 },
  flashImage: { width: '100%', height: '100%' },
  flashOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(18,18,18,0.6)',
    padding: 12,
  },
  flashName: { color: '#E1B12C', fontSize: 20, fontWeight: '700' },
  flashDesc: { color: '#E1B12C', fontSize: 16, fontWeight: '600' },
});
