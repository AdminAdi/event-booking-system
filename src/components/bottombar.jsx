import React, { useEffect, useState } from 'react'
import { Button } from './ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { IoLocationOutline } from 'react-icons/io5';
import { Separator } from './ui/separator';
import { FaRegCalendar, FaRegClock } from 'react-icons/fa';
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";
import axios from 'axios';
import getStripe from '@/utils/stripe';
import { useAuth } from '@/contexts/AuthContext';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils';

const BottomBar = ({ price = 0, eventId }) => {
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [ticketsToBuy, setTicketsToBuy] = useState(1);

    useEffect(() => {
        if (eventId) {
            const fetchEvent = async () => {
                try {
                    const response = await axios.get(`/api/events/${eventId}`);
                    setEvent(response.data);
                } catch (err) {
                    console.log(err);
                }
            };

            fetchEvent();
        }
    }, [eventId]);

    const handleCheckout = async () => {
        if (!user) {
            alert('Please sign in to purchase tickets');
            return;
        }

        if (ticketsToBuy === 0) {
            alert('Please select at least one ticket');
            return;
        }

        const stripe = await getStripe();
        if (!stripe) {
            alert('Stripe failed to load. Please refresh the page.');
            return;
        }

        try {
            const response = await axios.post('/api/checkout', {
                amount: price,
                quantity: ticketsToBuy,
                eventName: event?.title,
                userId: user?.id,
                eventId: event?._id,
            });

            if (response.status === 200 && response.data.id) {
                const result = await stripe.redirectToCheckout({
                    sessionId: response.data.id
                });
                
                if (result.error) {
                    alert(result.error.message);
                }
            } else {
                alert('Failed to create checkout session. Please try again.');
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
            alert(error.response?.data?.error || 'An error occurred. Please try again.');
        }
    };

    const maxTickets = event ? event.availableSeats - event.bookedSeats : 0;
    const freeTicketLimit = 1;
    const paidTicketLimit = 10;
    const effectiveLimit = price === 0 ? freeTicketLimit : paidTicketLimit;
    const finalMaxLimit = Math.min(maxTickets, effectiveLimit);

    return (
        <div className='flex fixed z-50 bottom-0 px-12 justify-between items-center w-screen h-[80px] bg-white shadow-inner shadow-neutral-400'>
            <p className="font-bold text-2xl">{price === 0 ? "FREE" : `$${price}`}</p>
            <Dialog>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <DialogTrigger asChild>
                                <Button className='bg-[#24AE7C] hover:bg-[#329c75] text-white scale-110' disabled={!user}>{price === 0 ? "Get Ticket" : "Purchase Ticket"}</Button>
                            </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent className={cn(user ? "hidden" : "flex")}>
                            <p>You need to be signed in to purchase a ticket!</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle className='font-bold text-2xl'>{event?.title}</DialogTitle>
                        <DialogDescription className='flex flex-col gap-2'>
                            <div className='flex flex-row gap-2 items-center'>
                                <IoLocationOutline className="text-[#24AE7C]" />
                                {event?.address}
                            </div>
                            <div className='flex flex-row gap-2 items-center'>
                                <FaRegCalendar className="text-[#24AE7C]" />
                                {event && new Date(event?.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </div>
                            <div className='flex flex-row gap-2 items-center'>
                                <FaRegClock className="text-[#24AE7C]" />
                                {event && new Date(event?.date).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                })}
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <Separator orientation='horizontal' className='w-full bg-gray-600' />
                    <div className='w-full h-full flex justify-between py-4 shadow-xl p-2'>
                        <div className='flex flex-col justify-center'>
                            <p className='text-sm font-semibold'>{event?.title}</p>
                            <p className='font-bold text-[#24AE7C]'>{price === 0 ? "FREE" : `$${price}`}</p>
                        </div>
                        <div className='flex flex-row gap-2 items-center'>
                            <Button
                                variant="ghost"
                                onClick={() => setTicketsToBuy((prev) => Math.max(0, prev - 1))}
                                className={ticketsToBuy === 0 ? "text-gray-600" : ""}
                                disabled={ticketsToBuy === 0}
                            >
                                <CiCircleMinus size={30} />
                            </Button>
                            <p className='text-xl'>{ticketsToBuy}</p>
                            <Button
                                variant="ghost"
                                onClick={() => setTicketsToBuy((prev) => Math.min(prev + 1, finalMaxLimit))}
                                className={ticketsToBuy >= finalMaxLimit ? "text-gray-600" : ""}
                                disabled={ticketsToBuy >= finalMaxLimit}
                            >
                                <CiCirclePlus size={30} />
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className='w-full'>
                        <div className='w-full flex justify-between'>
                            <div>
                                <p className='font-bold text-xl'>{`$${price && (price * ticketsToBuy).toFixed(2)}`}</p>
                                <p className='text-xs text-gray-600'>{`${ticketsToBuy}x Ticket`}</p>
                            </div>

                            <Button 
                                type="button" 
                                onClick={handleCheckout} 
                                disabled={ticketsToBuy === 0} 
                                className='h-full bg-[#24AE7C] hover:bg-[#329c75]'
                            >
                                Continue
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default BottomBar;

