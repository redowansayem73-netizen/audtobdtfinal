import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Send, LogOut, ArrowLeft, Globe, Menu, X, User, History, Users, Settings } from 'lucide-react';

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
                    {/* Logo Area (65%) */}
                    <div className="flex-[0.65] flex flex-col justify-start cursor-pointer group" onClick={() => navigate('/dashboard')}>
                        <img src="/logo.png" alt="AUD TO BDT" className="h-10 md:h-12 w-auto object-contain" />
                        <div className="mt-1">
                            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest block ml-1 opacity-80 group-hover:opacity-100 transition-opacity">User Dashboard</span>
                        </div>
                    </div>

                    {/* Right Side Hamburger */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleMenu}
                            className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors relative"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
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
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 px-8 py-4 flex items-center justify-between z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <button
                    onClick={() => handleNav('/dashboard', 'transactions')}
                    className="flex flex-col items-center gap-1.5 text-slate-400 font-bold hover:text-emerald-600 transition-colors"
                >
                    <History className="w-6 h-6" />
                    <span className="text-[10px] uppercase tracking-wider">History</span>
                </button>

                <button
                    onClick={() => navigate('/send')}
                    className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 -mt-10 border-[6px] border-slate-50 active:scale-95 transition-transform"
                >
                    <Send className="w-6 h-6 ml-0.5" />
                </button>

                <button
                    onClick={() => handleNav('/dashboard', 'beneficiaries')}
                    className="flex flex-col items-center gap-1.5 text-slate-400 font-bold hover:text-emerald-600 transition-colors"
                >
                    <Users className="w-6 h-6" />
                    <span className="text-[10px] uppercase tracking-wider">Receivers</span>
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
