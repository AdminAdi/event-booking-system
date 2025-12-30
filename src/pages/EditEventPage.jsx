import Navbar from "@/components/navbar";
import { useParams } from "react-router-dom";

export default function EditEventPage() {
    const { id } = useParams();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-24 pb-12 px-4 md:px-12">
                <div className="container mx-auto">
                    <h1 className="text-4xl font-bold mb-8">Edit Event</h1>
                    <p>Event editing form will be implemented here for event {id}.</p>
                </div>
            </div>
        </div>
    );
}

