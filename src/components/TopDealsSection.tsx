import { Bar, Offer } from '@/lib/types';
import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { IconStation, IconTime } from '@/components/Icons';

interface Props {
  bars: Bar[];
  offers: Offer[];
  onPress: (bar: Bar) => void;
  liveBarIds?: Set<number>;
}

export function TopDealsSection({ bars, offers, onPress, liveBarIds }: Props) {
  // Sort: live bars first, then upcoming
  const sortedBars = [...bars].sort((a, b) => {
    const aLive = liveBarIds?.has(a.id) ? 0 : 1;
    const bLive = liveBarIds?.has(b.id) ? 0 : 1;
    return aLive - bLive;
  });

  return (
    <View style={styles.listWrapper}>
      <FlatList
        horizontal
        data={sortedBars}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, paddingRight: 40 }}
      renderItem={({ item }) => {
        const offer = offers.find((o) => o.bar_id === item.id);
        const isLive = liveBarIds ? liveBarIds.has(item.id) : false;
        const bgColor = isLive ? '#E1B12C' : '#121212';
        const textColor = isLive ? '#121212' : '#E1B12C';
        const borderColor = isLive ? '#121212' : '#E1B12C';
        const pressedBg = isLive ? '#121212' : '#E1B12C';
        const pressedText = isLive ? '#E1B12C' : '#121212';

        return (
          <Pressable
            onPress={() => onPress(item)}
            style={({ pressed }) => [
              styles.topDealCard,
              { backgroundColor: pressed ? pressedBg : bgColor, borderWidth: 2, borderColor },
            ]}
          >
            {({ pressed }) => (
              <>
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: item.image_url || 'https://picsum.photos/160/100' }} style={styles.topDealImage} />
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{isLive ? 'LIVE' : 'SOON'}</Text>
                    {isLive ? <IconStation size={10} color="#121212" /> : <IconTime size={10} color="#121212" />}
                  </View>
                </View>
                <View style={styles.textArea}>
                  <Text style={[styles.topDealName, { color: pressed ? pressedText : textColor }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {offer?.['deal summary'] && (
                    <Text style={[styles.topDealDeal, { color: pressed ? pressedText : textColor }]} numberOfLines={1}>
                      {offer['deal summary']}
                    </Text>
                  )}
                  {offer?.start_time && (
                    <Text style={[styles.topDealTime, { color: pressed ? pressedText : textColor }]}>
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
      <View style={styles.fadeHint} pointerEvents="none">
        <View style={styles.fadeStep1} />
        <View style={styles.fadeStep2} />
        <View style={styles.fadeStep3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listWrapper: {
    position: 'relative' as any,
  },
  fadeHint: {
    position: 'absolute' as any,
    top: 0,
    right: 0,
    bottom: 0,
    width: 32,
    flexDirection: 'row' as any,
  },
  fadeStep1: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  fadeStep2: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  fadeStep3: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  topDealCard: {
    width: 160,
    height: 190,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  topDealImage: { width: '100%', height: 100, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  imageWrapper: { position: 'relative' as any },
  statusPill: {
    position: 'absolute' as any,
    top: 6,
    right: 6,
    backgroundColor: '#E1B12C',
    borderWidth: 1,
    borderColor: '#121212',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#121212',
    letterSpacing: 0.5,
  },
  textArea: { flex: 1, paddingHorizontal: 8, paddingVertical: 6, justifyContent: 'center' },
  topDealName: { fontSize: 13, fontWeight: '700' },
  topDealDeal: { fontSize: 11, marginTop: 3, opacity: 0.85 },
  topDealTime: { fontSize: 11, marginTop: 2, opacity: 0.7 },
});
