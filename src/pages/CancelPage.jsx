import { Link } from "react-router-dom";
import Navbar from "@/components/navbar";

export default function CancelPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-24 pb-12 px-4 md:px-12">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4 text-red-600">Payment Cancelled</h1>
                    <p className="text-gray-600 mb-8">Your payment was cancelled. You can try again.</p>
                    <Link to="/" className="text-blue-600 hover:underline">Return to Home</Link>
                </div>
            </div>
        </div>
    );
}

