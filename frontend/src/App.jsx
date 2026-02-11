import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import OfficialDashboard from './pages/OfficialDashboard';
import PibDashboard from './pages/PibDashboard';
import AuditLogPage from './pages/AuditLogPage';
import VerificationRecord from './pages/VerificationRecord';
import NotFound from './pages/NotFound';
import DisclaimerBanner from './components/DisclaimerBanner';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <DisclaimerBanner />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard/official" element={<OfficialDashboard />} />
              <Route path="/dashboard/pib" element={<PibDashboard />} />
              <Route path="/audit-logs" element={<AuditLogPage />} />
              <Route path="/verification/:id" element={<VerificationRecord />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
