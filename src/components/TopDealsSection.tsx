import { Bar, Offer } from '@/lib/types';
import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  bars: Bar[];
  offers: Offer[];
  onPress: (bar: Bar) => void;
}

export function TopDealsSection({ bars, offers, onPress }: Props) {
  return (
    <FlatList
      horizontal
      data={bars}
      keyExtractor={(item) => String(item.id)}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
      renderItem={({ item }) => {
        const offer = offers.find((o) => o.bar_id === item.id);
        return (
          <Pressable onPress={() => onPress(item)} style={({ pressed }) => [styles.topDealCard, pressed && styles.pressed]}>
            {({ pressed }) => (
              <>
                <Image source={{ uri: item.image_url || 'https://picsum.photos/160/100' }} style={styles.topDealImage} />
                <View style={styles.textArea}>
                  <Text style={[styles.topDealName, pressed && styles.pressedText]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {offer?.['deal summary'] && (
                    <Text style={[styles.topDealDeal, pressed && styles.pressedText]} numberOfLines={1}>
                      {offer['deal summary']}
                    </Text>
                  )}
                  {offer?.start_time && (
                    <Text style={[styles.topDealTime, pressed && styles.pressedText]}>
                      {offer.start_time.slice(0, 5)} - {offer.end_time?.slice(0, 5)}
                    </Text>
                  )}
                </View>
              </>
            )}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  topDealCard: {
    width: 160,
    height: 190,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E1B12C',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pressed: { backgroundColor: '#121212' },
  pressedText: { color: '#E1B12C' },
  topDealImage: { width: '100%', height: 100, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  textArea: { flex: 1, paddingHorizontal: 8, paddingVertical: 6, justifyContent: 'center' },
  topDealName: { fontSize: 13, fontWeight: '700', color: '#121212' },
  topDealDeal: { fontSize: 11, color: '#121212', marginTop: 3, opacity: 0.8 },
  topDealTime: { fontSize: 11, color: '#121212', marginTop: 2, opacity: 0.6 },
});
