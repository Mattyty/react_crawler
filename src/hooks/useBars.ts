import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { Bar, Offer } from '@/lib/types';

export interface MapBar extends Bar {
  status: 'live' | 'upcoming' | 'featured';
  deal?: string;
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
        let status: MapBar['status'] = 'upcoming';
        if (liveBarIds.has(b.id)) status = 'live';
        else if (b.is_flash_active) status = 'featured';

        return { ...b, status, deal: offer?.['deal summary'] || undefined };
      });

    setMapBars(results);
    setLoading(false);
  }, [city]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { mapBars, loading, refetch: fetch };
}
