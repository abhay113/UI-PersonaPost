import React, { createContext, useState, useEffect, useContext } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    isOnboarded: boolean;
    login: () => void;
    completeOnboarding: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isOnboarded: false,
    login: () => { },
    completeOnboarding: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isOnboarded, setIsOnboarded] = useState(false);

    useEffect(() => {
        const auth = localStorage.getItem('isAuthenticated') === 'true';
        const onboard = localStorage.getItem('isOnboarded') === 'true';
        setIsAuthenticated(auth);
        setIsOnboarded(onboard);
    }, []);

    const login = () => {
        localStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
    };

    const completeOnboarding = () => {
        localStorage.setItem('isOnboarded', 'true');
        setIsOnboarded(true);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isOnboarded, login, completeOnboarding }}>
            {children}
        </AuthContext.Provider>
    );
};

// Optional helper
export const useAuth = () => useContext(AuthContext);
