import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import SendMoneyFlow from './components/SendMoneyFlow';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import Login from './components/Login';
import CustomerManagement from './components/CustomerManagement';
import CustomerJourney from './components/CustomerJourney';
import AdminReports from './components/AdminReports';
import AdminLogin from './components/AdminLogin';
import AdminLayout from './components/AdminLayout';
import UserLayout from './components/UserLayout';
import Chatbox from './components/Chatbox';
import FAQSupportPage from './components/FAQSupportPage';
import { useLocation } from 'react-router-dom';

const GlobalChatbox = () => {
    const location = useLocation();
    const allowedPaths = ['/', '/dashboard'];
    if (!allowedPaths.includes(location.pathname)) return null;
    return <Chatbox />;
};

function App() {
    return (
        <Router>
            <div className="min-h-screen premium-gradient">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    {/* Standalone Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/support" element={<FAQSupportPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/send" element={<SendMoneyFlow />} />

                    {/* Authenticated User Routes */}
                    <Route element={<UserLayout />}>
                        <Route path="/dashboard" element={<UserDashboard />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/reports" element={<AdminReports />} />
                        <Route path="/admin/customers" element={<CustomerManagement />} />
                        <Route path="/admin/customers/:id" element={<CustomerJourney />} />
                        <Route path="/super-admin" element={<SuperAdminDashboard />} />
                    </Route>
                </Routes>
                <GlobalChatbox />
            </div>
        </Router>
    );
}

export default App;
