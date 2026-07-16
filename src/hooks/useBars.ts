import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { Bar, Offer } from '@/lib/types';

function parseDrinks(drinks: any): string[] {
  if (!drinks) return [];
  if (Array.isArray(drinks)) return drinks;
  if (typeof drinks === 'string') {
    const trimmed = drinks.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed.slice(1, -1).split(',').map((s: string) => s.replace(/^"|"$/g, '').trim()).filter(Boolean);
    }
    return [trimmed];
  }
  return [];
}

export interface MapBar extends Bar {
  status: 'live' | 'upcoming' | 'featured';
  deal?: string;
  drinks?: string[];
  isLiveNow?: boolean;
  startTime?: string;
  endTime?: string;
}

function getDayOfWeek(): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    new Date().getDay()
  ];
}

function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
}

export function useBars(city: string) {
  const [mapBars, setMapBars] = useState<MapBar[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const today = getDayOfWeek();
    const now = getCurrentTime();

    const barsRes = await supabase.from('bars').select('*').eq('city', city);
    const cityBars: Bar[] = barsRes.data || [];
    const barIds = cityBars.map((b) => b.id);

    const offersRes = await supabase.from('offers').select('*');
    const allOffers: Offer[] = offersRes.data || [];

    const todayOffers = allOffers.filter(
      (o) => barIds.includes(o.bar_id) && o.day_of_week?.toLowerCase().includes(today.toLowerCase())
    );

    const liveBarIds = new Set(
      todayOffers
        .filter((o) => o.start_time && o.end_time && o.start_time <= now && o.end_time >= now)
        .map((o) => o.bar_id)
    );
    const upcomingBarIds = new Set(
      todayOffers.filter((o) => o.start_time && o.start_time > now).map((o) => o.bar_id)
    );

    const results: MapBar[] = cityBars
      .filter((b) => b.lat && b.long)
      .map((b) => {
        const offer = todayOffers.find((o) => o.bar_id === b.id);
        const offerVal = (offer as any)?.is_top_deal ?? (offer as any)?.top_deal;
        const isTopDeal = offerVal === true || offerVal === 'true' || offerVal === 'TRUE' || offerVal === 1 || b.is_flash_active;

        let status: MapBar['status'] = 'upcoming';
        if (isTopDeal) status = 'featured';
        else if (liveBarIds.has(b.id)) status = 'live';

        const barIsLive = liveBarIds.has(b.id);
        return { ...b, status, deal: offer?.['deal summary'] || undefined, drinks: parseDrinks((offer as any)?.drinks), isLiveNow: barIsLive, startTime: offer?.start_time || undefined, endTime: offer?.end_time || undefined };
      });

    setMapBars(results);
    setLoading(false);
  }, [city]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { mapBars, loading, refetch: fetch };
}
