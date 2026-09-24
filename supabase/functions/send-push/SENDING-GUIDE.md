# Sending Push Notifications

Targeted push notifications are sent by calling the `send-push` Supabase Edge
Function. It looks up matching device tokens in `device_tokens` (filtered by
city and/or persona) and sends them via the Expo Push API.

## Before you send

- **Auth**: every request needs two headers:
  - `x-send-secret`: the value stored in Supabase → Edge Functions → Secrets as `SEND_PUSH_SECRET`.
  - `Authorization: Bearer <anon key>`: required while "Verify JWT" is ON for the function.
    (The anon key is public and lives in the app, so this is safe to use here.)
- **Endpoint**: `https://wfanbaefeuxczqxzqfdk.supabase.co/functions/v1/send-push`

## Request body fields

| Field     | Required | Notes |
|-----------|----------|-------|
| `title`   | yes      | Notification heading. |
| `body`    | yes      | Notification message. |
| `city`    | no       | `"Manchester"` or `"Liverpool"`. Omit to include all cities. |
| `persona` | no       | e.g. `"Student"`. Omit to include all personas. |
| `data`    | no       | Deep-link payload. `{ "screen": "bar-detail", "barId": "125" }` opens that bar. `{ "screen": "home" }` opens the wall. Omit for no deep link. |

Filters combine with AND. Omit a filter to not restrict on it:
- No `city`, no `persona` → **everyone**
- `city` only → everyone in that city
- `persona` only → everyone with that persona (any city)
- `city` + `persona` → that persona in that city

The response looks like `{ "sent": 42, "batches": 1, "tickets": [...] }`.

---

## PowerShell (Windows) — copy/paste and edit

Set these once per session:

```powershell
$uri    = "https://wfanbaefeuxczqxzqfdk.supabase.co/functions/v1/send-push"
$secret = "YOUR_SEND_PUSH_SECRET"
$anon   = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmYW5iYWVmZXV4Y3pxeHpxZmRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNjUxNDUsImV4cCI6MjA5Mzk0MTE0NX0.gJcN6z4JO-aQNof41_JL0ZkZOrRIBgbtjgiKhHrXbeE"
$headers = @{ "x-send-secret" = $secret; "Authorization" = "Bearer $anon"; "Content-Type" = "application/json" }
```

### 1. Everyone

```powershell
$body = @{ title = "The City Uncovered"; body = "New deals live tonight!" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body
```

### 2. Manchester only

```powershell
$body = @{ title = "Manchester deals"; body = "Tonight's happy hours are live"; city = "Manchester" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body
```

### 3. Students only (any city)

```powershell
$body = @{ title = "Freshers specials"; body = "Student deals just dropped"; persona = "Student" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body
```

### 4. Manchester students, deep-linking to a specific bar

```powershell
$body = @{
  title   = "Freshers deal!"
  body    = "2-4-1 cocktails at The Cambridge tonight"
  city    = "Manchester"
  persona = "Student"
  data    = @{ screen = "bar-detail"; barId = "125" }
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body
```

---

## Test to only your own device first (recommended before a big send)

1. Mark your device with a unique city (Supabase SQL editor; use your token):

```sql
update public.device_tokens set city = 'TEST_ME'
where expo_push_token = 'ExponentPushToken[XXXXXXXX]';
```

2. Send with `city = "TEST_ME"` using any command above.

3. Restore your city afterwards:

```sql
update public.device_tokens set city = 'Manchester'
where expo_push_token = 'ExponentPushToken[XXXXXXXX]';
```

---

## Checking who you'll reach (optional, before sending)

Run in the Supabase SQL editor (admin) to preview the audience size:

```sql
-- all users
select count(*) from device_tokens;
-- manchester students
select count(*) from device_tokens where city = 'Manchester' and persona = 'Student';
```

---

## Notes & gotchas

- City/persona values are stored exactly as the app sets them: `"Manchester"`,
  `"Liverpool"`, `"Student"`, etc. Match the exact casing.
- Expo sends in batches of 100 automatically; the function handles any number of tokens.
- Sending is free (Expo Push, FCM, APNs) at any realistic volume.
- iOS notifications use the app icon; the custom `notification-icon.png` is Android-only.
- If you get `{"error":"Unauthorized"}` → `x-send-secret` doesn't match the stored secret.
- If you get a JWT error → include the `Authorization: Bearer <anon key>` header (or turn off "Verify JWT" for the function).
- If `sent: 0` → no tokens matched your filters (check city/persona spelling).
