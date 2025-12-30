import Navbar from "@/components/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import EventCard from "@/components/ui/event-card";

export default function EventsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/user/events', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEvents(response.data.events || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-24 pb-12 px-4 md:px-12">
                <div className="container mx-auto">
                    <h1 className="text-4xl font-bold mb-8">My Events</h1>
                    {loading ? (
                        <p>Loading...</p>
                    ) : events.length === 0 ? (
                        <p>No events found. Create your first event!</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map((event) => (
                                <EventCard key={event._id} data={event} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

