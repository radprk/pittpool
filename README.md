# 🚗 PittPool - Pittsburgh Carpool Platform

PittPool is a full-stack carpooling web application designed for Pittsburgh, connecting drivers and riders through an intelligent matching system, real-time messaging, and secure payments.

## 🎯 Features

### Core Functionality
- **User Authentication**: JWT-based secure registration and login
- **Ride Posting**: Drivers can post available rides with routes, pricing, and schedules
- **Ride Requests**: Riders can create ride requests with flexible timing
- **Smart Matching**: Algorithm matches riders with drivers based on route overlap, time, and price
- **Real-time Messaging**: Socket.io powered chat between users
- **Booking System**: Complete booking flow with status tracking
- **Payment Integration**: Stripe payment holds and processing
- **Rating System**: Post-ride ratings for building trust
- **Profile Management**: User profiles with vehicle information

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- React Router for navigation
- React Query for data fetching
- Socket.io-client for real-time features
- Mapbox GL JS for maps and location search
- Stripe.js for payments

**Backend:**
- Node.js with Express and TypeScript
- PostgreSQL with PostGIS extension
- Prisma ORM
- Socket.io for WebSocket server
- JWT authentication
- Bcrypt for password hashing
- Stripe SDK for payment processing

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ with PostGIS extension
- Stripe account (for payments)
- Mapbox account (for maps)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pittpool
```

### 2. Set Up PostgreSQL Database

**Option A: Using Docker (Recommended)**

```bash
docker run --name pittpool-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgis/postgis
```

**Option B: Local PostgreSQL**

Install PostgreSQL with PostGIS extension:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgis

# macOS
brew install postgresql postgis
```

Create database:
```sql
CREATE DATABASE pittpool;
CREATE EXTENSION postgis;
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pittpool?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
MAPBOX_API_KEY="pk.your_mapbox_api_key"
PORT=5000
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
EOF

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here
EOF

# Start the frontend dev server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 5. Get API Keys

**Mapbox:**
1. Sign up at [mapbox.com](https://mapbox.com)
2. Create a new access token
3. Copy the token to your `.env` files

**Stripe:**
1. Sign up at [stripe.com](https://stripe.com)
2. Get your test API keys from the Dashboard
3. Copy the secret key to `backend/.env`
4. Copy the publishable key to `frontend/.env`

## 📁 Project Structure

```
pittpool/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts        # Prisma client
│   │   ├── controllers/           # Route handlers
│   │   ├── routes/                # API routes
│   │   ├── middleware/            # Auth & error handling
│   │   ├── services/              # Business logic & Socket.io
│   │   ├── utils/                 # JWT & validators
│   │   └── index.ts               # Express app entry
│   ├── .env                       # Environment variables
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── auth/              # Login, Register
│   │   │   ├── layout/            # Navbar, Layout
│   │   │   ├── rides/             # Ride cards
│   │   │   ├── requests/          # Request forms
│   │   │   └── payments/          # Stripe checkout
│   │   ├── pages/                 # Page components
│   │   ├── context/               # React Context (Auth, Socket)
│   │   ├── hooks/                 # Custom hooks
│   │   ├── services/              # API client
│   │   ├── types/                 # TypeScript types
│   │   ├── App.tsx                # Main app component
│   │   ├── main.tsx               # Entry point
│   │   └── index.css              # Tailwind styles
│   ├── .env                       # Environment variables
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `GET /api/users/:id` - Get user by ID

### Rides (Driver)
- `POST /api/rides` - Post a ride
- `GET /api/rides` - Browse all rides
- `GET /api/rides/my-rides` - Get your posted rides
- `GET /api/rides/:id/matches` - See matching rider requests

### Requests (Rider)
- `POST /api/requests` - Create ride request
- `GET /api/requests/my-requests` - Get your requests
- `GET /api/requests/:id/matches` - See matching available rides

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get your bookings
- `PUT /api/bookings/:id/confirm` - Driver confirms booking
- `PUT /api/bookings/:id/complete` - Driver completes ride
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Messages
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/:userId` - Get chat history
- `POST /api/messages` - Send message

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `POST /api/payments/refund` - Refund payment

### Ratings
- `POST /api/ratings` - Rate user after ride
- `GET /api/ratings/user/:userId` - Get user ratings

## 🎨 Main User Flows

### As a Driver:
1. Register/Login
2. Update profile with vehicle information
3. Post a ride with start/end locations, time, seats, and price
4. View matching rider requests
5. Receive booking requests
6. Confirm bookings
7. Message riders
8. Complete ride
9. Receive payment

### As a Rider:
1. Register/Login
2. Browse available rides OR create ride request
3. View match scores
4. Book a ride
5. Message driver
6. Complete payment authorization
7. Complete ride
8. Rate driver

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Post a ride as driver
- [ ] Create ride request as rider
- [ ] View matches
- [ ] Send messages
- [ ] Create booking
- [ ] Confirm booking (driver)
- [ ] Complete ride
- [ ] Submit rating

## 🚢 Deployment

### Database (Render PostgreSQL)
1. Sign up at [render.com](https://render.com)
2. Create a new PostgreSQL database
3. Enable PostGIS extension
4. Copy the DATABASE_URL

### Backend (Render Web Service)
1. Connect your GitHub repository
2. Set:
   - **Build Command**: `cd backend && npm install && npx prisma generate && npm run build`
   - **Start Command**: `cd backend && npm start`
3. Add environment variables from `backend/.env`

### Frontend (Vercel)
1. Connect your GitHub repository
2. Set:
   - **Framework Preset**: Vite
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
3. Add environment variables from `frontend/.env`
4. Update `VITE_API_URL` to your deployed backend URL

## 🔒 Security Considerations

- All passwords are hashed with bcrypt
- JWT tokens for authentication
- CORS configured for specific origins
- Input validation on all endpoints
- SQL injection protected by Prisma
- Stripe handles payment security

## 📝 Environment Variables

### Backend Required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing
- `STRIPE_SECRET_KEY` - Stripe secret key
- `MAPBOX_API_KEY` - Mapbox API key
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend Required:
- `VITE_API_URL` - Backend API URL
- `VITE_MAPBOX_TOKEN` - Mapbox public token
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- Email and phone verification not yet implemented (endpoints are placeholders)
- File upload for documents not implemented (would require cloud storage like AWS S3)
- Push notifications not implemented
- Advanced route visualization on maps pending

## 🔮 Future Enhancements

- Email/SMS verification
- Push notifications for bookings and messages
- Advanced map route visualization
- Return trip planning
- Driver earnings dashboard
- Ride history with filters
- Review moderation system
- Multi-language support
- Mobile app (React Native)

## 💬 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for the Pittsburgh community

