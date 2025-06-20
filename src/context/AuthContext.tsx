// import React, { createContext, useState, useEffect, useContext } from 'react';

// interface AuthContextType {
//     isAuthenticated: boolean;
//     isOnboarded: boolean;
//     loading: boolean;
//     login: () => void;
//     completeOnboarding: () => void;
// }

// export const AuthContext = createContext<AuthContextType>({
//     isAuthenticated: false,
//     isOnboarded: false,
//     loading: true,
//     login: () => { },
//     completeOnboarding: () => { },
// });

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [isOnboarded, setIsOnboarded] = useState(false);
//     const [loading, setLoading] = useState(true); // NEW

//     useEffect(() => {
//         const auth = localStorage.getItem('isAuthenticated') === 'true';
//         const onboard = localStorage.getItem('isOnboarded') === 'true';
//         setIsAuthenticated(auth);
//         setIsOnboarded(onboard);
//         setLoading(false); // ✅ mark auth status loaded
//     }, []);

//     const login = () => {
//         localStorage.setItem('isAuthenticated', 'true');
//         setIsAuthenticated(true);
//     };

//     const completeOnboarding = () => {
//         localStorage.setItem('isOnboarded', 'true');
//         setIsOnboarded(true);
//     };

//     return (
//         <AuthContext.Provider value={{ isAuthenticated, isOnboarded, loading, login, completeOnboarding }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => useContext(AuthContext);
