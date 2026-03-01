import React, { useState, useEffect } from 'react';
import { Loader2, ShieldAlert, Shield, User, ChevronRight, Key, UserPlus, Save, RefreshCw, AlertCircle } from 'lucide-react';

export default function SuperAdminDashboard() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [config, setConfig] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'admins' | 'settings'>('admins');

    // New Admin Form
    const [newAdmin, setNewAdmin] = useState({ email: '', name: '', password: '' });
    const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

    // Config Form
    const [stripeSecret, setStripeSecret] = useState('');
    const [stripePublishable, setStripePublishable] = useState('');
    const [isSavingConfig, setIsSavingConfig] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const stored = localStorage.getItem('user');
            const staffEmail = stored ? JSON.parse(stored).email : '';
            const [adminsRes, configRes] = await Promise.all([
                fetch(`/api/super/users?staffEmail=${staffEmail}`),
                fetch(`/api/super/config?staffEmail=${staffEmail}`)
            ]);
            const adminsData = await adminsRes.json();
            const configData = await configRes.json();

            setAdmins(adminsData);
            setConfig(configData);

            const secret = configData.find((c: any) => c.key === 'STRIPE_SECRET_KEY')?.value || '';
            const pub = configData.find((c: any) => c.key === 'VITE_STRIPE_PUBLISHABLE_KEY')?.value || '';
            setStripeSecret(secret);
            setStripePublishable(pub);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingAdmin(true);
        try {
            const stored = localStorage.getItem('user');
            const staffEmail = stored ? JSON.parse(stored).email : '';
            const res = await fetch('/api/super/admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newAdmin, staffEmail }),
            });
            if (res.ok) {
                setNewAdmin({ email: '', name: '', password: '' });
                fetchData();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreatingAdmin(false);
        }
    };

    const handleSaveConfig = async (key: string, value: string) => {
        setIsSavingConfig(true);
        try {
            const stored = localStorage.getItem('user');
            const staffEmail = stored ? JSON.parse(stored).email : '';
            const res = await fetch('/api/super/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value, staffEmail }),
            });
            if (res.ok) {
                fetchData();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSavingConfig(false);
        }
    };

    const handleUpdateRole = async (userId: number, role: string) => {
        try {
            const stored = localStorage.getItem('user');
            const staffEmail = stored ? JSON.parse(stored).email : '';
            const res = await fetch(`/api/super/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, staffEmail }),
            });
            if (res.ok) {
                setAdmins(admins.map(a => a.id === userId ? { ...a, role } : a));
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="pb-20">

            <main className="max-w-7xl mx-auto px-4 pt-10">
                {activeTab === 'admins' && (
                    <div className="space-y-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <h1 className="text-4xl font-extrabold text-slate-900">Admin Team</h1>
                                <p className="text-slate-500 mt-1 font-medium italic">Manage staff access and create new administrative accounts.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Create Admin Form */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 sticky top-32">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                            <UserPlus className="text-emerald-600 w-5 h-5" />
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900">Add New Admin</h2>
                                    </div>

                                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={newAdmin.name}
                                                onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-medium"
                                                placeholder="e.g. Redowan Admin"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                value={newAdmin.email}
                                                onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-medium"
                                                placeholder="admin@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={newAdmin.password}
                                                onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-medium"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isCreatingAdmin}
                                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 mt-4"
                                        >
                                            {isCreatingAdmin ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Admin Account'}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Admins List */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {admins.map((user) => (
                                        <div key={user.id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/60 transition-all group">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-rose-50 transition-colors">
                                                    {user.role === 'super_admin' ? (
                                                        <ShieldAlert className="w-8 h-8 text-rose-600" />
                                                    ) : (
                                                        <Shield className="w-8 h-8 text-emerald-600" />
                                                    )}
                                                </div>
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'super_admin' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </div>

                                            <div className="mb-8">
                                                <h3 className="text-xl font-bold text-slate-900 truncate">{user.name || 'Anonymous User'}</h3>
                                                <p className="text-sm text-slate-400 font-medium mb-1">{user.email}</p>
                                                <p className="text-xs text-slate-300 italic">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                                            </div>

                                            <div className="space-y-3">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2">Modify Permissions</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => handleUpdateRole(user.id, 'admin')}
                                                        className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${user.role === 'admin' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-100 hover:border-emerald-200'
                                                            }`}
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                        <span className="text-[9px] font-bold uppercase">Staff</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateRole(user.id, 'super_admin')}
                                                        className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${user.role === 'super_admin' ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-100 hover:border-rose-200'
                                                            }`}
                                                    >
                                                        <ShieldAlert className="w-4 h-4" />
                                                        <span className="text-[9px] font-bold uppercase">Root</span>
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => handleUpdateRole(user.id, 'user')}
                                                    className="w-full py-2 text-[9px] font-bold text-slate-300 hover:text-rose-500 uppercase tracking-widest transition-colors mt-2"
                                                >
                                                    Revoke All Privileges
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-900">Global Settings</h1>
                            <p className="text-slate-500 mt-1 font-medium italic">Configure system-wide parameters and secure API integrations.</p>
                        </div>

                        <div className="max-w-3xl space-y-8">
                            {/* Stripe Configuration */}
                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                        <Key className="text-indigo-600 w-7 h-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">Stripe Integration</h2>
                                        <p className="text-sm text-slate-400 font-medium">Update keys to switch between test and live environments.</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Publishable Key (Client-side)</label>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[9px] font-bold tracking-widest">pk_test_...</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <input
                                                type="password"
                                                value={stripePublishable}
                                                onChange={e => setStripePublishable(e.target.value)}
                                                className="flex-1 px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all font-mono text-sm"
                                                placeholder="pk_test_..."
                                            />
                                            <button
                                                onClick={() => handleSaveConfig('VITE_STRIPE_PUBLISHABLE_KEY', stripePublishable)}
                                                disabled={isSavingConfig}
                                                className="bg-slate-900 text-white px-6 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
                                            >
                                                {isSavingConfig ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Secret Key (Server-side)</label>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[9px] font-bold tracking-widest">sk_test_...</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <input
                                                type="password"
                                                value={stripeSecret}
                                                onChange={e => setStripeSecret(e.target.value)}
                                                className="flex-1 px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all font-mono text-sm"
                                                placeholder="sk_test_..."
                                            />
                                            <button
                                                onClick={() => handleSaveConfig('STRIPE_SECRET_KEY', stripeSecret)}
                                                disabled={isSavingConfig}
                                                className="bg-slate-900 text-white px-6 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
                                            >
                                                {isSavingConfig ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-4">
                                        <AlertCircle className="w-6 h-6 text-indigo-500 shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-bold text-indigo-900 mb-1">Impact of Change</h4>
                                            <p className="text-xs text-indigo-700 leading-relaxed font-medium">Updating these keys will immediately affect all new transaction attempts. Securely stored in the database for persistence.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* System Maintenance */}
                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 opacity-50 grayscale pointer-events-none">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center">
                                        <RefreshCw className="text-slate-400 w-7 h-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">System Logs</h2>
                                        <p className="text-sm text-slate-400 font-medium">Monitor server health and audit activities (Coming Soon).</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
