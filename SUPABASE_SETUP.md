# TriCore — Supabase Setup Guide

## 1. Supabase Project yaratish

1. [supabase.com](https://supabase.com) ga boring va yangi project yarating
2. Project yaratilgach, **Settings → API** dan quyidagilarni oling:
   - `Project URL` — `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key — `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Environment Variables

Loyiha root da `.env.local` fayl yarating:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
```

## 3. Database Schema

Supabase Dashboard → **SQL Editor** ga boring va `supabase/schema.sql` faylining to'liq mazmunini nusxalab **Run** bosing.

Bu quyidagilarni yaratadi:
- `profiles` — user profillari (auth.users bilan bog'liq, trigger orqali auto-create)
- `lesson_progress` — darslar progressi
- `exam_questions` — admin savollar banki
- `exam_results` — imtihon natijalari
- `messages` — user ↔ admin xabarlar
- `notes` — shaxsiy qaydlar
- `ai_config` — AI sozlamalari
- `ai_usage` — AI foydalanish logi
- `daily_activity` — kunlik faollik

Shuningdek:
- Row Level Security (RLS) barcha jadvallar uchun
- Realtime subscriptions (profiles, messages)
- Indexlar

## 4. Authentication sozlash

### Email/Password
Supabase Dashboard → **Authentication → Providers → Email**:
- "Enable Email provider" ✓
- "Confirm email" — o'chirib qo'yishingiz mumkin (development uchun)

### Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com) da OAuth 2.0 credentials yarating
2. Authorized redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
3. Supabase Dashboard → **Authentication → Providers → Google**:
   - Client ID va Client Secret ni kiriting

### GitHub OAuth
1. [GitHub Developer Settings](https://github.com/settings/developers) da OAuth App yarating
2. Authorization callback URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
3. Supabase Dashboard → **Authentication → Providers → GitHub**:
   - Client ID va Client Secret ni kiriting

## 5. Realtime yoqish

Supabase Dashboard → **Database → Replication**:
- `profiles` jadvali uchun Realtime yoqilganligini tekshiring
- `messages` jadvali uchun Realtime yoqilganligini tekshiring

## 6. Admin user yaratish

1. Normal ro'yxatdan o'ting (Register sahifasi orqali)
2. Supabase Dashboard → **Table Editor → profiles**:
   - O'z profilingizni toping
   - `role` ni `admin` ga o'zgartiring

## 7. Ishga tushirish

```bash
npm run dev
```

- Landing: `http://localhost:3000`
- Register: `http://localhost:3000/register`
- Login: `http://localhost:3000/login`
- Dashboard: `http://localhost:3000/dashboard`
- Admin: `http://localhost:3000/admin` (faqat role=admin)

## Arxitektura

```
Browser (Client)
├── Auth: Supabase Auth (email, Google, GitHub)
├── Data: Supabase Postgres (RLS bilan himoyalangan)
├── Realtime: Supabase Realtime (online status, messages)
├── AI: /api/chat → OpenAI API (config Supabase dan olinadi)
└── Files: Supabase Storage (kelajakda)

Middleware
├── Auth session tekshirish
├── Protected routes redirect
└── Admin role tekshirish
```
