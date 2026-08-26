import { Bar, Offer } from '@/lib/types';
import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { IconTime } from '@/components/Icons';
import { getBarImage } from '@/lib/fallbackImages';
import { getDisplayEndTime } from '@/lib/haversine';

interface Props {
  offers: Offer[];
  bars: Bar[];
  onPress: (bar: Bar, offerId?: number) => void;
  topDealBarIds?: Set<number>;
  distanceMap?: Map<number, string>;
  allOffers?: Offer[];
}

export function UpcomingSection({ offers, bars, onPress, topDealBarIds, distanceMap, allOffers = [] }: Props) {
  if (offers.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>🕐</Text>
        <Text style={styles.emptyText}>
          There are no more Happy Hours coming up today. Check back tomorrow, or use the search bar to find details on your favourite place.
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
              styles.card,
              isTopDeal && styles.cardGlow,
              pressed && styles.cardPressed,
            ]}
            onPress={() => onPress(bar, offer.id)}
          >
            {({ pressed }) => (
              <>
                <Image source={{ uri: getBarImage(bar.image_url, (offer as any)?.drinks, bar.id) }} style={styles.cardImage} />
                <View style={styles.cardOverlay} />
                {isTopDeal && (
                  <View style={styles.topDealBadge}>
                    <Text style={styles.topDealStar}>★</Text>
                    <Text style={styles.topDealLabel}>TOP DEAL</Text>
                  </View>
                )}
                <View style={styles.cardContent}>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>SOON</Text>
                    <IconTime size={10} color="#121212" />
                  </View>
                  <Text style={styles.cardName}>{bar.name}</Text>
                  <Text numberOfLines={1} style={styles.cardDeal}>{offer['deal summary'] || '2-4-1 cocktails'}</Text>
                  <View style={styles.bottomRow}>
                    <Text style={styles.cardTime}>
                      {offer.start_time?.slice(0, 5)} - {(getDisplayEndTime(offer, allOffers) || offer.end_time || '').slice(0, 5)}
                    </Text>
                    {distance && (
                      <View style={styles.distancePill}>
                        <Text style={styles.cardDistance}>{distance}</Text>
                      </View>
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
  card: {
    borderRadius: 10,
    marginHorizontal: 12,
    marginTop: 12,
    height: Platform.OS === 'ios' ? 135 : 145,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    position: 'relative' as any,
    borderWidth: 1,
    borderColor: '#E1B12C',
  },
  cardPressed: { opacity: 0.85 },
  cardGlow: {
    shadowColor: '#E1B12C',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(60,60,60,0.8)',
  },
  topDealBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    alignItems: 'center',
    zIndex: 1,
  },
  topDealStar: { fontSize: 12, color: '#E1B12C' },
  topDealLabel: { fontSize: 8, fontWeight: '700', color: '#E1B12C', letterSpacing: 0.5 },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E1B12C',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
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
  cardName: { color: '#E1B12C', fontSize: 16, fontWeight: '700' },
  cardDeal: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginTop: 4 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  cardTime: { color: '#E1B12C', fontSize: 12 },
  cardDistance: { color: '#FFFFFF', fontSize: 11 },
  distancePill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  emptyCard: {
    alignSelf: 'stretch',
    marginHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1B12C',
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyIcon: { fontSize: 24, opacity: 0.8, marginBottom: 8 },
  emptyText: { textAlign: 'center', color: '#E1B12C', fontSize: 14 },
});
