import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/navbar";
import { toast } from "react-hot-toast";

export default function SuccessPage() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('token') || searchParams.get('PayerID');
    const [confirmed, setConfirmed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // For PayPal, payment is already captured in onApprove
        // Just show success message
        setConfirmed(true);
        setLoading(false);
        toast.success('Payment successful! Your booking is complete.');
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-24 pb-12 px-4 md:px-12">
                <div className="container mx-auto text-center">
                    {loading ? (
                        <>
                            <h1 className="text-4xl font-bold mb-4 text-blue-600">Processing Payment...</h1>
                            <p className="text-gray-600 mb-8">Please wait while we confirm your booking.</p>
                        </>
                    ) : confirmed ? (
                        <>
                            <h1 className="text-4xl font-bold mb-4 text-green-600">Payment Successful!</h1>
                            <p className="text-gray-600 mb-8">Your booking has been confirmed.</p>
                            <div className="flex gap-4 justify-center">
                                <Link to="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Return to Home
                                </Link>
                                <Link to="/events" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                    View My Events
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1 className="text-4xl font-bold mb-4 text-yellow-600">Payment Received</h1>
                            <p className="text-gray-600 mb-8">We're processing your booking. You'll receive a confirmation email shortly.</p>
                            <Link to="/" className="text-blue-600 hover:underline">Return to Home</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

