import React, { useEffect, useState } from 'react';
import { Button, buttonVariants } from './ui/button';
import { FaCalendarMinus, FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const NavLink = ({ to, children, className, onClick }) => (
    <Link
        to={to}
        className={className}
        onClick={onClick}
    >
        {children}
    </Link>
);

const Navbar = ({ background = true, className }) => {
    const { user, signOut } = useAuth();
    const [userBalance, setUserBalance] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchUserBalance = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get("/api/user/balance", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response) setUserBalance(response.data.balance);
            } catch (error) {
                console.error(error);
            }
        }

        if (user) fetchUserBalance();
    }, [user]);

    const handleSignOut = async () => {
        await signOut();
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const navbarClassName = cn(
        'fixed z-50 top-0 w-full h-[80px] flex justify-between items-center px-4 md:px-12',
        'transition-all duration-300',
        {
            'bg-white shadow-md': background || isScrolled,
            'bg-transparent': !background && !isScrolled
        },
        className
    );

    const linkClassName = cn(
        buttonVariants({ variant: "ghost" }),
        "transition-colors duration-300",
        {
            'text-black hover:text-[#329c75]': background || isScrolled,
            'text-white hover:text-[#329c75]': !background && !isScrolled
        },
        "hover:bg-transparent hover:cursor-pointer"
    );

    return (
        <nav className={navbarClassName}>
            <div className='flex flex-row items-center gap-2'>
                <NavLink to="/" className={cn(linkClassName, "flex flex-row gap-3")}>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <img
                            src="/images/logo.webp"
                            alt="Logo"
                            width={40}
                            height={40}
                            className="rounded-2xl"
                        />
                    </motion.div>
                    <p className={cn("font-semibold text-2xl", {
                        "text-black": background || isScrolled,
                        "text-white": !background && !isScrolled
                    })}>
                        SwiftSeats
                    </p>
                </NavLink>
                <Separator orientation='vertical' className='hidden md:block bg-muted-foreground h-1/3' />
                <NavLink to="/explore" className={cn(linkClassName, "hidden md:block")}>
                    Explore events
                </NavLink>
            </div>

            <div className='hidden md:flex flex-row items-center gap-5'>
                {user ? (
                    <UserMenu
                        user={user}
                        userBalance={userBalance}
                        handleSignOut={handleSignOut}
                        background={background}
                        isScrolled={isScrolled}
                    />
                ) : (
                    <AuthLinks background={background} isScrolled={isScrolled} />
                )}
                <CreateEventButton />
            </div>

            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleMenu}
                aria-label="Toggle navigation menu"
                className={cn(buttonVariants({ variant: "ghost" }), {
                    'text-black': background || isScrolled,
                    'text-white': !background && !isScrolled
                }, 'md:hidden')}
            >
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </motion.button>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-[80px] left-0 w-full bg-white shadow-md flex flex-col items-center gap-4 py-4 md:hidden"
                    >
                        <MobileMenuContent
                            user={user}
                            handleSignOut={handleSignOut}
                            toggleMenu={toggleMenu}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const UserMenu = ({ user, userBalance, handleSignOut, background, isScrolled }) => (
    <DropdownMenu>
        <DropdownMenuTrigger>
            <motion.div
                whileHover={{ scale: 1.05 }}
                className={cn(buttonVariants({ variant: "ghost" }), {
                    'text-black hover:text-[#329c75]': background || isScrolled,
                    'text-white hover:text-[#329c75]': !background && !isScrolled
                }, "hover:bg-gray-600/50 hover:cursor-pointer flex flex-row items-center gap-2")}
            >
                <Avatar className='w-[30px] h-[30px]'>
                    <AvatarImage src={`/uploads/${user.profilePicture}`} />
                    <AvatarFallback className={background || isScrolled ? "text-white bg-[#329c75]" : "text-black bg-white"}>
                        {user.username?.slice(0, 2) || 'U'}
                    </AvatarFallback>
                </Avatar>
                <p className='font-semibold'>{user.username}</p>
            </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Balance: ${userBalance || user.balance || 0}</DropdownMenuLabel>
            <NavLink to={`/profile/${user.id}`}>
                <DropdownMenuItem className='hover:cursor-pointer'>Profile</DropdownMenuItem>
            </NavLink>
            <NavLink to="/events">
                <DropdownMenuItem className='hover:cursor-pointer'>My Events</DropdownMenuItem>
            </NavLink>
            <DropdownMenuItem
                className='text-red-600 hover:text-red-700 hover:cursor-pointer'
                onClick={handleSignOut}
            >
                Sign out
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

const AuthLinks = ({ background, isScrolled }) => (
    <div className='flex flex-row items-center gap-2'>
        <NavLink
            to="/login"
            className={cn(buttonVariants({ variant: "ghost" }), {
                'text-black hover:text-[#329c75]': background || isScrolled,
                'text-white hover:text-[#329c75]': !background && !isScrolled
            }, "hover:bg-transparent")}
        >
            Login
        </NavLink>
        <NavLink
            to="/register"
            className={cn(buttonVariants({ variant: "default" }),
                "bg-[#24AE7C] hover:bg-[#329c75]"
            )}
        >
            Create an account
        </NavLink>
    </div>
);

const CreateEventButton = () => (
    <NavLink
        to="/events/new"
        className={cn(
            buttonVariants({ size: "lg" }),
            "bg-[#24AE7C] hover:bg-[#329c75] flex gap-2 font-bold"
        )}
    >
        <FaCalendarMinus size={20} />Create Event
    </NavLink>
);

const MobileMenuContent = ({ user, handleSignOut, toggleMenu }) => (
    <>
        <CreateEventButton />
        <NavLink
            to="/explore"
            className="text-black hover:text-[#329c75] transition-all"
            onClick={toggleMenu}
        >
            Explore events
        </NavLink>
        {user ? (
            <div className='flex flex-col items-center gap-4'>
                <NavLink
                    to={`/profile/${user.id}`}
                    className="text-black hover:text-[#329c75] transition-all"
                    onClick={toggleMenu}
                >
                    Your profile
                </NavLink>
                <Button
                    variant="destructive"
                    className="hover:cursor-pointer transition-all"
                    onClick={handleSignOut}
                >
                    Sign out
                </Button>
            </div>
        ) : (
            <div className='flex flex-col items-center gap-4'>
                <NavLink
                    to="/login"
                    className="text-black hover:text-[#329c75] transition-all"
                    onClick={toggleMenu}
                >
                    Sign in
                </NavLink>
                <NavLink
                    to="/register"
                    className="text-black hover:text-[#329c75] transition-all"
                    onClick={toggleMenu}
                >
                    Create an account
                </NavLink>
            </div>
        )}
    </>
);

export default Navbar;

