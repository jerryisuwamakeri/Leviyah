# Leviyah — Frontend

Next.js 15 storefront and admin dashboard for the Leviyah beauty & hair brand.

## Requirements

- Node.js 18+
- npm

## Setup

```bash
npm install
# create .env.local with the variables below
npm run dev
```

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STORAGE_URL=http://localhost:8000/storage
NEXT_PUBLIC_PAYSTACK_KEY=pk_live_your_key_here
NEXT_PUBLIC_WHATSAPP_NUMBER=2348100000000
```

## Features

- Product catalog with color & length variants
- Guest + authenticated cart
- Checkout via Paystack or WhatsApp order
- Customer account, orders, and profile
- Admin dashboard with analytics charts
- POS terminal with QR product scanning
- Staff management with QR clock-in/out
- Promotions, transactions, chat support
- Role-based admin access (super_admin, admin, manager, cashier, support)

## Tech Stack

- Next.js 15 App Router
- TanStack Query v5
- Zustand
- Recharts
- shadcn/ui + Tailwind CSS
