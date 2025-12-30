import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import SessionProvider from './components/session-provider';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ExplorePage from './pages/ExplorePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SuccessPage from './pages/SuccessPage';
import CancelPage from './pages/CancelPage';

function App() {
  return (
    <Router>
      <SessionProvider>
        <div className="min-h-screen">
          <Toaster position="bottom-right" />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/event/:id" element={<EventDetailPage />} />
            <Route path="/events/new" element={<CreateEventPage />} />
            <Route path="/events/edit/:id" element={<EditEventPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/cancel" element={<CancelPage />} />
          </Routes>
        </div>
      </SessionProvider>
    </Router>
  );
}

export default App;
