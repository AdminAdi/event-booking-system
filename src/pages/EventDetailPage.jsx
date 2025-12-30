import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, formatPrice } from "@/lib/utils";
import { 
    Calendar, 
    MapPin, 
    DollarSign, 
    Users, 
    Clock,
    User,
    ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import { useAuth } from "@/contexts/AuthContext";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";
import { toast } from "react-hot-toast";

export default function EventDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ticketsToBuy, setTicketsToBuy] = useState(1);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API || "",
    });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`/api/events/${id}`);
                setEvent(response.data);
            } catch (error) {
                console.error(error);
                setError('Failed to load event');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchEvent();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="pt-24 pb-12 px-4 md:px-12">
                    <div className="container mx-auto">
                        <Skeleton className="h-12 w-3/4 mb-4" />
                        <Skeleton className="h-64 w-full mb-8" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Skeleton className="h-64" />
                            <Skeleton className="h-64" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="pt-24 pb-12 px-4 md:px-12">
                    <div className="container mx-auto text-center">
                        <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
                        <p className="text-gray-600 mb-8">{error || 'The event you are looking for does not exist.'}</p>
                        <Link to="/explore">
                            <Button>Browse Events</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const remainingSeats = event.availableSeats - event.bookedSeats;
    const isSoldOut = remainingSeats === 0;
    const isLowAvailability = remainingSeats < 10 && remainingSeats > 0;

    // Parse location if available (assuming we store it or can reverse geocode)
    const mapCenter = event.address ? { lat: 40.7128, lng: -74.0060 } : { lat: 40.7128, lng: -74.0060 };

    const maxTickets = event ? event.availableSeats - event.bookedSeats : 0;
    const freeTicketLimit = 1;
    const paidTicketLimit = 10;
    const effectiveLimit = event.price === 0 ? freeTicketLimit : paidTicketLimit;
    const finalMaxLimit = Math.min(maxTickets, effectiveLimit);

    const createPayPalOrder = async (data, actions) => {
        if (!user) {
            toast.error('Please sign in to purchase tickets');
            navigate('/login');
            return;
        }

        if (ticketsToBuy === 0) {
            toast.error('Please select at least one ticket');
            return;
        }

        try {
            const response = await axios.post('/api/checkout', {
                amount: event.price,
                quantity: ticketsToBuy,
                eventName: event?.title,
                userId: user?.id,
                eventId: event?._id,
            });

            if (response.status === 200 && response.data.id) {
                return response.data.id;
            } else {
                toast.error('Failed to create PayPal order. Please try again.');
                throw new Error('Failed to create order');
            }
        } catch (error) {
            console.error('Error creating PayPal order:', error);
            toast.error(error.response?.data?.error || 'An error occurred. Please try again.');
            throw error;
        }
    };

    const onApprove = async (data, actions) => {
        try {
            // Capture the payment
            const response = await axios.post('/api/checkout/capture', {
                orderId: data.orderID
            });

            if (response.data.success) {
                toast.success('Payment successful!');
                navigate('/success', { state: { orderId: data.orderID } });
            } else {
                toast.error('Payment failed. Please try again.');
            }
        } catch (error) {
            console.error('Error capturing payment:', error);
            toast.error('Failed to process payment. Please contact support.');
        }
    };

    const onError = (err) => {
        console.error('PayPal error:', err);
        toast.error('An error occurred with PayPal. Please try again.');
    };

    const onCancel = () => {
        toast.error('Payment cancelled');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-24 pb-32">
                <div className="container mx-auto px-4 max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Link to="/explore" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#24AE7C] mb-6">
                            <ArrowLeft size={20} />
                            <span>Back to Events</span>
                        </Link>

                        {/* Event Image */}
                        <div className="relative mb-8 rounded-lg overflow-hidden">
                            <img
                                src={
                                    event.imageUrl 
                                        ? (event.imageUrl.startsWith('/') ? event.imageUrl : `/uploads/${event.imageUrl}`)
                                        : '/images/mockhead.jpg'
                                }
                                alt={event.title}
                                className="w-full h-96 object-cover"
                                onError={(e) => {
                                    e.target.src = "/images/mockhead.jpg";
                                }}
                            />
                            <div className="absolute top-4 left-4">
                                <Badge variant="secondary" className="text-lg px-4 py-2">
                                    {event.category}
                                </Badge>
                            </div>
                            {isSoldOut && (
                                <div className="absolute top-4 right-4">
                                    <Badge variant="destructive" className="text-lg px-4 py-2">
                                        SOLD OUT
                                    </Badge>
                                </div>
                            )}
                            {isLowAvailability && !isSoldOut && (
                                <div className="absolute top-4 right-4">
                                    <Badge variant="destructive" className="text-lg px-4 py-2">
                                        Only {remainingSeats} left!
                                    </Badge>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                <div>
                                    <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
                                    <div className="flex items-center gap-4 mb-6">
                                        {event.organizer && (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={`/uploads/${event.organizer.profilePicture}`} />
                                                    <AvatarFallback>
                                                        {event.organizer.username?.slice(0, 2).toUpperCase() || 'OR'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-gray-600">by {event.organizer.username}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>About This Event</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                            {event.description}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Event Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <Calendar className="text-[#24AE7C] mt-1" size={24} />
                                            <div>
                                                <p className="font-semibold">Date & Time</p>
                                                <p className="text-gray-600">{formatDate(new Date(event.date))}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <MapPin className="text-[#24AE7C] mt-1" size={24} />
                                            <div>
                                                <p className="font-semibold">Location</p>
                                                <p className="text-gray-600">{event.address}</p>
                                                <p className="text-gray-600">{event.city}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <DollarSign className="text-[#24AE7C] mt-1" size={24} />
                                            <div>
                                                <p className="font-semibold">Price</p>
                                                <p className="text-gray-600 text-xl font-bold">{formatPrice(event.price)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <Users className="text-[#24AE7C] mt-1" size={24} />
                                            <div>
                                                <p className="font-semibold">Seating</p>
                                                <p className="text-gray-600">
                                                    {remainingSeats} of {event.availableSeats} seats available
                                                </p>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                                    <div
                                                        className="bg-[#24AE7C] h-2.5 rounded-full"
                                                        style={{ width: `${(remainingSeats / event.availableSeats) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Map */}
                                {event.address && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Location Map</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-64 rounded-lg overflow-hidden">
                                                {isLoaded ? (
                                                    <GoogleMap
                                                        mapContainerStyle={{ width: "100%", height: "100%" }}
                                                        center={mapCenter}
                                                        zoom={15}
                                                    >
                                                        <Marker position={mapCenter} />
                                                    </GoogleMap>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                        <p className="text-gray-500">Loading map...</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="lg:col-span-1">
                                <Card className="sticky top-24">
                                    <CardHeader>
                                        <CardTitle className="text-2xl">{formatPrice(event.price)}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-600">
                                                {remainingSeats} {remainingSeats === 1 ? 'seat' : 'seats'} available
                                            </p>
                                            {isSoldOut && (
                                                <p className="text-sm text-red-600 font-semibold">
                                                    This event is sold out
                                                </p>
                                            )}
                                        </div>

                                        {!isSoldOut && (
                                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button 
                                                        className="w-full bg-[#24AE7C] hover:bg-[#329c75] text-white text-lg py-6"
                                                        disabled={!user}
                                                    >
                                                        {user ? (event.price === 0 ? "Get Ticket" : "Purchase Ticket") : "Sign in to Purchase"}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[550px]">
                                                    <DialogHeader>
                                                        <DialogTitle className='font-bold text-2xl'>{event.title}</DialogTitle>
                                                        <DialogDescription className='flex flex-col gap-2 mt-2'>
                                                            <div className='flex flex-row gap-2 items-center'>
                                                                <MapPin className="text-[#24AE7C]" size={16} />
                                                                {event.address}
                                                            </div>
                                                            <div className='flex flex-row gap-2 items-center'>
                                                                <Calendar className="text-[#24AE7C]" size={16} />
                                                                {new Date(event.date).toLocaleDateString('en-US', {
                                                                    weekday: 'long',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                })}
                                                            </div>
                                                            <div className='flex flex-row gap-2 items-center'>
                                                                <Clock className="text-[#24AE7C]" size={16} />
                                                                {new Date(event.date).toLocaleTimeString('en-US', {
                                                                    hour: 'numeric',
                                                                    minute: '2-digit',
                                                                    hour12: true,
                                                                })}
                                                            </div>
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    
                                                    <div className='w-full flex justify-between items-center py-4 border-t border-b'>
                                                        <div className='flex flex-col'>
                                                            <p className='text-sm font-semibold'>{event.title}</p>
                                                            <p className='font-bold text-[#24AE7C] text-lg'>{event.price === 0 ? "FREE" : formatPrice(event.price)}</p>
                                                        </div>
                                                        <div className='flex flex-row gap-3 items-center'>
                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => setTicketsToBuy((prev) => Math.max(1, prev - 1))}
                                                                disabled={ticketsToBuy <= 1}
                                                                className="h-10 w-10 p-0"
                                                            >
                                                                <CiCircleMinus size={24} />
                                                            </Button>
                                                            <p className='text-xl font-semibold w-8 text-center'>{ticketsToBuy}</p>
                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => setTicketsToBuy((prev) => Math.min(prev + 1, finalMaxLimit))}
                                                                disabled={ticketsToBuy >= finalMaxLimit}
                                                                className="h-10 w-10 p-0"
                                                            >
                                                                <CiCirclePlus size={24} />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <DialogFooter className='w-full'>
                                                        <div className='w-full space-y-4'>
                                                            <div className='flex justify-between items-center'>
                                                                <div>
                                                                    <p className='font-bold text-xl'>{formatPrice(event.price * ticketsToBuy)}</p>
                                                                    <p className='text-xs text-gray-600'>{ticketsToBuy} {ticketsToBuy === 1 ? 'ticket' : 'tickets'}</p>
                                                                </div>
                                                            </div>
                                                            {user && ticketsToBuy > 0 && (
                                                                <PayPalScriptProvider 
                                                                    options={{ 
                                                                        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "",
                                                                        currency: "USD"
                                                                    }}
                                                                >
                                                                    <PayPalButtons
                                                                        createOrder={createPayPalOrder}
                                                                        onApprove={onApprove}
                                                                        onError={onError}
                                                                        onCancel={onCancel}
                                                                        style={{
                                                                            layout: "vertical",
                                                                            color: "blue",
                                                                            shape: "rect",
                                                                            label: "paypal"
                                                                        }}
                                                                    />
                                                                </PayPalScriptProvider>
                                                            )}
                                                        </div>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
