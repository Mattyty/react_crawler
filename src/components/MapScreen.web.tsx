import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { FilterPills } from '@/components/FilterPills';
import { IconStation, IconTime } from '@/components/Icons';
import { useAppState } from '@/context/AppStateContext';
import { MapBar, useBars } from '@/hooks/useBars';
import { formatDistance, haversineDistance } from '@/lib/haversine';

const CITY_COORDS: Record<string, [number, number]> = {
  Manchester: [53.4808, -2.2426],
  London: [51.5074, -0.1278],
  Liverpool: [53.4084, -2.9916],
  Leeds: [53.8008, -1.5491],
  Birmingham: [52.4862, -1.8904],
};

const PIN_COLORS: Record<MapBar['status'], string> = {
  live: '#121212',
  upcoming: '#9CA3AF',
  featured: '#E1B12C',
};

const GLOW_COLORS: Record<MapBar['status'], string> = {
  live: 'rgba(225, 177, 44, 0.5)',
  upcoming: 'rgba(156, 163, 175, 0.4)',
  featured: 'rgba(225, 177, 44, 0.5)',
};

const STATUS_LABELS: Record<MapBar['status'], string> = {
  live: 'LIVE NOW',
  upcoming: 'Coming up...',
  featured: 'TOP DEAL',
};

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
  const [selectedBar, setSelectedBar] = useState<MapBar | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  const filters = activeFilters || new Set<string>();

  // Filter map bars based on active filters
  const filteredMapBars = useMemo(() => {
    if (filters.size === 0) return mapBars;
    return mapBars.filter((bar) => {
      const neighbourhoodMatch = bar.neighborhood && filters.has(bar.neighborhood.trim());
      const drinkMatch = bar.drinks && bar.drinks.some((d) => filters.has(d));

      // Determine which filter types are active
      const allNeighbourhoods = new Set(mapBars.map((b) => b.neighborhood?.trim()).filter(Boolean));
      const activeNeighbourhoods = Array.from(filters).filter((f) => allNeighbourhoods.has(f));
      const activeDrinks = Array.from(filters).filter((f) => !allNeighbourhoods.has(f));

      const nMatch = activeNeighbourhoods.length === 0 || neighbourhoodMatch;
      const dMatch = activeDrinks.length === 0 || drinkMatch;

      return nMatch && dMatch;
    });
  }, [mapBars, filters]);

  const centre = CITY_COORDS[city] || CITY_COORDS.Manchester;

  // Watch user location via browser Geolocation API
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        // Permission denied or error — silently continue without location
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
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

  useEffect(() => {
    if (loading) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Inject blue dot pulse animation
      if (!document.getElementById('blue-dot-style')) {
        const style = document.createElement('style');
        style.id = 'blue-dot-style';
        style.textContent = `
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(2.5); opacity: 0; }
          }
          .blue-dot-pulse {
            animation: pulse 2s infinite;
          }
        `;
        document.head.appendChild(style);
      }

      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, { zoomControl: false }).setView(centre, 14);
      mapInstanceRef.current = map;

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(map);

      markersRef.current = [];

      filteredMapBars.forEach((bar) => {
        const color = PIN_COLORS[bar.status];
        const glow = GLOW_COLORS[bar.status];
        const strokeColor = bar.status === 'live' ? '#E1B12C' : 'rgba(255,255,255,0.8)';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11" fill="${glow}" />
          <circle cx="12" cy="12" r="7" fill="${color}" stroke="${strokeColor}" stroke-width="2"/>
        </svg>`;
        const icon = L.divIcon({
          html: svg,
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([bar.lat!, bar.long!], { icon }).addTo(map);
        marker.on('click', () => {
          setSelectedBar(bar);
          map.flyTo([bar.lat!, bar.long!], 16, { duration: 0.5 });
        });
        markersRef.current.push(marker);
      });

      setTimeout(() => {
        if (mapInstanceRef.current) {
          map.invalidateSize();
        }
      }, 100);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, filteredMapBars, centre]);

  // Update user location marker when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    (async () => {
      const L = (await import('leaflet')).default;

      const blueDotSvg = `<div style="position:relative;width:20px;height:20px;">
        <div class="blue-dot-pulse" style="position:absolute;top:4px;left:4px;width:12px;height:12px;border-radius:50%;background:rgba(66,133,244,0.3);"></div>
        <div style="position:absolute;top:4px;left:4px;width:12px;height:12px;border-radius:50%;background:#4285F4;border:2.5px solid #fff;box-shadow:0 0 6px rgba(66,133,244,0.6);"></div>
      </div>`;

      const icon = L.divIcon({
        html: blueDotSvg,
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon, interactive: false }).addTo(mapInstanceRef.current);
      }
    })();
  }, [userLocation]);

  if (loading) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.mapContainer}>
          <ActivityIndicator size="large" color="#E1B12C" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* Map Key */}
      <View style={styles.mapKey}>
        <View style={styles.keyItem}>
          <View style={[styles.keyDot, { backgroundColor: '#E1B12C' }]} />
          <Text style={styles.keyLabel}>Top Deal</Text>
        </View>
        <View style={styles.keyItem}>
          <View style={[styles.keyDot, { backgroundColor: '#121212', borderWidth: 2, borderColor: '#E1B12C' }]} />
          <Text style={styles.keyLabel}>Live</Text>
        </View>
        <View style={styles.keyItem}>
          <View style={[styles.keyDot, { backgroundColor: '#9CA3AF' }]} />
          <Text style={styles.keyLabel}>Coming up...</Text>
        </View>
      </View>

      {/* Filter pills overlaid at top */}
      {filterOptions && filterOptions.length > 0 && onToggleFilter && onClearFilters && (
        <View style={styles.filterOverlay}>
          <FilterPills
            options={filterOptions}
            activeFilters={filters}
            onToggle={onToggleFilter}
            onClearAll={onClearFilters}
          />
        </View>
      )}

      <View style={styles.mapContainer}>
        <div
          ref={mapContainerRef as any}
          style={{ width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' }}
        />
      </View>

      {/* Floating preview card */}
      {selectedBar && (
        <View style={styles.floatingCardWrapper}>
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
              <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { color: selectedBar.isLiveNow ? '#22C55E' : '#E1B12C' }]}>
                  {selectedBar.isLiveNow ? 'LIVE' : 'COMING UP...'}
                </Text>
                {selectedBar.isLiveNow
                  ? <IconStation size={12} color="#22C55E" />
                  : <IconTime size={12} color="#E1B12C" />
                }
              </View>
              {selectedBar.startTime && (
                <Text style={styles.timeText}>
                  {selectedBar.startTime.slice(0, 5)} - {selectedBar.endTime?.slice(0, 5)}
                </Text>
              )}
              {distanceText && <Text style={styles.distanceText}>{distanceText}</Text>}
            </View>
            <Pressable style={styles.viewDealsButton} onPress={handleViewDeals}>
              <Text style={styles.viewDealsText}>View Deals</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 12,
    position: 'relative' as any,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  filterOverlay: {
    zIndex: 5,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    marginBottom: 4,
  },
  mapKey: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    marginBottom: 6,
  },
  keyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  keyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  keyLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
  },
  floatingCardWrapper: {
    position: 'absolute' as any,
    bottom: 28,
    left: 28,
    right: 28,
  },
  floatingCard: {
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
    position: 'relative' as any,
  },
  closeButton: {
    position: 'absolute' as any,
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#A0A0B0',
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
