import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppDrawer } from '@/components/AppDrawer';
import { FlashSection } from '@/components/FlashSection';
import { Header } from '@/components/Header';
import { LiveNowSection } from '@/components/LiveNowSection';
import { MapScreen } from '@/components/MapScreen';
import { SearchBar } from '@/components/SearchBar';
import { TopDealsSection } from '@/components/TopDealsSection';
import { UpcomingSection } from '@/components/UpcomingSection';
import { useAppState } from '@/context/AppStateContext';
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
  const [liveOffers, setLiveOffers] = useState<Offer[]>([]);
  const [upcomingOffers, setUpcomingOffers] = useState<Offer[]>([]);
  const [topDealBars, setTopDealBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'bars' | 'map'>('bars');

  const city = currentCity || 'Manchester';

  const fetchData = useCallback(async () => {
    setLoading(true);
    const today = getDayOfWeek();
    const now = getCurrentTime();

    const barsRes = await supabase.from('bars').select('*').eq('city', city);
    const cityBars = barsRes.data || [];
    const barIds = cityBars.map((b) => b.id);

    const offersRes = await supabase.from('offers').select('*');
    const allOffers = offersRes.data || [];
    const todayOffers = allOffers.filter(
      (o) => barIds.includes(o.bar_id) && o.day_of_week?.toLowerCase().includes(today.toLowerCase())
    );

    const live = todayOffers.filter(
      (o) => o.start_time && o.end_time && o.start_time <= now && o.end_time >= now
    );
    const upcoming = todayOffers.filter((o) => o.start_time && o.start_time > now);

    const topDealBarIds = new Set(
      allOffers.filter((o) => o.is_top_deal && barIds.includes(o.bar_id)).map((o) => o.bar_id)
    );
    const topDeals = cityBars.filter((b) => topDealBarIds.has(b.id));

    setBars(cityBars);
    setLiveOffers(live);
    setUpcomingOffers(upcoming);
    setTopDealBars(topDeals);
    setLoading(false);
  }, [city]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredBars = searchText
    ? bars.filter((b) => b.name.toLowerCase().includes(searchText.toLowerCase()))
    : [];

  const flashBars = bars.filter((b) => b.is_flash_active);

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
        filteredBars={filteredBars}
        onSelectBar={navigateToBar}
      />

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'bars' && styles.tabActive]}
          onPress={() => setActiveTab('bars')}
        >
          <Text style={styles.tabText}>Bars</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'map' && styles.tabActive]}
          onPress={() => setActiveTab('map')}
        >
          <Text style={styles.tabText}>Map</Text>
        </Pressable>
      </View>

      {activeTab === 'bars' ? (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {flashBars.length > 0 && <FlashSection bars={flashBars} onPress={navigateToBar} />}

          <Text style={styles.sectionTitle}>Top Deals...</Text>
          <TopDealsSection bars={topDealBars} onPress={navigateToBar} />

          <View style={styles.divider} />
          <LiveNowSection offers={liveOffers} bars={bars} onPress={navigateToBar} />

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Deals Coming Up Later...</Text>
          <UpcomingSection offers={upcomingOffers} bars={bars} onPress={navigateToBar} />

          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <MapScreen />
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
  tabText: { fontSize: 14, fontWeight: '500', color: '#15161E' },
  scrollContent: { flex: 1, backgroundColor: '#fff' },
  sectionTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: 24, paddingTop: 12 },
  divider: { height: 2, backgroundColor: '#E5E7EB', marginVertical: 12, marginHorizontal: 16 },

});
