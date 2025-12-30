import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePickerDemo } from "@/components/ui/date-picker";
import Navbar from "@/components/navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import { motion } from "framer-motion";
import { Calendar, MapPin, DollarSign, Users, Clock, Image as ImageIcon } from "lucide-react";

const categories = [
    { value: 'music', label: 'Music' },
    { value: 'sports', label: 'Sports' },
    { value: 'tech', label: 'Tech' },
    { value: 'arts', label: 'Arts' },
    { value: 'food', label: 'Food & Drink' },
    { value: 'business', label: 'Business' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' },
];

export default function CreateEventPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [seats, setSeats] = useState(10);
    const [time, setTime] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState(null);
    const [center, setCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC
    const [date, setDate] = useState(null);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API || "",
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Get user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCenter({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.log("Geolocation error:", error);
                }
            );
        }
    }, [user, navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMapClick = (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setLocation({ lat, lng });
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (title.length < 3) {
            newErrors.title = "Title must be at least 3 characters";
            isValid = false;
        }

        if (description.length < 10) {
            newErrors.description = "Description must be at least 10 characters";
            isValid = false;
        }

        if (!category) {
            newErrors.category = "Please select a category";
            isValid = false;
        }

        if (!date) {
            newErrors.date = "Please select a date";
            isValid = false;
        }

        if (!time) {
            newErrors.time = "Please enter a time";
            isValid = false;
        }

        if (!location) {
            newErrors.location = "Please select a location on the map";
            isValid = false;
        }

        if (seats < 1) {
            newErrors.seats = "Seats must be at least 1";
            isValid = false;
        }

        if (price < 0) {
            newErrors.price = "Price cannot be negative";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("price", price.toString());
            formData.append("availableSeats", seats.toString());
            formData.append("category", category);
            formData.append("time", time);
            
            // Format date as YYYY-MM-DD for backend parsing
            if (date) {
                const dateStr = date instanceof Date 
                    ? date.toISOString().split('T')[0] 
                    : new Date(date).toISOString().split('T')[0];
                formData.append("date", dateStr);
            } else {
                toast.error("Please select a date");
                setIsSubmitting(false);
                return;
            }
            
            if (location) {
                formData.append("location", JSON.stringify(location));
            }
            
            if (image) {
                formData.append("file", image);
            }

            const token = localStorage.getItem('token');
            const response = await fetch("/api/events/create", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success("Event created successfully!");
                navigate("/events");
            } else {
                toast.error(data.error || "Failed to create event");
            }
        } catch (error) {
            console.error("Error creating event:", error);
            toast.error("An error occurred while creating the event");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-24 pb-12 px-4 md:px-12">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-4xl font-bold mb-2">Create New Event</h1>
                        <p className="text-gray-600">Fill in the details below to create your event</p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Event Title *</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter event title"
                                        className={errors.title ? "border-red-500" : ""}
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe your event..."
                                        rows={5}
                                        className={errors.description ? "border-red-500" : ""}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="category">Category *</Label>
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.value} value={cat.value}>
                                                        {cat.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category && (
                                            <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="price">Price (USD) *</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <Input
                                                id="price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={price}
                                                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                className={`pl-10 ${errors.price ? "border-red-500" : ""}`}
                                            />
                                        </div>
                                        {errors.price && (
                                            <p className="text-sm text-red-500 mt-1">{errors.price}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Date & Time</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="date">Date *</Label>
                                        <DatePickerDemo
                                            onDateChange={setDate}
                                            className={errors.date ? "border-red-500" : ""}
                                        />
                                        {errors.date && (
                                            <p className="text-sm text-red-500 mt-1">{errors.date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="time">Time *</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <Input
                                                id="time"
                                                type="time"
                                                value={time}
                                                onChange={(e) => setTime(e.target.value)}
                                                className={`pl-10 ${errors.time ? "border-red-500" : ""}`}
                                            />
                                        </div>
                                        {errors.time && (
                                            <p className="text-sm text-red-500 mt-1">{errors.time}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Location</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Label>Click on the map to select location *</Label>
                                {location && (
                                    <p className="text-sm text-green-600">
                                        Location selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                                    </p>
                                )}
                                {errors.location && (
                                    <p className="text-sm text-red-500">{errors.location}</p>
                                )}
                                <div className="h-96 rounded-lg overflow-hidden border">
                                    {isLoaded ? (
                                        <GoogleMap
                                            mapContainerStyle={{ width: "100%", height: "100%" }}
                                            center={center}
                                            zoom={14}
                                            onClick={handleMapClick}
                                        >
                                            {location && <Marker position={location} />}
                                        </GoogleMap>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <p className="text-gray-500">Loading map...</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Event Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="seats">Available Seats *</Label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <Input
                                            id="seats"
                                            type="number"
                                            min="1"
                                            value={seats}
                                            onChange={(e) => setSeats(parseInt(e.target.value) || 1)}
                                            className={`pl-10 ${errors.seats ? "border-red-500" : ""}`}
                                        />
                                    </div>
                                    {errors.seats && (
                                        <p className="text-sm text-red-500 mt-1">{errors.seats}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="image">Event Image</Label>
                                    <div className="mt-2">
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <Label htmlFor="image" className="cursor-pointer">
                                            <div className="flex items-center gap-2 p-4 border-2 border-dashed rounded-lg hover:border-[#24AE7C] transition-colors">
                                                <ImageIcon className="text-gray-400" size={24} />
                                                <span className="text-gray-600">
                                                    {image ? image.name : "Click to upload image"}
                                                </span>
                                            </div>
                                        </Label>
                                        {imagePreview && (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="mt-4 w-full h-48 object-cover rounded-lg"
                                            />
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/events")}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-[#24AE7C] hover:bg-[#329c75]"
                            >
                                {isSubmitting ? "Creating..." : "Create Event"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
