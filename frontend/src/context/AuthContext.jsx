import React, { createContext, useState, useContext } from 'react';
import axiosInstance from '../helper/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = async (role) => {
        // Mock authentication just sets the role in state/localstorage
        // Actually, for a slick demo, let's just simulate it here with a fetch to backend.

        try {
            // Using axiosInstance to backend:
            const response = await axiosInstance.post('/api/auth/login', { role });

            if (response.data.success) {
                setUser({ role });
                localStorage.setItem('user', JSON.stringify({ role }));
                return true;
            }
        } catch (error) {
            console.error("Login failed", error);
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
