import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { Marker, UrlTile } from 'react-native-maps';

import { useAppState } from '@/context/AppStateContext';
import { MapBar, useBars } from '@/hooks/useBars';

const CITY_COORDS: Record<string, { latitude: number; longitude: number }> = {
  Manchester: { latitude: 53.4808, longitude: -2.2426 },
  London: { latitude: 51.5074, longitude: -0.1278 },
  Liverpool: { latitude: 53.4084, longitude: -2.9916 },
  Leeds: { latitude: 53.8008, longitude: -1.5491 },
  Birmingham: { latitude: 52.4862, longitude: -1.8904 },
};

const PIN_COLORS: Record<MapBar['status'], string> = {
  live: '#121212',
  upcoming: '#9CA3AF',
  featured: '#F59E0B',
};

const STATUS_BADGES: Record<MapBar['status'], { label: string; color: string }> = {
  live: { label: 'LIVE', color: '#22C55E' },
  upcoming: { label: 'UPCOMING', color: '#9CA3AF' },
  featured: { label: 'FEATURED', color: '#F59E0B' },
};

const DEFAULT_CENTRE = { latitude: 53.4808, longitude: -2.2426 };

export function MapScreen() {
  const { currentCity } = useAppState();
  const city = currentCity || 'Manchester';
  const { mapBars, loading } = useBars(city);
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedBar, setSelectedBar] = useState<MapBar | null>(null);

  const centre = CITY_COORDS[city] || DEFAULT_CENTRE;

  const handleMarkerPress = useCallback((bar: MapBar) => {
    setSelectedBar(bar);
    bottomSheetRef.current?.snapToIndex(0);
    mapRef.current?.animateToRegion(
      { latitude: bar.lat!, longitude: bar.long!, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      300
    );
  }, []);

  const handleSheetPress = useCallback(
    (bar: MapBar) => {
      router.push({ pathname: '/bar-detail', params: { barId: String(bar.id) } });
    },
    [router]
  );

  if (loading) {
    return (
      <View style={styles.wrapper}>
        <View style={[styles.card, styles.loading]}>
          <ActivityIndicator size="large" color="#E1B12C" />
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.wrapper}>
      <View style={styles.card}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{ ...centre, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
        >
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
          />
          {mapBars.map((bar) => (
            <Marker
              key={bar.id}
              coordinate={{ latitude: bar.lat!, longitude: bar.long! }}
              title={bar.name}
              onPress={() => handleMarkerPress(bar)}
            >
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: PIN_COLORS[bar.status],
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <View style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: bar.status === 'live' ? '#E1B12C' : '#fff',
                  }} />
                </View>
                <View style={{
                  width: 0,
                  height: 0,
                  borderLeftWidth: 6,
                  borderRightWidth: 6,
                  borderTopWidth: 8,
                  borderLeftColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderTopColor: PIN_COLORS[bar.status],
                }} />
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={['35%']} enablePanDownToClose>
        <BottomSheetView style={{ flex: 1 }}>
          {selectedBar && (
            <Pressable onPress={() => handleSheetPress(selectedBar)} style={{ flex: 1 }}>
              <Image
                source={{ uri: selectedBar.image_url || 'https://picsum.photos/seed/bar/600/300' }}
                style={styles.image}
              />
              <View style={styles.info}>
                <Text style={styles.name}>{selectedBar.name}</Text>
                {selectedBar.deal && <Text style={styles.deal}>{selectedBar.deal}</Text>}
                <View style={[styles.badge, { backgroundColor: STATUS_BADGES[selectedBar.status].color }]}>
                  <Text style={styles.badgeText}>{STATUS_BADGES[selectedBar.status].label}</Text>
                </View>
              </View>
            </Pressable>
          )}
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: '4%' as any },
  card: { flex: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: '#E5E7EB' },
  map: { flex: 1 },
  loading: { justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 120 },
  info: { padding: 12, gap: 4 },
  name: { fontSize: 16, fontWeight: '700', color: '#0F1113' },
  deal: { fontSize: 13, color: '#57636C' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
