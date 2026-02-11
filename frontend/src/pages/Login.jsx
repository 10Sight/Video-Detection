import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState('Official Authority');

    const handleLogin = (e) => {
        e.preventDefault();
        login(role);
        // Redirect based on role
        if (role === 'Official Authority') {
            navigate('/dashboard/official');
        } else {
            navigate('/dashboard/pib');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md border-t-4 border-blue-600">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Video Verification System</h1>
                    <p className="text-sm text-gray-500 mt-2">Government of India - Official Registry</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select User Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-800"
                        >
                            <option value="Official Authority">Official Authority (Uploader)</option>
                            <option value="PIB Fact Check">PIB Fact Check (Verifier)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow focus:outline-none transition duration-200"
                    >
                        Login to Dashboard
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-gray-400">
                    <p>Restricted Access - Authorized Personnel Only</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
