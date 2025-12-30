import React from 'react';
import { FaRegClock, FaTicketAlt } from 'react-icons/fa';
import { IoLocationOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from './badge';
import { formatDate, formatPrice } from '@/lib/utils';

const Event = ({ data }) => {
    const remainingSeats = data.availableSeats - data.bookedSeats;
    const isLowAvailability = remainingSeats < 10;

    return (
        <Link to={`/event/${data._id}`}>
            <motion.div
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
                <div className="relative aspect-video">
                    <img
                        src={
                            data.imageUrl 
                                ? (data.imageUrl.startsWith('/') ? data.imageUrl : `/uploads/${data.imageUrl}`)
                                : "/images/mockhead.jpg"
                        }
                        alt={data.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = "/images/mockhead.jpg";
                        }}
                    />
                    {data.category && (
                        <Badge
                            variant="secondary"
                            className="absolute top-4 left-4"
                        >
                            {data.category}
                        </Badge>
                    )}
                    {isLowAvailability && (
                        <Badge
                            variant="destructive"
                            className="absolute top-4 right-4"
                        >
                            {remainingSeats} seats left
                        </Badge>
                    )}
                </div>

                <div className="p-4 space-y-4">
                    <h3 className="text-lg font-semibold line-clamp-2">
                        {data.title}
                    </h3>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                            <FaRegClock className="flex-shrink-0" />
                            <span className="text-sm">
                                {formatDate(new Date(data.date))}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                            <IoLocationOutline className="flex-shrink-0" />
                            <span className="text-sm">{data.city}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <FaTicketAlt className="text-[#24AE7C]" />
                            <span className="font-bold">
                                {formatPrice(data.price)}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export default Event;

