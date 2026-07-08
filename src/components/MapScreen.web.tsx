import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppState } from '@/context/AppStateContext';
import { MapBar, useBars } from '@/hooks/useBars';

const CITY_COORDS: Record<string, [number, number]> = {
  Manchester: [53.4808, -2.2426],
  London: [51.5074, -0.1278],
  Liverpool: [53.4084, -2.9916],
  Leeds: [53.8008, -1.5491],
  Birmingham: [52.4862, -1.8904],
};

const PIN_COLORS: Record<MapBar['status'], string> = {
  live: '#E1B12C',
  upcoming: '#9CA3AF',
  featured: '#F59E0B',
};

const GLOW_COLORS: Record<MapBar['status'], string> = {
  live: 'rgba(225, 177, 44, 0.5)',
  upcoming: 'rgba(156, 163, 175, 0.4)',
  featured: 'rgba(245, 158, 11, 0.5)',
};

const STATUS_LABELS: Record<MapBar['status'], string> = {
  live: 'LIVE NOW',
  upcoming: 'UPCOMING',
  featured: 'FEATURED',
};

export function MapScreen() {
  const { currentCity } = useAppState();
  const city = currentCity || 'Manchester';
  const { mapBars, loading } = useBars(city);
  const router = useRouter();
  const [selectedBar, setSelectedBar] = useState<MapBar | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const centre = CITY_COORDS[city] || CITY_COORDS.Manchester;

  const handleViewDeals = useCallback(() => {
    if (selectedBar) {
      router.push({ pathname: '/bar-detail', params: { barId: String(selectedBar.id) } });
    }
  }, [selectedBar, router]);

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

      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, { zoomControl: false }).setView(centre, 14);
      mapInstanceRef.current = map;

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        className: 'lighter-tiles',
      }).addTo(map);

      // Inject CSS to lighten the tiles
      if (!document.getElementById('map-tile-style')) {
        const style = document.createElement('style');
        style.id = 'map-tile-style';
        style.textContent = '.lighter-tiles { filter: brightness(1.4) saturate(0.8); }';
        document.head.appendChild(style);
      }

      markersRef.current = [];

      mapBars.forEach((bar) => {
        const color = PIN_COLORS[bar.status];
        const glow = GLOW_COLORS[bar.status];
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11" fill="${glow}" />
          <circle cx="12" cy="12" r="7" fill="${color}" stroke="rgba(255,255,255,0.8)" stroke-width="2"/>
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

      setTimeout(() => map.invalidateSize(), 100);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, mapBars, centre]);

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
      <View style={styles.mapContainer}>
        <div
          ref={mapContainerRef as any}
          style={{ width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' }}
        />
      </View>

      {/* Floating preview card - outside map container to avoid overflow clipping */}
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
            <Text style={styles.statusLabel}>{STATUS_LABELS[selectedBar.status]}</Text>
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
    backgroundColor: '#1a1a2e',
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
