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

export function UpcomingSection({ offers, bars, onPress, topDealBarIds, distanceMap }: Props) {
  if (offers.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>🕐</Text>
        <Text style={styles.emptyText}>
          There are no Happy Hours coming up today. Check back tomorrow!
        </Text>
      </View>
    );
  }

  return (
    <>
      {offers.map((offer) => {
        const bar = bars.find((b) => b.id === offer.bar_id);
        if (!bar) return null;
        const isTopDeal = topDealBarIds?.has(bar.id) ?? false;
        const distance = distanceMap?.get(bar.id);

        // Top deal bars get brand yellow bg, others get slightly darker grey
        const cardBg = isTopDeal ? '#E1B12C' : '#E5E7EB';
        const nameColor = isTopDeal ? '#121212' : '#121212';
        const dealColor = isTopDeal ? '#121212' : '#374151';
        const timeColor = isTopDeal ? '#121212' : '#6B7280';
        const pressedBg = isTopDeal ? '#121212' : '#E1B12C';
        const pressedTextColor = isTopDeal ? '#E1B12C' : '#121212';

        return (
          <Pressable
            key={offer.id}
            style={({ pressed }) => [
              styles.upcomingCard,
              { backgroundColor: pressed ? pressedBg : cardBg, borderWidth: 2, borderColor: isTopDeal ? '#121212' : '#121212' },
            ]}
            onPress={() => onPress(bar)}
          >
            {({ pressed }) => (
              <>
                {isTopDeal && (
                  <View style={styles.topDealBadge}>
                    <Text style={[styles.topDealStar, pressed && { color: '#E1B12C' }]}>★</Text>
                    <Text style={[styles.topDealLabel, pressed && { color: '#E1B12C' }]}>TOP DEAL</Text>
                  </View>
                )}
                <Image source={{ uri: getBarImage(bar.image_url, (offer as any)?.drinks, bar.id) }} style={styles.liveImage} />
                <View style={styles.liveInfo}>
                  <Text style={[styles.upcomingName, { color: pressed ? pressedTextColor : nameColor }]}>{bar.name}</Text>
                  <Text style={[styles.upcomingDeal, { color: pressed ? pressedTextColor : dealColor }]}>{offer['deal summary'] || '2-4-1 cocktails'}</Text>
                  <View style={styles.bottomRow}>
                    <Text style={[styles.upcomingTime, { color: pressed ? pressedTextColor : timeColor }]}>
                      {offer.start_time?.slice(0, 5)} - {offer.end_time?.slice(0, 5)}
                    </Text>
                    {distance && (
                      <Text style={[styles.distance, { color: pressed ? pressedTextColor : '#121212' }]}>{distance}</Text>
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
  upcomingCard: {
    flexDirection: 'row',
    borderRadius: 10,
    marginHorizontal: 12,
    marginTop: 12,
    height: 90,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
  liveImage: { width: 80, height: 80, borderRadius: 6, margin: 5 },
  liveInfo: { flex: 1, justifyContent: 'center', paddingLeft: 12, paddingRight: 8 },
  upcomingName: { fontSize: 16, fontWeight: '700' },
  upcomingDeal: { fontSize: 14, marginTop: 4 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  upcomingTime: { fontSize: 13 },
  distance: { fontSize: 11 },
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
