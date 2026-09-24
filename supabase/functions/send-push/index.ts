// Supabase Edge Function: send-push
//
// Sends an Expo push notification to devices in `device_tokens`, optionally
// filtered by city and/or persona. Reads tokens with the service-role key
// (bypasses RLS). Protected by a shared secret in the `x-send-secret` header.
//
// Deploy: paste this into the Supabase dashboard (Edge Functions > Via Editor).
// Secrets required (Edge Functions > Secrets):
//   SUPABASE_URL              (provided automatically by Supabase)
//   SUPABASE_SERVICE_ROLE_KEY (provided automatically by Supabase)
//   SEND_PUSH_SECRET          (a long random string you choose)
//
// Example request:
//   POST https://<project-ref>.supabase.co/functions/v1/send-push
//   headers: { "x-send-secret": "<your secret>", "Content-Type": "application/json" }
//   body: {
//     "title": "Freshers deal!",
//     "body": "2-4-1 cocktails at The Cambridge tonight",
//     "city": "Manchester",          // optional
//     "persona": "Student",          // optional
//     "data": { "screen": "bar-detail", "barId": "125" }  // optional deep link
//   }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // Simple shared-secret auth so only you can trigger sends.
  const secret = req.headers.get('x-send-secret');
  if (!secret || secret !== Deno.env.get('SEND_PUSH_SECRET')) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let payload: {
    title?: string;
    body?: string;
    city?: string;
    persona?: string;
    data?: Record<string, unknown>;
  };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { title, body, city, persona, data } = payload;
  if (!title || !body) {
    return json({ error: 'title and body are required' }, 400);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Build the filtered token query.
  let query = supabase.from('device_tokens').select('expo_push_token');
  if (city) query = query.eq('city', city);
  if (persona) query = query.eq('persona', persona);

  const { data: rows, error } = await query;
  if (error) {
    return json({ error: `DB query failed: ${error.message}` }, 500);
  }

  const tokens = (rows ?? [])
    .map((r: { expo_push_token: string }) => r.expo_push_token)
    .filter((t: string) => typeof t === 'string' && t.startsWith('ExponentPushToken'));

  if (tokens.length === 0) {
    return json({ sent: 0, message: 'No matching tokens' }, 200);
  }

  // Expo accepts up to 100 messages per request — send in batches.
  const batches: string[][] = [];
  for (let i = 0; i < tokens.length; i += 100) {
    batches.push(tokens.slice(i, i + 100));
  }

  const tickets: unknown[] = [];
  for (const batch of batches) {
    const messages = batch.map((to) => ({
      to,
      sound: 'default',
      title,
      body,
      ...(data ? { data } : {}),
    }));

    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });
    const result = await res.json();
    tickets.push(result);
  }

  return json({ sent: tokens.length, batches: batches.length, tickets }, 200);
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
