import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = (role) => {
        // Mock login logic matching backend response structure
        // In a real app, this would verify with backend /api/auth/login
        // For demo speed, we can just set state, but let's call the API to be proper?
        // The prompt says "No real authentication logic", so client-side state is fine.
        // BUT the backend has a /login route. Let's use it to get the "token".

        // Actually, for a slick demo, let's just simulate it here with a fetch to backend.

        // Using fetch to backend:
        fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUser(data.user);
                    localStorage.setItem('token', data.token); // Store mock token
                } else {
                    alert('Login failed');
                }
            })
            .catch(err => {
                console.error("Login Mock Error", err);
                // Fallback if backend not running for UI testing
                setUser({ role, name: role });
            });
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
