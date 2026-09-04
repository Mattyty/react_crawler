import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';

import { FilterPills } from '@/components/FilterPills';
import { useAppState } from '@/context/AppStateContext';
import { MapBar, useBars } from '@/hooks/useBars';
import { getBarImage } from '@/lib/fallbackImages';
import { formatDistance, haversineDistance } from '@/lib/haversine';
import { MAPTILER_TILE_URL } from '@/lib/mapConfig';

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
  const { currentCity, userPersona } = useAppState();
  const city = currentCity || 'Manchester';
  const { mapBars, allTodayOffers, loading } = useBars(city, userPersona);
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [selectedBar, setSelectedBar] = useState<MapBar | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  // Markers must track view changes long enough to render their custom pin view,
  // otherwise on Android (with a custom tile overlay) they can snapshot blank.
  const [tracksChanges, setTracksChanges] = useState(true);

  const centre = CITY_COORDS[city] || DEFAULT_CENTRE;

  // Once markers have rendered, stop tracking view changes for performance
  useEffect(() => {
    if (!mapBars.length) return;
    const t = setTimeout(() => setTracksChanges(false), 1500);
    return () => clearTimeout(t);
  }, [mapBars]);

  // Filter map bars based on active filters
  const filteredBars = React.useMemo(() => {
    if (!activeFilters || activeFilters.size === 0) return mapBars;
    return mapBars.filter((bar) => {
      const allNeighbourhoods = new Set(mapBars.map((b) => b.neighborhood?.trim()).filter(Boolean));
      const activeNeighbourhoods = Array.from(activeFilters).filter((f) => allNeighbourhoods.has(f));
      const activeDrinks = Array.from(activeFilters).filter((f) => !allNeighbourhoods.has(f));

      const nMatch = activeNeighbourhoods.length === 0 ||
        (bar.neighborhood && activeNeighbourhoods.includes(bar.neighborhood.trim()));

      const dMatch = activeDrinks.length === 0 ||
        (bar.drinks && activeDrinks.every((d) => bar.drinks!.includes(d)));

      return nMatch && dMatch;
    });
  }, [mapBars, activeFilters]);

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

  const handleViewDeals = useCallback((offerId?: number) => {
    if (selectedBar) {
      router.push({ pathname: '/bar-detail', params: { barId: String(selectedBar.id), ...(offerId ? { offerId: String(offerId) } : {}) } });
    }
  }, [selectedBar, router]);

  // Get all today offers for the selected bar (exclude continuations starting before 06:00)
  const selectedBarOffers = useMemo(() => {
    if (!selectedBar) return [];
    return allTodayOffers.filter((o) =>
      o.bar_id === selectedBar.id &&
      (!o.start_time || o.start_time >= '06:00:00')
    );
  }, [selectedBar, allTodayOffers]);

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
          mapType={Platform.OS === 'android' ? 'none' : 'standard'}
        >
          {Platform.OS === 'android' && (
            <UrlTile
              urlTemplate={MAPTILER_TILE_URL}
              maximumZ={20}
              flipY={false}
              zIndex={-1}
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
          {filteredBars.map((bar, index) => (
            <Marker
              key={bar.id}
              coordinate={{ latitude: bar.lat!, longitude: bar.long! }}
              onPress={() => handleMarkerPress(bar)}
              onSelect={() => handleMarkerPress(bar)}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={tracksChanges}
            >
              <View style={[styles.pinDot, { backgroundColor: getPinColor(bar), borderColor: bar.status === 'featured' && bar.isLiveNow ? '#E1B12C' : '#fff' }]} />
            </Marker>
          ))}
        </MapView>

        {/* Floating preview card carousel */}
        {selectedBar && (
          <View style={styles.floatingCard}>
            <Pressable style={styles.closeButton} onPress={() => setSelectedBar(null)}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
            {selectedBarOffers.length > 1 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={268}
                decelerationRate="fast"
                style={styles.carousel}
              >
                {selectedBarOffers.map((offer: any, idx: number) => (
                  <View key={offer?.id || idx} style={styles.carouselCard}>
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: getBarImage(selectedBar.image_url, offer?.drinks as any, selectedBar.id) }}
                        style={styles.floatingCardImage}
                      />
                      {offer?.persona && (
                        <View style={styles.personaPill}>
                          <Text style={styles.personaPillText}>{offer.persona}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.barName}>{selectedBar.name}</Text>
                    <Text style={styles.dealText} numberOfLines={2}>
                      {offer?.['deal summary'] || 'Happy hour available'}
                    </Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.statusLabel}>{STATUS_LABELS[selectedBar.status]}</Text>
                      {distanceText && <Text style={styles.distanceText}>{distanceText}</Text>}
                    </View>
                    <Pressable style={styles.viewDealsButton} onPress={() => handleViewDeals(offer?.id)}>
                      <Text style={styles.viewDealsText}>View Deal</Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: getBarImage(selectedBar.image_url, selectedBar.drinks, selectedBar.id) }}
                    style={styles.floatingCardImage}
                  />
                  {(selectedBarOffers[0] as any)?.persona && (
                    <View style={styles.personaPill}>
                      <Text style={styles.personaPillText}>{(selectedBarOffers[0] as any).persona}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.barName}>{selectedBar.name}</Text>
                <Text style={styles.dealText} numberOfLines={2}>
                  {selectedBarOffers[0]?.['deal summary'] || selectedBar.deal || 'Happy hour available'}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.statusLabel}>{STATUS_LABELS[selectedBar.status]}</Text>
                  {distanceText && <Text style={styles.distanceText}>{distanceText}</Text>}
                </View>
                <Pressable style={styles.viewDealsButton} onPress={() => handleViewDeals(selectedBarOffers[0]?.id)}>
                  <Text style={styles.viewDealsText}>View Deal</Text>
                </Pressable>
              </View>
            )}
            {selectedBarOffers.length > 1 && (
              <Text style={styles.swipeHint}>Swipe for more offers →</Text>
            )}
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
  // Bar markers
  pinDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },
  // Floating card
  floatingCard: {
    position: 'absolute',
    bottom: 32,
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
  floatingCardImage: {
    width: '100%',
    height: 80,
    borderRadius: 10,
  },
  imageContainer: {
    position: 'relative' as any,
    marginBottom: 10,
  },
  personaPill: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#E1B12C',
    borderRadius: 11,
    paddingHorizontal: 9,
    paddingVertical: 2.5,
  },
  personaPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#121212',
    letterSpacing: 0.5,
  },
  carousel: {
    flexGrow: 0,
  },
  carouselCard: {
    width: 256,
    marginRight: 12,
  },
  swipeHint: {
    color: '#9CA3AF',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 6,
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
