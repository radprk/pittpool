# PittPool Backend API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pittpool?schema=public"
JWT_SECRET="your-secret-key"
STRIPE_SECRET_KEY="sk_test_..."
MAPBOX_API_KEY="pk...."
PORT=5000
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

3. Run database migrations:
```bash
npx prisma migrate dev --name init
```

4. Start the server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## API Documentation

See main README.md for complete API endpoint documentation.

