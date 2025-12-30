import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';

const SessionProvider = ({ children }) => {
    return <AuthProvider>{children}</AuthProvider>
}

export default SessionProvider;

