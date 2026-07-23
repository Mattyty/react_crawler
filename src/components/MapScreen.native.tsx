import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { Component, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';

import { FilterPills } from '@/components/FilterPills';
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

// Pin color logic:
// - upcoming (not top deal): light grey
// - live (not top deal): dark brand color
// - featured + live (top deal AND live): bright yellow + pulse
// - featured + not live (top deal but coming up): faded yellow
function getPinColor(bar: MapBar): string {
  if (bar.status === 'featured' && bar.isLiveNow) return '#E1B12C';
  if (bar.status === 'featured') return 'rgba(225, 177, 44, 0.45)';
  if (bar.status === 'live') return '#121212';
  return '#9CA3AF'; // upcoming
}

// Static map pin
function MapPin({ bar }: { bar: MapBar }) {
  const pinColor = getPinColor(bar);
  const borderColor = bar.status === 'featured' && bar.isLiveNow ? '#E1B12C' : '#fff';

  return (
    <View style={styles.markerContainer}>
      <View style={styles.teardropWrapper}>
        <View style={[styles.teardropHead, { backgroundColor: pinColor, borderColor }]} />
        <View style={[styles.teardropTail, { borderTopColor: pinColor }]} />
      </View>
    </View>
  );
}

const STATUS_LABELS: Record<MapBar['status'], string> = {
  live: 'LIVE NOW',
  upcoming: 'UPCOMING',
  featured: 'FEATURED',
};

const DEFAULT_CENTRE = { latitude: 53.4808, longitude: -2.2426 };

export function MapScreen({ activeFilters, onToggleFilter, onClearFilters, filterOptions }: {
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
      {/* Map Key */}
      <View style={styles.mapKey}>
        <View style={styles.keyItem}>
          <View style={[styles.keyDot, { backgroundColor: '#E1B12C' }]} />
          <Text style={styles.keyLabel}>Top Deal (Live)</Text>
        </View>
        <View style={styles.keyItem}>
          <View style={[styles.keyDot, { backgroundColor: 'rgba(225, 177, 44, 0.45)' }]} />
          <Text style={styles.keyLabel}>Top Deal (Coming Up)</Text>
        </View>
        <View style={styles.keyItem}>
          <View style={[styles.keyDot, { backgroundColor: '#121212' }]} />
          <Text style={styles.keyLabel}>Live</Text>
        </View>
        <View style={styles.keyItem}>
          <View style={[styles.keyDot, { backgroundColor: '#9CA3AF' }]} />
          <Text style={styles.keyLabel}>Coming Up</Text>
        </View>
      </View>

      {/* Filter Pills */}
      {filterOptions && filterOptions.length > 0 && onToggleFilter && onClearFilters && (
        <View style={styles.filterOverlay}>
          <FilterPills
            options={filterOptions}
            activeFilters={activeFilters || new Set()}
            onToggle={onToggleFilter}
            onClearAll={onClearFilters}
          />
        </View>
      )}

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{ ...centre, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
          onPress={() => setSelectedBar(null)}
        >
          {Platform.OS === 'android' && (
            <UrlTile
              urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              maximumZ={19}
              flipY={false}
            />
          )}

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
          {mapBars.map((bar, index) => (
            <Marker
              key={bar.id}
              coordinate={{ latitude: bar.lat!, longitude: bar.long! }}
              onPress={() => handleMarkerPress(bar)}
              anchor={{ x: 0.5, y: 1 }}
              title={bar.name}
            >
              <MapPin bar={bar} />
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
  mapKey: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    marginBottom: 6,
  },
  keyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  keyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  keyLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#374151',
  },
  filterOverlay: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    marginBottom: 6,
  },
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
  // Bar markers - teardrop pin
  markerContainer: {
    alignItems: 'center',
    width: 30,
    height: 32,
  },
  teardropWrapper: {
    alignItems: 'center',
    width: 22,
    height: 30,
  },
  teardropHead: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },
  teardropTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
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
