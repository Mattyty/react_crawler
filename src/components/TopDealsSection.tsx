import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text } from 'react-native';
import { Bar } from '@/lib/types';

interface Props {
  bars: Bar[];
  onPress: (bar: Bar) => void;
}

export function TopDealsSection({ bars, onPress }: Props) {
  return (
    <FlatList
      horizontal
      data={bars}
      keyExtractor={(item) => String(item.id)}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 6, paddingBottom: 8 }}
      renderItem={({ item }) => (
        <Pressable onPress={() => onPress(item)} style={styles.topDealCard}>
          <Image source={{ uri: item.image_url || 'https://picsum.photos/160/150' }} style={styles.topDealImage} />
          <Text style={styles.topDealName} numberOfLines={1}>
            {item.name}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  topDealCard: { width: 160, marginRight: 12, borderRadius: 12, overflow: 'hidden' },
  topDealImage: { width: '100%', height: 150, borderRadius: 8 },
  topDealName: { fontSize: 13, fontWeight: '700', marginTop: 4, paddingHorizontal: 4 },
});
