import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Bar, Offer } from '@/lib/types';

interface Props {
  offers: Offer[];
  bars: Bar[];
  onPress: (bar: Bar) => void;
}

export function LiveNowSection({ offers, bars, onPress }: Props) {
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
      <Text style={styles.sectionTitle}>Other Deals{'\n'}Happening Now..</Text>
      {offers.map((offer) => {
        const bar = bars.find((b) => b.id === offer.bar_id);
        if (!bar) return null;
        return (
          <Pressable key={offer.id} style={styles.liveCard} onPress={() => onPress(bar)}>
            <Image source={{ uri: bar.image_url || 'https://picsum.photos/80/80' }} style={styles.liveImage} />
            <View style={styles.liveInfo}>
              <Text style={styles.liveName}>{bar.name}</Text>
              <Text style={styles.liveDeal}>{offer['deal summary'] || '2-4-1 cocktails'}</Text>
              <Text style={styles.liveTime}>
                {offer.start_time?.slice(0, 5)} - {offer.end_time?.slice(0, 5)}
              </Text>
            </View>
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
    height: 90,
    overflow: 'hidden',
  },
  liveImage: { width: 80, height: 80, borderRadius: 6, margin: 5 },
  liveInfo: { flex: 1, justifyContent: 'center', paddingLeft: 12 },
  liveName: { color: '#E1B12C', fontSize: 16, fontWeight: '700' },
  liveDeal: { color: '#E1B12C', fontSize: 14, marginTop: 4 },
  liveTime: { color: '#E1B12C', fontSize: 13, marginTop: 4 },
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
