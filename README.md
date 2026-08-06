# Volunteer by KROW — Production Ready Web Platform

Volunteer by KROW is a modern, high-performance platform connecting volunteers with organizations, schools, clubs, charities, and community events. Built with Next.js 15 App Router, Supabase, Tailwind CSS, shadcn/ui, and Framer Motion.

## 🚀 Key Features

- **Modern SaaS Aesthetics**: Styled with KROW Royal Purple identity, sleek dark mode support, glassmorphism, and micro-animations.
- **Role-Based Workflows**: Tailored dashboards for **Volunteers**, **Organizations**, and **Administrators**.
- **Opportunity Lifecycle**: Create, browse, filter, and apply for local or remote opportunities.
- **Hours & Certificates**: Track volunteer hours with verification workflows and exportable certificates.
- **Real-Time Communication**: Built-in messaging and notifications via Supabase Realtime.
- **Enterprise Security**: Row Level Security (RLS) on all database tables, input validation with Zod, and middleware route guards.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide Icons.
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Storage, Auth, Realtime).
- **Emails**: Resend & React Email.
- **Analytics & Errors**: PostHog & Sentry integrations ready.

---

## 🚦 Getting Started Locally

### 1. Clone & Install Dependencies
```bash
cd volunteer-by-krow
npm install
```

### 2. Configure Environment Variables
Copy `.env.local.example` to `.env.local` and add your keys:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key
RESEND_API_KEY=your-resend-key
```

### 3. Database Migration
Apply the SQL migrations located in `supabase/migrations/` to your Supabase project instance or local CLI:
```bash
supabase db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the platform.

---

## 📁 Project Structure

```
volunteer-by-krow/
├── src/
│   ├── actions/           # Server actions (Auth, Opportunities, Hours)
│   ├── app/               # App Router pages (marketing, auth, dashboards)
│   ├── components/        # UI components (landing, dashboard, shadcn/ui)
│   ├── config/            # Site metadata & navigation definitions
│   ├── lib/               # Supabase clients, utilities & Zod validators
│   ├── types/             # TypeScript definitions & database schemas
│   └── middleware.ts      # Auth protection middleware
├── supabase/
│   └── migrations/        # Production SQL migrations & RLS policies
└── public/                # Static assets
```

---

## 📦 Deployment

Deploy seamlessly to Vercel:
1. Push code to GitHub.
2. Import project into Vercel.
3. Configure environment variables.
4. Deploy!
