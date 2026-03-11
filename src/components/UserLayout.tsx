import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Send, LogOut, ArrowLeft, Globe, Menu, X, User, History, Users, Settings, Headset } from 'lucide-react';

export default function UserLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
        } else {
            setUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'My Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: '/send', label: 'Send Money', icon: <Send className="w-5 h-5" /> },
    ];

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleNav = (path: string, section?: string) => {
        setIsMenuOpen(false);
        if (location.pathname !== path) {
            navigate(path, { state: { scrollTo: section } });
        } else if (section) {
            const el = document.getElementById(section);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
            {/* Top Navbar */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Left Side: Profile / My Account */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={toggleMenu}>
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-black text-sm border-2 border-emerald-500 overflow-hidden shadow-sm">
                            {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                        </div>
                    </div>

                    {/* Right Side: Logo */}
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <img src="/logo.png" alt="AUD TO BDT" className="h-8 md:h-10 w-auto object-contain" />
                    </div>
                </div>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-2xl animate-in slide-in-from-top-4 duration-300 z-50 p-6">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-black text-lg">
                                    {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                                </div>
                                <div className="truncate">
                                    <div className="font-bold text-slate-900 truncate">{user?.name || 'User'}</div>
                                    <div className="text-xs text-slate-500 font-medium truncate">{user?.email}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                <button onClick={() => handleNav('/dashboard')} className="flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-all">
                                    <LayoutDashboard className="w-5 h-5 text-emerald-600" /> My Profile
                                </button>
                                <button onClick={() => handleNav('/dashboard', 'transactions')} className="flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-all">
                                    <History className="w-5 h-5 text-blue-600" /> My Transactions
                                </button>
                                <button onClick={() => handleNav('/dashboard', 'beneficiaries')} className="flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-all">
                                    <Users className="w-5 h-5 text-indigo-600" /> Beneficiary List
                                </button>
                                <button onClick={() => handleNav('/dashboard', 'profile')} className="flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-all text-left">
                                    <Settings className="w-5 h-5 text-slate-500" /> Account Details
                                </button>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl text-red-600 font-bold hover:bg-red-50 transition-all border border-transparent hover:border-red-100">
                                    <LogOut className="w-5 h-5" /> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Bottom Navbar (Mobile & Tablet) */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 py-4 flex items-center justify-between z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <button
                    onClick={() => handleNav('/dashboard')}
                    className={`flex flex-col items-center gap-1.5 transition-colors ${location.pathname === '/dashboard' ? 'text-emerald-600 font-black' : 'text-slate-400 font-bold hover:text-emerald-500'}`}
                >
                    <LayoutDashboard className="w-6 h-6" />
                    <span className="text-[10px] uppercase tracking-wider">Home</span>
                </button>

                <button
                    onClick={() => handleNav('/dashboard', 'profile')}
                    className="flex flex-col items-center gap-1.5 text-slate-400 font-bold hover:text-emerald-500 transition-colors"
                >
                    <User className="w-6 h-6" />
                    <span className="text-[10px] uppercase tracking-wider">Account</span>
                </button>

                <button
                    onClick={() => navigate('/send')}
                    className={`flex flex-col items-center gap-1.5 transition-colors ${location.pathname === '/send' ? 'text-emerald-600 font-black' : 'text-slate-400 font-bold hover:text-emerald-500'}`}
                >
                    <Send className="w-6 h-6" />
                    <span className="text-[10px] uppercase tracking-wider">Transfer</span>
                </button>

                <button
                    onClick={() => navigate('/support')}
                    className={`flex flex-col items-center gap-1.5 transition-colors ${location.pathname === '/support' ? 'text-emerald-600 font-black' : 'text-slate-400 font-bold hover:text-emerald-500'}`}
                >
                    <Headset className="w-6 h-6" />
                    <span className="text-[10px] uppercase tracking-wider">Support</span>
                </button>
            </nav>

            {/* Desktop Side Navbar (Simple variant) */}
            <div className="hidden md:flex fixed left-0 top-0 h-full w-24 bg-slate-950 border-r border-slate-900 flex-col items-center py-12 gap-8 z-50 shadow-2xl">
                <div className="cursor-pointer mb-4" onClick={() => navigate('/dashboard')}>
                    <Globe className="w-10 h-10 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                </div>
                <button onClick={() => handleNav('/dashboard', 'transactions')} className="w-14 h-14 rounded-2xl hover:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white transition-all group" title="Transactions">
                    <History className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
                <button onClick={() => navigate('/send')} className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all group hover:shadow-emerald-500/40" title="Send Money">
                    <Send className="w-6 h-6 ml-0.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button onClick={() => handleNav('/dashboard', 'beneficiaries')} className="w-14 h-14 rounded-2xl hover:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white transition-all group" title="Beneficiaries">
                    <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
                <button onClick={() => handleNav('/dashboard', 'profile')} className="mt-auto w-14 h-14 rounded-2xl hover:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white transition-all group" title="Settings">
                    <Settings className="w-6 h-6 group-hover:rotate-45 transition-transform duration-300" />
                </button>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden p-0 relative md:ml-20">
                <Outlet />
            </main>
        </div>
    );
}
