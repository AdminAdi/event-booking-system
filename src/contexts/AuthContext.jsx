import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await axios.get('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setUser(response.data.user);
                }
            }
        } catch (error) {
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            if (response.data.success) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                setUser(user);
                return { success: true };
            } else {
                return { success: false, error: response.data.message || 'Login failed' };
            }
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    };

    const signOut = async () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    const value = {
        user,
        loading,
        signIn,
        signOut,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

