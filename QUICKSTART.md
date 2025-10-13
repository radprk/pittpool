# 🚀 PittPool Quick Start Guide

Get PittPool running on your local machine in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Docker installed (for easy PostgreSQL setup)

## Step 1: Start Database (30 seconds)

```bash
docker run --name pittpool-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgis/postgis
```

## Step 2: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file with required variables
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pittpool?schema=public"
JWT_SECRET="my-super-secret-jwt-key-for-development"
STRIPE_SECRET_KEY="sk_test_51placeholder"
MAPBOX_API_KEY="pk.placeholder"
PORT=5000
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
EOF

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev --name init

# Start backend server
npm run dev
```

Backend should now be running on `http://localhost:5000` ✅

## Step 3: Frontend Setup (2 minutes)

**Open a new terminal window:**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
VITE_API_URL=http://localhost:5000/api
VITE_MAPBOX_TOKEN=pk.placeholder
VITE_STRIPE_PUBLIC_KEY=pk_test_placeholder
EOF

# Start frontend dev server
npm run dev
```

Frontend should now be running on `http://localhost:5173` ✅

## Step 4: Test the App

1. Open your browser to `http://localhost:5173`
2. Click "Sign Up" to create an account
3. Fill in the registration form
4. After registering, you'll be logged in automatically!

## Quick Test Workflow

### As a Driver:
1. Go to "Post Ride"
2. Enter start location: "Pittsburgh, PA, USA"
3. Enter destination: "Carnegie Mellon University"
4. Set departure time (future date)
5. Set seats and price
6. Click "Post Ride"

### As a Rider:
1. Go to "Find Ride"
2. Browse available rides
3. Click "Book" on any ride
4. Complete the booking

### Try Messaging:
1. Go to "Messages"
2. (Messages will appear when you communicate with other users)

## Getting API Keys (Optional)

The app works without real API keys for development, but to enable full functionality:

### Mapbox (for location search):
1. Sign up at https://mapbox.com
2. Get your access token
3. Replace `VITE_MAPBOX_TOKEN` in `frontend/.env`

### Stripe (for payments):
1. Sign up at https://stripe.com
2. Get test API keys from Dashboard
3. Replace keys in both `.env` files

## Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not, start it
docker start pittpool-postgres
```

### Port Already in Use
```bash
# Backend (port 5000)
lsof -ti:5000 | xargs kill -9

# Frontend (port 5173)
lsof -ti:5173 | xargs kill -9
```

### Prisma Issues
```bash
cd backend
npx prisma generate
npx prisma migrate reset
```

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Explore the [API endpoints](./README.md#-api-endpoints)
- Check out the [project structure](./README.md#-project-structure)

## Need Help?

- Check logs in terminal for error messages
- Open Prisma Studio to view database: `npx prisma studio`
- Create an issue on GitHub

---

Happy carpooling! 🚗💨

