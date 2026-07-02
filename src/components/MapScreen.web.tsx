import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppState } from '@/context/AppStateContext';
import { MapBar, useBars } from '@/hooks/useBars';

const CITY_COORDS: Record<string, [number, number]> = {
  Manchester: [53.4808, -2.2426],
  London: [51.5074, -0.1278],
  Liverpool: [53.4084, -2.9916],
  Leeds: [53.8008, -1.5491],
  Birmingham: [52.4862, -1.8904],
};

const STATUS_BADGES: Record<MapBar['status'], { label: string; color: string }> = {
  live: { label: 'LIVE', color: '#22C55E' },
  upcoming: { label: 'UPCOMING', color: '#9CA3AF' },
  featured: { label: 'FEATURED', color: '#F59E0B' },
};

const PIN_COLORS: Record<MapBar['status'], string> = {
  live: '#121212',
  upcoming: '#9CA3AF',
  featured: '#F59E0B',
};

const PIN_DOT_COLORS: Record<MapBar['status'], string> = {
  live: '#E1B12C',
  upcoming: 'white',
  featured: 'white',
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

  const handleSheetPress = useCallback(() => {
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

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      markersRef.current = [];

      mapBars.forEach((bar) => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path d="M12.5 0C5.6 0 0 5.6 0 12.5 0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${PIN_COLORS[bar.status]}"/><circle cx="12.5" cy="12.5" r="5" fill="${PIN_DOT_COLORS[bar.status]}"/></svg>`;
        const icon = L.divIcon({
          html: svg,
          className: '',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        });

        const marker = L.marker([bar.lat!, bar.long!], { icon }).addTo(map);
        marker.on('click', () => {
          setSelectedBar(bar);
          map.flyTo([bar.lat!, bar.long!], 16, { duration: 0.5 });
        });
        markersRef.current.push(marker);
      });

      // Invalidate size after render to fix tile loading in rounded containers
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
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#E1B12C" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <div
          ref={mapContainerRef as any}
          style={{ width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' }}
        />
      </View>

      {selectedBar && (
        <Pressable style={styles.sheet} onPress={handleSheetPress}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: '4%' as any,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  image: { width: '100%', height: 120, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  info: { padding: 12, gap: 4 },
  name: { fontSize: 16, fontWeight: '700', color: '#0F1113' },
  deal: { fontSize: 13, color: '#57636C' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
