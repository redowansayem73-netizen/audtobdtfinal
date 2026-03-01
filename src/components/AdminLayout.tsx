import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, LineChart, Users, ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = React.useState<any>(() => {
        const stored = localStorage.getItem('user');
        if (!stored) return null;
        try {
            const parsed = JSON.parse(stored);
            if (parsed.role === 'admin' || parsed.role === 'super_admin') return parsed;
        } catch (e) {
            return null;
        }
        return null;
    });

    React.useEffect(() => {
        if (!user) {
            navigate('/admin-login');
            return;
        }

        // Strict check for super-admin route
        if (location.pathname.startsWith('/super-admin') && user.role !== 'super_admin') {
            navigate('/admin');
        }
    }, [navigate, location.pathname, user]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/admin-login');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    const navItems = [
        { path: '/admin', label: 'Transactions', icon: <ShieldCheck className="w-5 h-5" /> },
        { path: '/admin/reports', label: 'Financial Reports', icon: <LineChart className="w-5 h-5" /> },
        { path: '/admin/customers', label: 'Customer Directory', icon: <Users className="w-5 h-5" /> },
        { path: '/super-admin', label: 'User Management', icon: <ShieldAlert className="w-5 h-5 text-rose-500" /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Mobile Header (Shows only on small screens) */}
            <div className="md:hidden glass p-4 flex justify-between items-center z-40 relative">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="text-white w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900">Admin Portal</span>
                </div>
                <button onClick={handleLogout} className="text-slate-500 hover:text-red-500">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex sticky top-0 h-screen overflow-y-auto">
                <div className="p-6 border-b border-white/10">
                    <div className="flex flex-col items-center gap-2 mb-6 group cursor-pointer" onClick={() => navigate('/admin')}>
                        <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-white/10 mb-1 transition-transform group-hover:scale-105 duration-300">
                            <img src="/logo.png" alt="AUD TO BDT" className="h-10 w-auto object-contain" />
                        </div>
                        <div className="text-center">
                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block opacity-70 group-hover:opacity-100 transition-opacity">Staff Portal</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-left ${isActive
                                    ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className={isActive ? 'text-slate-900' : ''}>{item.icon}</span>
                                {item.label}
                            </button>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-2">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to App
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors font-bold text-sm"
                    >
                        <LogOut className="w-4 h-4" /> Secure Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden p-0 relative">
                <Outlet />
            </main>
        </div>
    );
}
