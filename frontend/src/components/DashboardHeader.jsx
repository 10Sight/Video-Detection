import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = ({ title, userRole }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="bg-white shadow border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        GOI
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                        <p className="text-xs text-gray-500">Logged in as: <span className="font-semibold text-blue-600">{userRole}</span></p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/audit-logs')}
                        className="text-sm text-gray-500 hover:text-blue-600 mr-4 font-medium"
                    >
                        View Audit Log
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-gray-600 hover:text-red-500 font-medium transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
