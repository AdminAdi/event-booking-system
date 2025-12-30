# Conversion Notes: Next.js/TypeScript to React/JavaScript

This project has been converted from Next.js with TypeScript to React with JavaScript.

## Changes Made

### 1. Package.json
- Removed Next.js dependencies
- Added Vite, React Router, Express
- Removed TypeScript dependencies
- Added jsonwebtoken, dotenv, cors for backend

### 2. Project Structure
- Created `src/main.jsx` - React entry point
- Created `src/App.jsx` - Main app with React Router
- Created `src/pages/` - All page components
- Created `server/` - Express backend API routes
- Converted all `.ts`/`.tsx` files to `.js`/`.jsx`

### 3. Key Conversions
- `next/image` → Regular `<img>` tags
- `next/link` → `react-router-dom` `Link`
- `next/navigation` → `react-router-dom` hooks
- `next-auth` → Custom AuthContext with JWT
- Next.js API routes → Express backend routes

### 4. Remaining Tasks
Some UI components may still need conversion. Check `src/components/ui/` for any remaining `.tsx` files and convert them to `.jsx` by:
1. Removing TypeScript type annotations
2. Changing file extension from `.tsx` to `.jsx`
3. Removing `"use client"` directives (not needed in React)
4. Updating imports if needed

### 5. Environment Variables
Update your `.env` file:
- `VITE_STRIPE_PUBLISHABLE_KEY` (instead of `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
- `JWT_SECRET` (for authentication)
- `MONGO_URI` (MongoDB connection)
- `STRIPE_SECRET_KEY` (Stripe secret key)
- `STRIPE_WEBHOOK_SECRET` (Stripe webhook secret)

### 6. Running the Project
- Frontend: `npm run dev` (runs Vite on port 3000)
- Backend: `npm run server` (runs Express on port 5000)
- Both: `npm run dev:all` (runs both concurrently)

### 7. API Routes
All API routes are now in `server/routes/`:
- `/api/auth` - Authentication
- `/api/events` - Events CRUD
- `/api/user` - User operations
- `/api/checkout` - Stripe checkout
- `/api/webhook` - Stripe webhooks
- `/api/bookings` - Booking operations
- `/api/rating` - Reviews and ratings

The frontend proxies API requests to the backend via Vite config.

