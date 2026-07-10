import { Bar, Offer } from '@/lib/types';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  offers: Offer[];
  bars: Bar[];
  onPress: (bar: Bar) => void;
}

export function UpcomingSection({ offers, bars, onPress }: Props) {
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
        return (
          <Pressable key={offer.id} style={({ pressed }) => [styles.upcomingCard, pressed && styles.pressed]} onPress={() => onPress(bar)}>
            {({ pressed }) => (
              <>
                <View style={styles.gradientOverlay} />
                <Image source={{ uri: bar.image_url || 'https://picsum.photos/80/80' }} style={styles.liveImage} />
                <View style={styles.liveInfo}>
                  <Text style={[styles.upcomingName, pressed && styles.pressedText]}>{bar.name}</Text>
                  <Text style={[styles.upcomingDeal, pressed && styles.pressedText]}>{offer['deal summary'] || '2-4-1 cocktails'}</Text>
                  <Text style={[styles.upcomingTime, pressed && styles.pressedText]}>
                    {offer.start_time?.slice(0, 5)} - {offer.end_time?.slice(0, 5)}
                  </Text>
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
    backgroundColor: '#121212',
    borderRadius: 10,
    marginHorizontal: 12,
    marginTop: 12,
    height: 90,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
    // @ts-ignore - web-only property
    backgroundImage: 'linear-gradient(135deg, transparent 50%, rgba(225,177,44,0.12) 100%)',
  },
  pressed: { backgroundColor: '#E1B12C' },
  pressedText: { color: '#121212' },
  liveImage: { width: 80, height: 80, borderRadius: 6, margin: 5 },
  liveInfo: { flex: 1, justifyContent: 'center', paddingLeft: 12 },
  upcomingName: { color: '#E1B12C', fontSize: 16, fontWeight: '700' },
  upcomingDeal: { color: '#E1B12C', fontSize: 14, marginTop: 4 },
  upcomingTime: { color: '#E1B12C', fontSize: 13, marginTop: 4 },
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
