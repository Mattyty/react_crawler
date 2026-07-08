import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
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
  live: '#E1B12C',
  upcoming: '#9CA3AF',
  featured: '#F59E0B',
};

const GLOW_COLORS: Record<MapBar['status'], string> = {
  live: 'rgba(225, 177, 44, 0.35)',
  upcoming: 'rgba(156, 163, 175, 0.3)',
  featured: 'rgba(245, 158, 11, 0.35)',
};

const STATUS_LABELS: Record<MapBar['status'], string> = {
  live: 'LIVE NOW',
  upcoming: 'UPCOMING',
  featured: 'FEATURED',
};

const DEFAULT_CENTRE = { latitude: 53.4808, longitude: -2.2426 };

export function MapScreen() {
  const { currentCity } = useAppState();
  const city = currentCity || 'Manchester';
  const { mapBars, loading } = useBars(city);
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [selectedBar, setSelectedBar] = useState<MapBar | null>(null);

  const centre = CITY_COORDS[city] || DEFAULT_CENTRE;

  const handleMarkerPress = useCallback((bar: MapBar) => {
    setSelectedBar(bar);
    mapRef.current?.animateToRegion(
      { latitude: bar.lat!, longitude: bar.long!, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      300
    );
  }, []);

  const handleViewDeals = useCallback(() => {
    if (selectedBar) {
      router.push({ pathname: '/bar-detail', params: { barId: String(selectedBar.id) } });
    }
  }, [selectedBar, router]);

  if (loading) {
    return (
      <View style={styles.wrapper}>
        <View style={[styles.mapContainer, styles.loading]}>
          <ActivityIndicator size="large" color="#E1B12C" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{ ...centre, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
          onPress={() => setSelectedBar(null)}
        >
          <UrlTile
            urlTemplate="https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            maximumZ={19}
            flipY={false}
          />
          {mapBars.map((bar) => (
            <Marker
              key={bar.id}
              coordinate={{ latitude: bar.lat!, longitude: bar.long! }}
              onPress={() => handleMarkerPress(bar)}
            >
              <View style={styles.markerWrapper}>
                <View style={[styles.markerGlow, { backgroundColor: GLOW_COLORS[bar.status] }]} />
                <View style={[styles.markerDot, { backgroundColor: PIN_COLORS[bar.status] }]} />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Floating preview card */}
        {selectedBar && (
          <View style={styles.floatingCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.barName}>{selectedBar.name}</Text>
              <View style={[styles.statusDot, { backgroundColor: PIN_COLORS[selectedBar.status] }]} />
            </View>
            {selectedBar.deal && (
              <Text style={styles.dealText} numberOfLines={2}>{selectedBar.deal}</Text>
            )}
            {!selectedBar.deal && (
              <Text style={styles.dealText}>Happy hour available</Text>
            )}
            <Text style={styles.statusLabel}>{STATUS_LABELS[selectedBar.status]}</Text>
            <Pressable style={styles.viewDealsButton} onPress={handleViewDeals}>
              <Text style={styles.viewDealsText}>View Deals</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: 12 },
  mapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },
  map: { flex: 1 },
  loading: { justifyContent: 'center', alignItems: 'center' },
  markerWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerGlow: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  floatingCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(225, 177, 44, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  dealText: {
    fontSize: 13,
    color: '#A0A0B0',
    marginBottom: 8,
    lineHeight: 18,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E1B12C',
    letterSpacing: 1,
    marginBottom: 12,
  },
  viewDealsButton: {
    backgroundColor: '#E1B12C',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewDealsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#121212',
  },
});
