import { Bar, Offer } from '@/lib/types';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { getBarImage } from '@/lib/fallbackImages';
interface Props {
  offers: Offer[];
  bars: Bar[];
  onPress: (bar: Bar) => void;
  topDealBarIds?: Set<number>;
  distanceMap?: Map<number, string>;
}

export function LiveNowSection({ offers, bars, onPress, topDealBarIds, distanceMap }: Props) {
  if (offers.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>🕐</Text>
        <Text style={styles.emptyText}>
          There are no Happy Hours running right now. Check back shortly!
        </Text>
      </View>
    );
  }

  return (
    <>
      <Text style={styles.sectionTitle}>Deals Happening Now..</Text>
      {offers.map((offer) => {
        const bar = bars.find((b) => b.id === offer.bar_id);
        if (!bar) return null;
        const isTopDeal = topDealBarIds?.has(bar.id) ?? false;
        const distance = distanceMap?.get(bar.id);

        return (
          <Pressable
            key={offer.id}
            style={({ pressed }) => [
              isTopDeal ? styles.topDealCard : styles.liveCard,
              pressed && (isTopDeal ? styles.pressedTopDeal : styles.pressed),
            ]}
            onPress={() => onPress(bar)}
          >
            {({ pressed }) => (
              <>
                {isTopDeal && (
                  <View style={styles.topDealBadge}>
                    <Text style={styles.topDealStar}>★</Text>
                    <Text style={styles.topDealLabel}>TOP DEAL</Text>
                  </View>
                )}
                <Image source={{ uri: getBarImage(bar.image_url, (offer as any)?.drinks, bar.id) }} style={styles.liveImage} />
                <View style={styles.liveInfo}>
                  <Text style={[
                    isTopDeal ? styles.topDealName : styles.liveName,
                    pressed && (isTopDeal ? styles.pressedTopDealText : styles.pressedText),
                  ]}>{bar.name}</Text>
                  <Text numberOfLines={1} style={[
                    isTopDeal ? styles.topDealDeal : styles.liveDeal,
                    pressed && (isTopDeal ? styles.pressedTopDealText : styles.pressedText),
                  ]}>{offer['deal summary'] || '2-4-1 cocktails'}</Text>
                  <View style={styles.bottomRow}>
                    <Text style={[
                      isTopDeal ? styles.topDealTime : styles.liveTime,
                      pressed && (isTopDeal ? styles.pressedTopDealText : styles.pressedText),
                    ]}>
                      {offer.start_time?.slice(0, 5)} - {offer.end_time?.slice(0, 5)}
                    </Text>
                    {distance && (
                      <Text style={[{ fontSize: 11, color: isTopDeal ? '#121212' : '#E1B12C' }, pressed && (isTopDeal ? styles.pressedTopDealText : styles.pressedText)]}>{distance}</Text>
                    )}
                  </View>
                </View>
              </>
            )}
          </Pressable>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: 24, paddingTop: 12 },
  liveCard: {
    flexDirection: 'row',
    backgroundColor: '#121212',
    borderRadius: 10,
    marginHorizontal: 12,
    marginTop: 12,
    paddingVertical: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    borderWidth: 2,
    borderColor: '#E1B12C',
  },
  topDealCard: {
    flexDirection: 'row',
    backgroundColor: '#E1B12C',
    borderRadius: 10,
    marginHorizontal: 12,
    marginTop: 12,
    paddingVertical: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    borderWidth: 2,
    borderColor: '#121212',
  },
  topDealBorder: {
    borderWidth: 2,
    borderColor: '#E1B12C',
  },
  topDealBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    alignItems: 'center',
    zIndex: 1,
  },
  topDealStar: { fontSize: 12, color: '#121212' },
  topDealLabel: { fontSize: 8, fontWeight: '700', color: '#121212', letterSpacing: 0.5 },
  pressed: { backgroundColor: '#E1B12C' },
  pressedText: { color: '#121212' },
  pressedTopDeal: { backgroundColor: '#121212' },
  pressedTopDealText: { color: '#E1B12C' },
  topDealName: { color: '#121212', fontSize: 16, fontWeight: '700' },
  topDealDeal: { color: '#121212', fontSize: 14, marginTop: 4 },
  topDealTime: { color: '#121212', fontSize: 13 },
  liveImage: { width: 80, height: 80, borderRadius: 6, margin: 5 },
  liveInfo: { flex: 1, justifyContent: 'center', paddingLeft: 12, paddingRight: 8 },
  liveName: { color: '#E1B12C', fontSize: 16, fontWeight: '700' },
  liveDeal: { color: '#E1B12C', fontSize: 14, marginTop: 4 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  liveTime: { color: '#E1B12C', fontSize: 13 },
  distance: { color: '#E1B12C', fontSize: 11 },
  emptyCard: {
    alignSelf: 'center',
    width: '60%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B0AEAE',
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyIcon: { fontSize: 24, opacity: 0.4, marginBottom: 8 },
  emptyText: { textAlign: 'center', opacity: 0.7, fontSize: 14 },
});
