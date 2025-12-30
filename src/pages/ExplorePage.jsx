import { Suspense } from 'react';
import Navbar from "@/components/navbar";
import { Input } from "@/components/ui/input";
import { IoLocationOutline } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Events from "@/components/events";
import Filter from '@/components/ui/filter-card';
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import debounce from 'debounce';

const SearchBar = ({ onSearch }) => {
    const [location, setLocation] = useState('');
    const [eventName, setEventName] = useState('');

    const debouncedSearch = debounce((loc, evt) => {
        onSearch(loc, evt);
    }, 500);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-row items-center gap-2 w-full max-w-2xl"
        >
            <div className="relative flex-1">
                <IoLocationOutline className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
                <Input
                    className="w-full pl-10 rounded-lg border-gray-300"
                    placeholder="Enter Location"
                    value={location}
                    onChange={(e) => {
                        setLocation(e.target.value);
                        debouncedSearch(e.target.value, eventName);
                    }}
                />
            </div>
            <div className="relative flex-1">
                <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
                <Input
                    className="w-full pl-10 rounded-lg border-gray-300"
                    placeholder="Search Event"
                    value={eventName}
                    onChange={(e) => {
                        setEventName(e.target.value);
                        debouncedSearch(location, e.target.value);
                    }}
                />
            </div>
        </motion.div>
    );
};

export default function ExplorePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || 'all',
        location: searchParams.get('location') || '',
        name: searchParams.get('name') || '',
        dateFrom: searchParams.get('dateFrom') || '',
        dateTo: searchParams.get('dateTo') || '',
    });

    const handleSearch = (location, eventName) => {
        const params = new URLSearchParams(searchParams);
        if (location) params.set('location', location);
        else params.delete('location');
        if (eventName) params.set('name', eventName);
        else params.delete('name');
        setSearchParams(params);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params.set(key, value);
            }
        });
        setSearchParams(params);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-24 pb-12 px-4 md:px-12">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="container mx-auto"
                >
                    <h1 className="text-4xl font-bold mb-8">Explore Events</h1>
                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                        <div className="flex-1">
                            <SearchBar onSearch={handleSearch} />
                        </div>
                        <Filter onFilterChange={handleFilterChange} initialFilters={filters} />
                    </div>
                    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                        <Events />
                    </Suspense>
                </motion.div>
            </div>
        </div>
    );
}

