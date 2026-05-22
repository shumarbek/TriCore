# TriCore — AI-Powered STEM Learning Platform

Modern frontend for **TriCore**: Mathematics, Physics, and Chemistry learning from beginner to mastery.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion**
- **Recharts**
- **Lucide Icons**

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login`, `/register`, `/forgot-password` | Authentication |
| `/dashboard` | User overview & analytics |
| `/learning`, `/learning/[subject]` | Subject roadmaps |
| `/lessons`, `/lessons/[id]` | Lesson list & detail |
| `/practice-exams` | AI custom exams |
| `/rankings` | Global & subject rankings |
| `/ai-assistant` | Scientific AI chat |
| `/homework`, `/support`, `/settings` | Learning tools (notes — har dars ichida) |
| `/admin`, `/admin/content`, `/admin/users`, `/admin/analytics` | Admin panel |

## Design

- Dark / Light mode (Settings or sidebar)
- Glassmorphism, scientific grid backgrounds
- Color tokens: `#0B1020`, `#5B8CFF`, `#00D1FF`, etc.

## Note

## Curriculum

- **Matematika**: Algebra, Geometriya (Planimetriya 29 dars), Stereometriya (14 dars)
- **Fizika**: 6 ta bo'lim, 141+ mavzu (Boshlang'ich → Kvant)
- **Kimyo**: 4 bo'lim (namuna mavzular)

## Practice Exams

`Subject` → `Section` → `Sub-section` (yoki **All** = butun section). Difficulty yo'q. Savollar admin bankidan random.

## Homework

`/homework` — faqat har sectiondagi **oxirgi o'tilgan dars** vazifasi. Qolganlari dars ichidagi Homework tab.

This is a **frontend-only** build with mock data. Connect NestJS + PostgreSQL + JWT backend for production.
