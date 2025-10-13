# PittPool Frontend

React + TypeScript + Vite application for the PittPool carpooling platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_MAPBOX_TOKEN=pk.your_mapbox_token
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key
```

3. Start development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code with ESLint

## Key Features

- Mobile-first responsive design with Tailwind CSS
- Real-time messaging with Socket.io
- Interactive maps with Mapbox GL JS
- Secure payments with Stripe
- Type-safe API calls with TypeScript
- Optimized data fetching with React Query

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── context/        # React Context providers
├── hooks/          # Custom React hooks
├── services/       # API client
├── types/          # TypeScript type definitions
└── App.tsx         # Main app with routing
```
