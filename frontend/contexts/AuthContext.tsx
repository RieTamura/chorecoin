import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    const checkAuthStatus = () => {
        return Promise.race([
            new Promise((resolve) => {
                // Simulate an API call to check authentication status
                setTimeout(() => {
                    // Assume the user is authenticated after 2 seconds
                    setUser({ name: 'User' });
                    resolve(true);
                }, 2000);
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000)) // 5-second timeout
        ]);
    };

    useEffect(() => {
        checkAuthStatus()
            .then(() => setIsLoading(false))
            .catch(() => {
                setUser(null);
                setIsLoading(false);
            });
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
