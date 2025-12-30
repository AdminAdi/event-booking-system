import Navbar from "@/components/navbar";
import { useParams } from "react-router-dom";

export default function ProfilePage() {
    const { userId } = useParams();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-24 pb-12 px-4 md:px-12">
                <div className="container mx-auto">
                    <h1 className="text-4xl font-bold mb-8">User Profile</h1>
                    <p>Profile page for user {userId} will be implemented here.</p>
                </div>
            </div>
        </div>
    );
}

