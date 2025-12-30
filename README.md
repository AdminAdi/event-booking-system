# Event Booking System (SwiftSeats)

A full-featured event booking and management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Users can discover events, book tickets, and leave reviews. Event organizers can create and manage events, receive payments securely through PayPal, and customize their profiles.

## 🚀 Tech Stack

### Frontend
- **React.js** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Hot Toast** - Toast notifications
- **Radix UI** - Accessible UI components
- **PayPal React SDK** - PayPal payment integration

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **PayPal Server SDK** - PayPal payment processing
- **CORS** - Cross-origin resource sharing

### Additional Tools
- **Google Maps API** - Location services
- **Axios** - HTTP client
- **Date-fns** - Date manipulation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud)
- **Git** - [Download](https://git-scm.com/)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Fabulosu/event-booking-system.git
cd event-booking-system
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies for both frontend and backend.

### 3. Environment Variables Setup

Create a `.env` file in the root directory of the project. You can copy from `env.template`:

```bash
cp env.template .env
```

Then edit the `.env` file and add your configuration:

```env
# Server Configuration
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/eventbooking
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret_key_here
# Fallback to NEXTAUTH_SECRET for backward compatibility
NEXTAUTH_SECRET=your_jwt_secret_key_here

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_ENVIRONMENT=sandbox
# Use 'sandbox' for testing, 'live' for production

# Frontend Environment Variables (Vite uses VITE_ prefix)
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id_here
VITE_GOOGLE_MAPS_API=your_google_maps_api_key_here
```

#### Getting API Keys:

**MongoDB:**
- Local: Use `mongodb://localhost:27017/eventbooking`
- Atlas: Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), get your connection string

**PayPal:**
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Log in with your PayPal account
3. Navigate to "My Apps & Credentials"
4. Create a new app (Sandbox for testing)
5. Copy the Client ID and Secret

**Google Maps API:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Maps JavaScript API"
4. Create credentials (API Key)
5. Copy the API key

**JWT Secret:**
- Generate a random string (at least 32 characters)
- You can use: `openssl rand -base64 32` or any random string generator

### 4. Create Required Directories

Create the uploads directory for storing event images:

```bash
# Windows (PowerShell)
New-Item -ItemType Directory -Force -Path "public\uploads"

# Linux/Mac
mkdir -p public/uploads
```

### 5. Run the Application

#### Option 1: Run Frontend and Backend Separately

**Terminal 1 - Start Backend Server:**
```bash
npm run server
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Start Frontend Dev Server:**
```bash
npm run dev
```
Frontend will run on `http://localhost:3000`

#### Option 2: Run Both Together (Recommended)

```bash
npm run dev:all
```

This will start both frontend and backend concurrently.

### 6. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📁 Project Structure

```
Event-Booking-System/
├── public/                 # Static files
│   ├── images/            # Default images
│   └── uploads/           # User uploaded event images
├── server/                # Backend (Express.js)
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication routes
│   │   ├── events.js      # Event CRUD operations
│   │   ├── bookings.js    # Booking management
│   │   ├── checkout.js    # PayPal payment processing
│   │   ├── user.js        # User profile routes
│   │   ├── rating.js      # Reviews and ratings
│   │   └── webhook.js     # Webhook handlers
│   └── index.js           # Server entry point
├── src/                   # Frontend (React.js)
│   ├── components/        # Reusable components
│   │   ├── ui/           # UI components (buttons, cards, etc.)
│   │   ├── navbar.jsx     # Navigation bar
│   │   └── bottombar.jsx # Bottom navigation
│   ├── contexts/         # React contexts
│   │   └── AuthContext.jsx # Authentication context
│   ├── pages/            # Page components
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ExplorePage.jsx
│   │   ├── EventsPage.jsx
│   │   ├── EventDetailPage.jsx
│   │   ├── CreateEventPage.jsx
│   │   ├── EditEventPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── SettingsPage.jsx
│   │   ├── SuccessPage.jsx
│   │   └── CancelPage.jsx
│   ├── utils/            # Utility functions
│   │   ├── models.js     # Mongoose schemas
│   │   ├── database.js   # Database connection
│   │   └── paypal.js     # PayPal utilities
│   ├── lib/              # Library utilities
│   │   └── utils.js      # Helper functions
│   ├── App.jsx           # Main app component
│   └── main.jsx          # React entry point
├── .env                  # Environment variables (not in git)
├── env.template          # Environment variables template
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
└── tailwind.config.js    # Tailwind CSS configuration
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get single event
- `POST /api/events/create` - Create new event (requires auth)
- `PUT /api/events/edit/:id` - Update event (requires auth)

### Bookings
- `GET /api/bookings` - Get user bookings (requires auth)
- `POST /api/bookings` - Create booking (requires auth)

### Payments
- `POST /api/checkout` - Create PayPal order
- `POST /api/checkout/capture` - Capture PayPal payment

### User
- `GET /api/user/:id` - Get user profile
- `PUT /api/user/:id` - Update user profile (requires auth)

### Ratings
- `POST /api/rating/:eventId` - Add rating/review (requires auth)

### Health
- `GET /api/health` - Server and database health check

## ✨ Features

### User Features
- 🔐 **Authentication**: Secure registration and login with JWT
- 🎫 **Event Discovery**: Browse and search events with filters
- 💳 **Ticket Booking**: Book tickets with PayPal payment integration
- ⭐ **Reviews & Ratings**: Rate and review events
- 👤 **Profile Management**: Update profile and settings
- 📍 **Location Services**: Google Maps integration for event locations

### Organizer Features
- ➕ **Create Events**: Create events with images, location, and details
- ✏️ **Edit Events**: Update event information
- 📊 **View Bookings**: See all bookings for your events
- 💰 **Payment Processing**: Receive payments via PayPal
- 🖼️ **Image Upload**: Upload event images

### Technical Features
- 🔒 **Secure Authentication**: JWT-based authentication
- 📁 **File Uploads**: Multer for handling image uploads
- 🌐 **CORS Enabled**: Cross-origin requests supported
- 📱 **Responsive Design**: Mobile-friendly UI
- 🎨 **Modern UI**: TailwindCSS with Radix UI components
- ⚡ **Fast Development**: Vite for quick hot module replacement

## 🚦 Available Scripts

- `npm run dev` - Start frontend development server (port 3000)
- `npm run server` - Start backend server (port 5000)
- `npm run dev:all` - Start both frontend and backend concurrently
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running (if using local MongoDB)
- Check your `MONGO_URI` in `.env` file
- Verify network access if using MongoDB Atlas
- Check the health endpoint: `http://localhost:5000/api/health`

### PayPal Payment Issues
- Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are set correctly
- Ensure `PAYPAL_ENVIRONMENT` matches your credentials (sandbox/live)
- Check that `VITE_PAYPAL_CLIENT_ID` is set for frontend
- Restart server after changing `.env` file

### Image Upload Issues
- Ensure `public/uploads` directory exists
- Check file permissions on the uploads directory
- Verify Multer configuration in `server/routes/events.js`

### Port Already in Use
- Change `PORT` in `.env` file (backend)
- Change port in `vite.config.js` (frontend)
- Kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:5000 | xargs kill
  ```

### Environment Variables Not Loading
- Ensure `.env` file is in the root directory
- Restart the server after changing `.env`
- Check for typos in variable names
- Ensure no quotes around values (unless needed)
- Verify `dotenv.config()` is called in `server/index.js`

### Frontend Not Connecting to Backend
- Verify backend is running on port 5000
- Check `vite.config.js` proxy configuration
- Ensure CORS is enabled in backend
- Check browser console for errors

## 📝 Notes

- The project uses ES modules (`"type": "module"` in package.json)
- Frontend environment variables must be prefixed with `VITE_` to be accessible
- Image uploads are stored in `public/uploads/` directory
- Default images are in `public/images/` directory
- The project was converted from Next.js/TypeScript to React.js/JavaScript

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Happy Coding! 🎉**
#   e v e n t - b o o k i n g - s y s t e m  
 