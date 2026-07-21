import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppDrawer } from '@/components/AppDrawer';
import { FilterPills } from '@/components/FilterPills';
import { FlashSection } from '@/components/FlashSection';
import { Header } from '@/components/Header';
import { LiveNowSection } from '@/components/LiveNowSection';
import { MapScreen } from '@/components/MapScreen';
import { SearchBar } from '@/components/SearchBar';
import { TopDealsSection } from '@/components/TopDealsSection';
import { UpcomingSection } from '@/components/UpcomingSection';
import { useAppState } from '@/context/AppStateContext';
import { extractFilterOptions, filterBars, filterOffers } from '@/lib/filters';
import { formatDistance, haversineDistance } from '@/lib/haversine';
import { supabase } from '@/lib/supabase';
import { Bar, Offer } from '@/lib/types';

function getDayOfWeek(): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    new Date().getDay()
  ];
}

function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
}

export default function HomeScreen() {
  const { currentCity } = useAppState();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bars, setBars] = useState<Bar[]>([]);
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [liveOffers, setLiveOffers] = useState<Offer[]>([]);
  const [upcomingOffers, setUpcomingOffers] = useState<Offer[]>([]);
  const [topDealBars, setTopDealBars] = useState<Bar[]>([]);
  const [topDealOffers, setTopDealOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'bars' | 'map'>('bars');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [filtering, setFiltering] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoading, setMapLoading] = useState(false);

  // Watch user location (native via expo-location, web via navigator.geolocation)
  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof navigator === 'undefined' || !navigator.geolocation) return;
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      let subscription: Location.LocationSubscription | null = null;
      let mounted = true;
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted' || !mounted) return;

        // Get immediate position first so distances show quickly
        try {
          const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (mounted) {
            setUserLocation({ lat: current.coords.latitude, lng: current.coords.longitude });
          }
        } catch {}

        // Then watch for updates
        if (!mounted) return;
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 50 },
          (loc) => {
            if (mounted) setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
          }
        );
      })();
      return () => { mounted = false; subscription?.remove(); };
    }
  }, []);

  const city = currentCity || 'Manchester';

  const fetchData = useCallback(async () => {
    setLoading(true);
    const today = getDayOfWeek();
    const now = getCurrentTime();

    const barsRes = await supabase.from('bars').select('*').eq('city', city);
    const cityBars: Bar[] = barsRes.data || [];
    const barIds = cityBars.map((b) => b.id);

    const offersRes = await supabase.from('offers').select('*');
    const fetchedOffers: Offer[] = offersRes.data || [];
    const cityOffers = fetchedOffers.filter((o) => barIds.includes(o.bar_id));

    const todayOffers = cityOffers.filter(
      (o) => o.day_of_week?.toLowerCase().includes(today.toLowerCase())
    );

    const live = todayOffers.filter(
      (o) => o.start_time && o.end_time && o.start_time <= now && o.end_time >= now
    );
    const upcoming = todayOffers.filter((o) => o.start_time && o.start_time > now);

    const topDealBarIds = new Set(
      cityOffers.filter((o) => {
        const val = (o as any).is_top_deal ?? (o as any).top_deal;
        return val === true || val === 'true' || val === 'TRUE' || val === 1;
      }).map((o) => o.bar_id)
    );
    const topDeals = cityBars.filter((b) => topDealBarIds.has(b.id));
    const topOffers = cityOffers.filter((o) => {
      const val = (o as any).is_top_deal ?? (o as any).top_deal;
      return val === true || val === 'true' || val === 'TRUE' || val === 1;
    });

    setBars(cityBars);
    setAllOffers(cityOffers);
    setLiveOffers(live);
    setUpcomingOffers(upcoming);
    setTopDealBars(topDeals);
    setTopDealOffers(topOffers);
    setLoading(false);
  }, [city]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Extract dynamic filter options from data
  const filterOptions = useMemo(
    () => extractFilterOptions(bars, allOffers),
    [bars, allOffers]
  );

  // Apply filters to data
  const filteredBarsData = useMemo(
    () => filterBars(bars, allOffers, activeFilters),
    [bars, allOffers, activeFilters]
  );

  const filteredLiveOffers = useMemo(
    () => filterOffers(liveOffers, bars, activeFilters),
    [liveOffers, bars, activeFilters]
  );

  const filteredUpcomingOffers = useMemo(
    () => filterOffers(upcomingOffers, bars, activeFilters),
    [upcomingOffers, bars, activeFilters]
  );

  const filteredTopDealBars = useMemo(
    () => (activeFilters.size === 0 ? topDealBars : filterBars(topDealBars, allOffers, activeFilters)),
    [topDealBars, allOffers, activeFilters]
  );

  // Build topDealBarIds set for component consumption
  const topDealBarIds = useMemo(() => new Set(topDealBars.map((b) => b.id)), [topDealBars]);

  // Build liveBarIds set for TopDealsSection
  const liveBarIds = useMemo(() => new Set(liveOffers.map((o) => o.bar_id)), [liveOffers]);

  // Build distance map for all bars
  const distanceMap = useMemo<Map<number, string>>(() => {
    if (!userLocation) return new Map();
    const map = new Map<number, string>();
    bars.forEach((bar) => {
      if (bar.lat && bar.long) {
        const dist = haversineDistance(userLocation.lat, userLocation.lng, bar.lat, bar.long);
        map.set(bar.id, formatDistance(dist));
      }
    });
    return map;
  }, [userLocation, bars]);
  const wallFeed = useMemo(() => {
    type FeedItem = { type: 'live' | 'upcoming'; offer: Offer; isPremium: boolean };
    const items: FeedItem[] = [];

    filteredLiveOffers.forEach((o) => items.push({ type: 'live', offer: o, isPremium: false }));
    filteredUpcomingOffers.forEach((o) => items.push({ type: 'upcoming', offer: o, isPremium: false }));

    // Inject premium top-deal items every 8 spaces
    if (topDealOffers.length > 0 && items.length > 0) {
      let premiumIndex = 0;
      const result: FeedItem[] = [];
      for (let i = 0; i < items.length; i++) {
        if ((i + 1) % 8 === 0 && premiumIndex < topDealOffers.length) {
          const premiumOffer = topDealOffers[premiumIndex % topDealOffers.length];
          const now = getCurrentTime();
          const isLive = premiumOffer.start_time && premiumOffer.end_time &&
            premiumOffer.start_time <= now && premiumOffer.end_time >= now;
          result.push({ type: isLive ? 'live' : 'upcoming', offer: premiumOffer, isPremium: true });
          premiumIndex++;
        }
        result.push(items[i]);
      }
      return result;
    }

    return items;
  }, [filteredLiveOffers, filteredUpcomingOffers, topDealOffers]);

  const handleToggleFilter = useCallback((filter: string) => {
    setFiltering(true);
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) {
        next.delete(filter);
      } else {
        next.add(filter);
      }
      return next;
    });
    // Brief delay to show loading indicator, then clear
    setTimeout(() => setFiltering(false), 100);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFiltering(true);
    setActiveFilters(new Set());
    setTimeout(() => setFiltering(false), 100);
  }, []);

  const searchResults = searchText
    ? bars.filter((b) => b.name.toLowerCase().includes(searchText.toLowerCase()))
    : [];

  const flashBars = filteredBarsData.filter((b) => b.is_flash_active);

  const navigateToBar = (bar: Bar) => {
    setSearchText('');
    router.push({ pathname: '/bar-detail', params: { barId: String(bar.id) } });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header onMenuPress={() => setDrawerOpen(true)} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E1B12C" />
        </View>
        <AppDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header onMenuPress={() => setDrawerOpen(true)} />

      <SearchBar
        searchText={searchText}
        onChangeText={setSearchText}
        filteredBars={searchResults}
        onSelectBar={navigateToBar}
      />

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'bars' && styles.tabActive]}
          onPress={() => setActiveTab('bars')}
        >
          <View style={styles.tabContent}>
            <Text style={styles.tabText}>Bars</Text>
          </View>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'map' && styles.tabActive]}
          onPress={() => {
            if (activeTab !== 'map') {
              setMapLoading(true);
              // Brief delay lets the overlay render before the map mounts
              setTimeout(() => {
                setActiveTab('map');
                setMapLoading(false);
              }, 400);
            }
          }}
        >
          <View style={styles.tabContent}>
            <Text style={styles.tabText}>Map</Text>
          </View>
        </Pressable>
      </View>

      {activeTab === 'bars' ? (
        <View style={styles.scrollWrapper}>
          {(filtering || mapLoading) && (
            <View style={styles.filteringOverlay}>
              <ActivityIndicator size={mapLoading ? 'large' : 'small'} color="#E1B12C" />
            </View>
          )}
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {flashBars.length > 0 && <FlashSection bars={flashBars} onPress={navigateToBar} />}

            <Text style={styles.sectionTitle}>Top Deals...</Text>
            <TopDealsSection bars={filteredTopDealBars} offers={topDealOffers} onPress={navigateToBar} liveBarIds={liveBarIds} />

            {/* Filter Pills */}
            <FilterPills
              options={filterOptions}
              activeFilters={activeFilters}
              onToggle={handleToggleFilter}
              onClearAll={handleClearFilters}
            />

            <View style={styles.divider} />
            <LiveNowSection offers={filteredLiveOffers} bars={filteredBarsData} onPress={navigateToBar} topDealBarIds={topDealBarIds} distanceMap={distanceMap} />

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Deals Coming Up Later...</Text>
            <UpcomingSection offers={filteredUpcomingOffers} bars={filteredBarsData} onPress={navigateToBar} topDealBarIds={topDealBarIds} distanceMap={distanceMap} />

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      ) : (
        <MapScreen activeFilters={activeFilters} onToggleFilter={handleToggleFilter} onClearFilters={handleClearFilters} filterOptions={filterOptions} />
      )}

      <AppDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 8, backgroundColor: '#fff' },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#6F61EF' },
  tabContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tabText: { fontSize: 14, fontWeight: '500', color: '#15161E' },
  scrollWrapper: { flex: 1, position: 'relative' as any },
  scrollContent: { flex: 1, backgroundColor: '#fff' },
  filteringOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 10 },
  divider: { height: 2, backgroundColor: '#E5E7EB', marginVertical: 12, marginHorizontal: 16 },
});
