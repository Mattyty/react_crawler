import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { Component, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';

import { useAppState } from '@/context/AppStateContext';
import { MapBar, useBars } from '@/hooks/useBars';
import { formatDistance, haversineDistance } from '@/lib/haversine';

// Error boundary to catch native map crashes gracefully
class MapErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: '#E1B12C', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Map unavailable
          </Text>
          <Text style={{ color: '#A0A0B0', fontSize: 13, textAlign: 'center' }}>
            Could not load Google Maps. Please check your API key configuration.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

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

export function MapScreen(_props?: {
  activeFilters?: Set<string>;
  onToggleFilter?: (filter: string) => void;
  onClearFilters?: () => void;
  filterOptions?: string[];
}) {
  const { currentCity } = useAppState();
  const city = currentCity || 'Manchester';
  const { mapBars, loading } = useBars(city);
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [selectedBar, setSelectedBar] = useState<MapBar | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const centre = CITY_COORDS[city] || DEFAULT_CENTRE;

  // Request permission and watch user location
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10 },
        (loc) => {
          setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        }
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

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

  // Calculate distance to selected bar
  const distanceText = selectedBar && userLocation && selectedBar.lat && selectedBar.long
    ? formatDistance(haversineDistance(userLocation.lat, userLocation.lng, selectedBar.lat, selectedBar.long))
    : null;

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
    <MapErrorBoundary>
    <View style={styles.wrapper}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{ ...centre, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
          onPress={() => setSelectedBar(null)}
        >
          <UrlTile
            urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            maximumZ={19}
            flipY={false}
          />

          {/* User location blue dot */}
          {userLocation && (
            <Marker
              coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.blueDotWrapper}>
                <View style={styles.blueDotPulse} />
                <View style={styles.blueDot} />
              </View>
            </Marker>
          )}

          {/* Bar markers */}
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
            <Pressable style={styles.closeButton} onPress={() => setSelectedBar(null)}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
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
            <View style={styles.metaRow}>
              <Text style={styles.statusLabel}>{STATUS_LABELS[selectedBar.status]}</Text>
              {distanceText && <Text style={styles.distanceText}>{distanceText}</Text>}
            </View>
            <Pressable style={styles.viewDealsButton} onPress={handleViewDeals}>
              <Text style={styles.viewDealsText}>View Deals</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
    </MapErrorBoundary>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: 12 },
  mapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  map: { flex: 1 },
  loading: { justifyContent: 'center', alignItems: 'center' },
  // Blue dot marker
  blueDotWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueDotPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(66, 133, 244, 0.25)',
  },
  blueDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4285F4',
    borderWidth: 2.5,
    borderColor: '#fff',
    shadowColor: '#4285F4',
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  // Bar markers
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
  // Floating card
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
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  closeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E1B12C',
    letterSpacing: 1,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8B8BA0',
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
