import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconBack, IconStation, IconTime } from '@/components/Icons';
import { useAppState } from '@/context/AppStateContext';
import { getBarImage } from '@/lib/fallbackImages';
import { supabase } from '@/lib/supabase';
import { Bar, Offer } from '@/lib/types';

function getDayOfWeek(): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    new Date().getDay()
  ];
}

export default function BarDetailScreen() {
  const { barId } = useLocalSearchParams<{ barId: string }>();
  const router = useRouter();
  const { userPersona } = useAppState();
  const [bar, setBar] = useState<Bar | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [offerDays, setOfferDays] = useState<string[]>([]);
  const [isLiveNow, setIsLiveNow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    (async () => {
      const today = getDayOfWeek();
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

      const [barRes, offersRes] = await Promise.all([
        supabase.from('bars').select('*').eq('id', Number(barId)).single(),
        supabase
          .from('offers')
          .select('*')
          .eq('bar_id', Number(barId)),
      ]);
      if (barRes.data) setBar(barRes.data);

      const allBarOffers = offersRes.data || [];

      // Extract all unique days this offer runs
      const days = Array.from(new Set(allBarOffers.map((o) => o.day_of_week).filter(Boolean))) as string[];
      setOfferDays(days);

      // Find today's offer
      const todayOffer = allBarOffers.find(
        (o) => o.day_of_week?.toLowerCase().includes(today.toLowerCase())
      ) || allBarOffers[0] || null;
      if (todayOffer) {
        setOffer(todayOffer);
        // Check if live now
        if (todayOffer.start_time && todayOffer.end_time) {
          setIsLiveNow(todayOffer.start_time <= currentTime && todayOffer.end_time >= currentTime);
        }
      }
      setLoading(false);
    })();
  }, [barId]);

  const handleTakeMeThere = () => {
    if (!bar?.address) return;
    const encoded = encodeURIComponent(bar.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encoded}`);
  };

  const handleBookTable = () => {
    if (!bar?.table_reservation) return;
    const url = bar.table_reservation.startsWith('http')
      ? bar.table_reservation
      : `https://${bar.table_reservation}`;
    Linking.openURL(url);
  };

  const handleReport = async (isLive: boolean) => {
    if (!isLive) {
      await supabase.from('deal_reports').insert({ bar_name: bar?.name });
    } else if (offer) {
      const now = new Date().toISOString();
      await supabase.from('offers').update({ last_verified: now }).eq('id', offer.id);
      setOffer({ ...offer, last_verified: now });
    }
    setReported(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E1B12C" />
        </View>
      </SafeAreaView>
    );
  }

  if (!bar) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <Text>Bar not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header onBack={() => router.back()} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Bar Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: getBarImage(bar.image_url, (offer as any)?.drinks, bar.id) }}
            style={styles.barImage}
          />
        </View>

        <View style={styles.content}>
          {/* Bar Name - linked if url available */}
          {bar.url ? (
            <Pressable onPress={() => Linking.openURL(bar.url!.startsWith('http') ? bar.url! : `https://${bar.url}`)}>
              <Text style={[styles.barName, styles.barNameLink]}>{bar.name}</Text>
            </Pressable>
          ) : (
            <Text style={styles.barName}>{bar.name}</Text>
          )}

          {/* Schedule box */}
          {(offerDays.length > 0 || offer?.start_time) && (
            <View style={styles.scheduleCard}>
              <Text style={styles.scheduleTitle}>Happy Hour Times...</Text>
              {offer?.start_time && (
                <Text style={styles.scheduleTime}>
                  {offer.start_time.slice(0, 5)} - {offer.end_time?.slice(0, 5)}
                </Text>
              )}
              {offerDays.length > 0 && (
                <Text style={styles.scheduleDays}>{offerDays.join(' • ')}</Text>
              )}
            </View>
          )}

          {/* Last Verified */}
          {offer?.last_verified && (
            <Text style={styles.verified}>Last verified: {(() => {
              const d = new Date(offer.last_verified);
              if (isNaN(d.getTime())) return offer.last_verified;
              const hh = String(d.getHours()).padStart(2, '0');
              const mm = String(d.getMinutes()).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              const mo = String(d.getMonth() + 1).padStart(2, '0');
              const yyyy = d.getFullYear();
              return `${dd}/${mo}/${yyyy} @ ${hh}:${mm}`;
            })()}</Text>
          )}

          <View style={styles.divider} />

          {/* Live Status */}
          <View style={styles.statusRow}>
            <Text style={[styles.statusBadge, { color: isLiveNow ? '#22C55E' : '#E1B12C' }]}>
              {isLiveNow ? 'LIVE' : 'COMING UP SOON...'}
            </Text>
            {isLiveNow
              ? <IconStation size={14} color="#22C55E" />
              : <IconTime size={14} color="#E1B12C" />
            }
          </View>

          {/* Happy Hour Deal */}
          {offer && (
            <>
              <Text style={styles.dealSummary}>
                {(offer as any).persona?.toLowerCase() === 'student' ? 'Student Happy Hour Deal:' : 'Happy Hour Deal:'}
              </Text>
              {offer.deal_description && (
                <Text style={styles.dealDescription}>{offer.deal_description}</Text>
              )}
              {(offer as any).persona?.toLowerCase() === 'student' && (
                <Text style={styles.studentNote}>*Offer available to students only. ID may be required.</Text>
              )}
            </>
          )}

          <View style={styles.divider} />

          {/* Bar Vibe */}
          <Text style={styles.sectionTitle}>The Vibe</Text>
          <Text style={styles.description}>
            {bar.bar_description ||
              'German Beer house with a roaring fire, live music, great food and alpine vibes'}
          </Text>

          <View style={styles.divider} />

          {/* Address */}
          <Text style={styles.address}><Text style={styles.addressLabel}>Address: </Text>{bar.address || '32 Deansgate, Manchester, M1 3PX'}</Text>

          {/* Static map - tap to open directions */}
          {bar.lat && bar.long && (
            <Pressable onPress={handleTakeMeThere}>
              <Image
                source={{ uri: `https://maps.googleapis.com/maps/api/staticmap?center=${bar.lat},${bar.long}&zoom=16&size=400x150&markers=color:0xE1B12C%7C${bar.lat},${bar.long}&key=AIzaSyDo9TG7H0t2ACrWHBg6BLhR_oS9DPyKTo8` }}
                style={styles.staticMap}
              />
            </Pressable>
          )}

          {/* Book A Table - only show if table_reservation URL available */}
          {bar.table_reservation && (
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleBookTable}>
              {({ pressed }) => (
                <>
                  <Text style={[styles.buttonIcon, pressed && styles.buttonTextPressed]}>✓</Text>
                  <Text style={[styles.buttonText, pressed && styles.buttonTextPressed]}>Book A Table</Text>
                </>
              )}
            </Pressable>
          )}

          {/* Deal Verification */}
          <Text style={styles.verifyTitle}>Is this deal still live?</Text>
          {reported ? (
            <Text style={styles.thanksText}>Thanks for keeping The City Uncovered updated 👍</Text>
          ) : (
            <View style={styles.verifyRow}>
              <Pressable style={({ pressed }) => [styles.noButton, pressed && styles.buttonPressed]} onPress={() => handleReport(false)}>
                {({ pressed }) => (
                  <Text style={[styles.voteText, pressed && styles.buttonTextPressed]}>NO</Text>
                )}
              </Pressable>
              <Pressable style={({ pressed }) => [styles.yesButton, pressed && styles.buttonPressed]} onPress={() => handleReport(true)}>
                {({ pressed }) => (
                  <Text style={[styles.voteText, pressed && styles.buttonTextPressed]}>YES</Text>
                )}
              </Pressable>
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={8}>
        <IconBack size={26} color="#E1B12C" />
      </Pressable>
      <View style={styles.logoTextWrap}>
        <Text style={styles.logoLine1}>THE CITY</Text>
        <Text style={styles.logoLine2}>UNCOVERED</Text>
      </View>
      <View style={styles.spacer} />
      <Image
        source={require('@/assets/images/crawler-logo.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141417' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#141417' },
  header: {
    backgroundColor: '#141417',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  backIcon: { color: '#E1B12C', fontSize: 26 },
  logoTextWrap: { justifyContent: 'center', marginLeft: 12 },
  logoLine1: { color: '#FFFFFF', fontSize: 20, fontWeight: '300', letterSpacing: 1.5 },
  logoLine2: { color: '#E1B12C', fontSize: 20, fontWeight: '300', letterSpacing: 1.5 },
  spacer: { flex: 1 },
  logoImage: { width: 40, height: 40 },
  scroll: { flex: 1, backgroundColor: '#141417' },
  imageWrapper: { padding: 16 },
  barImage: { width: '100%', height: 230, borderRadius: 12, borderWidth: 1, borderColor: '#E1B12C' },
  content: { paddingHorizontal: 16 },
  barName: { fontSize: 24, fontWeight: '500', color: '#E1B12C', textAlign: 'center' },
  barNameLink: { textDecorationLine: 'underline', color: '#E1B12C' },
  statusBadge: { fontSize: 13, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  scheduleCard: {
    alignSelf: 'center',
    width: '75%',
    borderRadius: 12,
    backgroundColor: '#E1B12C',
    borderWidth: 2,
    borderColor: '#121212',
    padding: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    shadowColor: '#E1B12C',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  scheduleTitle: { fontSize: 16, fontWeight: '700', color: '#121212', marginBottom: 6 },
  scheduleTime: { fontSize: 16, fontWeight: '600', color: '#121212', marginBottom: 4 },
  scheduleDays: { fontSize: 13, color: '#121212', textAlign: 'center' },
  dealSummary: { fontSize: 24, fontWeight: '600', color: '#E1B12C', marginTop: 8 },
  dealDescription: { fontSize: 14, fontWeight: '400', color: '#D1D5DB', marginTop: 12, lineHeight: 20 },
  studentNote: { fontSize: 12, fontWeight: '400', color: '#9CA3AF', marginTop: 8, fontStyle: 'italic' },
  sectionTitle: { fontSize: 24, fontWeight: '600', color: '#E1B12C', marginTop: 8 },
  description: { fontSize: 14, fontWeight: '400', color: '#D1D5DB', marginTop: 12, lineHeight: 20 },
  verified: { fontSize: 12, marginTop: 10, color: '#9CA3AF', textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#333333', marginVertical: 16 },
  address: { fontSize: 14, fontWeight: '500', color: '#D1D5DB' },
  addressLabel: { fontWeight: '700', color: '#E1B12C' },
  staticMap: {
    width: '100%',
    height: 92,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E1B12C',
  },
  directions: { fontSize: 14, fontWeight: '500', color: '#9CA3AF', marginTop: 8 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E1B12C',
    borderRadius: 8,
    height: 40,
    marginTop: 24,
    gap: 8,
  },
  buttonIcon: { fontSize: 15, color: '#121212' },
  buttonText: { color: '#121212', fontSize: 16, fontWeight: '600' },
  buttonPressed: { backgroundColor: '#121212' },
  buttonTextPressed: { color: '#E1B12C' },
  verifyTitle: { fontSize: 18, fontWeight: '500', textAlign: 'center', marginTop: 24, color: '#FFFFFF' },
  verifyRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 12 },
  noButton: {
    backgroundColor: '#FF3D3D',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  yesButton: {
    backgroundColor: '#22962B',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  voteText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  thanksText: { textAlign: 'center', marginTop: 12, fontSize: 14, color: '#D1D5DB' },
});
