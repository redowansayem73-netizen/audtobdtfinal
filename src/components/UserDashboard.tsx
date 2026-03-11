import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, History, Clock, CheckCircle2, Check, Send, Globe, LogOut, DollarSign, Wallet, Users, Zap, Smartphone, Building2, ArrowRight, ArrowLeft, Download, X, User as UserIcon, Mail, Phone, MapPin, Save, Search, Plus, Edit2, Trash2 } from 'lucide-react';

export default function UserDashboard() {
    const [transfers, setTransfers] = useState<any[]>([]);
    const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [exchangeRate, setExchangeRate] = useState(75.45);
    const [sendAmount, setSendAmount] = useState(1000);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [viewAll, setViewAll] = useState(false);
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'beneficiaries'>('overview');
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        mobile: '',
        address: '',
        avatar: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Beneficiary CRUD State
    const [searchTerm, setSearchTerm] = useState('');
    const [isBenModalOpen, setIsBenModalOpen] = useState(false);
    const [editingBenId, setEditingBenId] = useState<number | null>(null);
    const [benFormData, setBenFormData] = useState({
        name: '',
        type: 'mobile_wallet',
        provider: 'bkash',
        accountName: '',
        accountNumber: '',
        bankName: '',
        branchName: '',
        routingNumber: ''
    });
    const navigate = useNavigate();
    const location = useLocation();

    const handleNav = (path: string, section?: string) => {
        if (location.pathname !== path) {
            navigate(path, { state: { scrollTo: section } });
            return;
        }
        
        if (section === 'transactions' || section === 'beneficiaries') {
            setActiveTab(section);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (section) {
            setActiveTab('overview');
            setTimeout(() => {
                const el = document.getElementById(section);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            setActiveTab('overview');
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const loginTimestamp = localStorage.getItem('loginTimestamp');
        
        if (!storedUser) {
            navigate('/login');
            return;
        }

        if (loginTimestamp) {
            const daysSinceLogin = (Date.now() - parseInt(loginTimestamp)) / (1000 * 60 * 60 * 24);
            if (daysSinceLogin >= 15) {
                localStorage.removeItem('user');
                localStorage.removeItem('loginTimestamp');
                navigate('/login');
                return;
            }
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setProfileData({
            name: parsedUser.name || '',
            email: parsedUser.email || '',
            mobile: parsedUser.mobile || '',
            address: parsedUser.address || '',
            avatar: parsedUser.avatar || ''
        });
        fetchDashboardData(parsedUser.email);
    }, [navigate]);

    useEffect(() => {
        if (location.state?.scrollTo) {
            setTimeout(() => {
                const el = document.getElementById(location.state.scrollTo);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [location]);

    const fetchDashboardData = async (email: string) => {
        try {
            const [txRes, benRes, rateRes, userRes] = await Promise.all([
                fetch(`/api/user/transfers?email=${email}`),
                fetch(`/api/user/beneficiaries?email=${email}`),
                fetch(`/api/config/rate`),
                fetch(`/api/user/profile?email=${email}`)
            ]);

            const txData = await txRes.json();
            const benData = await benRes.json();
            const rateData = await rateRes.json();
            const userData = await userRes.json();

            setTransfers(txData);
            setBeneficiaries(benData);
            if (rateData.rate) setExchangeRate(rateData.rate);
            if (userData && !userData.error) {
                setUser(userData);
                setProfileData({
                    name: userData.name || '',
                    email: userData.email || '',
                    mobile: userData.mobile || '',
                    address: userData.address || '',
                    avatar: userData.avatar || ''
                });
                localStorage.setItem('user', JSON.stringify(userData));
            }

        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentEmail: user.email,
                    ...profileData
                })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
                alert('Profile updated successfully!');
            } else {
                alert(data.error || 'Update failed');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('loginTimestamp');
        navigate('/');
    };

    const handleSaveBeneficiary = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingBenId 
                ? `/api/user/beneficiaries/${editingBenId}` 
                : '/api/user/beneficiaries';
            const method = editingBenId ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, ...benFormData })
            });
            
            if (res.ok) {
                setIsBenModalOpen(false);
                fetchDashboardData(user.email); // refresh
            } else {
                alert('Failed to save receiver');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteBeneficiary = async (id: number) => {
        if (!window.confirm('Are you sure you want to remove this receiver?')) return;
        try {
            const res = await fetch(`/api/user/beneficiaries/${id}`, { method: 'DELETE' });
            if (res.ok) fetchDashboardData(user.email);
        } catch (err) {
            console.error(err);
        }
    };

    const openBenModal = (ben?: any) => {
        if (ben) {
            setEditingBenId(ben.id);
            setBenFormData({
                name: ben.name,
                type: ben.type,
                provider: ben.provider || 'bkash',
                accountName: ben.accountName,
                accountNumber: ben.accountNumber,
                bankName: ben.bankName || '',
                branchName: ben.branchName || '',
                routingNumber: ben.routingNumber || ''
            });
        } else {
            setEditingBenId(null);
            setBenFormData({
                name: '', type: 'mobile_wallet', provider: 'bkash', accountName: '', accountNumber: '', bankName: '', branchName: '', routingNumber: ''
            });
        }
        setIsBenModalOpen(true);
    };

    const filteredBeneficiaries = beneficiaries.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.accountNumber.includes(searchTerm)
    );

    // Calculate Personal Stats
    const stats = transfers.reduce((acc, curr) => {
        if (curr.status === 'paid' || curr.status === 'sent') {
            acc.totalAud += parseFloat(curr.amountAud);
            acc.totalBdt += parseFloat(curr.amountBdt);
        }
        return acc;
    }, { totalAud: 0, totalBdt: 0 });

    const totalTransfers = transfers.length;

    const filteredTransfers = transfers.filter(tx => {
        if (filter === 'all') return true;
        if (filter === 'completed') return tx.status === 'paid' || tx.status === 'sent';
        if (filter === 'pending') return tx.status === 'pending';
        return true;
    });

    const displayedTransfers = viewAll ? filteredTransfers : filteredTransfers.slice(0, 5);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
        );
    }

    const downloadReceipt = (tx: any) => {
        // Dummy PDF download trigger for now, could be wired to an explicit API if required
        const receiptContent = `
RECEIPT - AUD TO BDT
----------------------------
Transaction ID: ${tx.id}
Date: ${new Date(tx.createdAt).toLocaleString()}
Status: ${tx.status.toUpperCase()}
Amount Sent: $${tx.amountAud} AUD
Amount Delivered: ৳${tx.amountBdt} BDT
Exchange Rate: ${tx.rate}
Recipient: ${tx.accountName}
Account/Number: ${tx.accountNumber}
Delivery Method: ${tx.method}
        `.trim();
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt_${tx.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="pb-20">

            <main className="max-w-7xl mx-auto px-4 pt-10">
                <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full text-emerald-700 text-xs font-bold mb-3 border border-emerald-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
                        {activeTab === 'overview' && (
                            <p className="text-slate-500 mt-3 font-medium text-lg">Here's your international transfer overview.</p>
                        )}
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <>
                        {/* Mobile 2x2 Action Grid - Top Priority */}
                        <div className="md:hidden grid grid-cols-2 gap-4 mb-8">
                            <button onClick={() => navigate('/send')} className="bg-white px-2 py-5 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform text-slate-700">
                                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
                                    <Send className="w-7 h-7 ml-0.5" />
                                </div>
                                <span className="font-bold text-sm">Send Money</span>
                            </button>
                            <button onClick={() => handleNav('/dashboard', 'transactions')} className="bg-white px-2 py-5 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform text-slate-700">
                                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                                    <History className="w-7 h-7" />
                                </div>
                                <span className="font-bold text-sm cursor-pointer hover:bg-slate-50">My Transactions</span>
                            </button>
                            <button onClick={() => alert('Cards feature coming soon!')} className="bg-white px-2 py-5 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform text-slate-700">
                                <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm">
                                    <Wallet className="w-7 h-7" />
                                </div>
                                <span className="font-bold text-sm">My Cards</span>
                            </button>
                            <button onClick={() => handleNav('/dashboard', 'beneficiaries')} className="bg-white px-2 py-5 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform text-slate-700">
                                <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-sm">
                                    <Users className="w-7 h-7" />
                                </div>
                                <span className="font-bold text-sm">Beneficiary List</span>
                            </button>
                        </div>

                        {/* Personal Analytics Row - Mobile Scrollable & Desktop Grid */}
                        <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-4 md:gap-6 mb-10 pb-4 mx-0 snap-x hide-scrollbar">
                            
                            <div className="min-w-[280px] md:min-w-0 shrink-0 snap-center bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-6 shadow-xl shadow-emerald-200/50 relative overflow-hidden group text-white">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 blur-sm"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="font-bold text-emerald-50 uppercase tracking-widest text-xs">Total Sent (Lifetime)</span>
                                    </div>
                                    <div className="text-3xl md:text-4xl font-black">${stats.totalAud.toLocaleString()} <span className="text-lg font-bold text-emerald-200">AUD</span></div>
                                </div>
                            </div>

                            <div className="min-w-[280px] md:min-w-0 shrink-0 snap-center bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-6 shadow-xl shadow-blue-200/50 relative overflow-hidden group text-white">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 blur-sm"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <Wallet className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="font-bold text-blue-50 uppercase tracking-widest text-xs">Delivered in BDT</span>
                                    </div>
                                    <div className="text-3xl md:text-4xl font-black">৳ {stats.totalBdt.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="min-w-[280px] md:min-w-0 shrink-0 snap-center bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                                            <History className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-slate-500 uppercase tracking-widest text-xs">Total Transfers</span>
                                    </div>
                                    <div className="text-3xl md:text-4xl font-black text-slate-900">{totalTransfers}</div>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:grid lg:grid-cols-3 gap-10">
                            {/* Left Column: Flow & Action */}
                            <div className="lg:col-span-2 space-y-10">
                                {/* Dynamic Send Money Widget */}
                                <section className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-slate-900/20 text-white">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
                                <div className="flex-1 space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold border border-white/5">
                                        <Zap className="w-3 h-3 text-emerald-400" /> Instant Dispatch
                                    </div>
                                    <h2 className="text-3xl font-black leading-tight">Need to send money right now?</h2>
                                    <p className="text-slate-400 font-medium">Use our lightning-fast gateway. Lock in today's stellar exchange rate instantly.</p>
                                </div>

                                <div className="w-full md:w-72 bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md shrink-0">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">You Send (AUD)</label>
                                    <input
                                        type="number"
                                        value={sendAmount}
                                        onChange={(e) => setSendAmount(Number(e.target.value))}
                                        className="w-full bg-transparent text-3xl font-black text-white focus:outline-none focus:ring-0 border-b-2 border-white/10 focus:border-emerald-400 transition-colors pb-2 mb-4"
                                    />

                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">They Get</span>
                                        <span className="font-black text-emerald-400 text-lg">৳ {(sendAmount * exchangeRate).toLocaleString()}</span>
                                    </div>

                                    <button
                                        onClick={() => navigate('/send', { state: { amountAud: sendAmount } })}
                                        className="w-full py-4 bg-emerald-500 text-slate-900 rounded-xl font-black text-lg hover:bg-emerald-400 transition-colors flex justify-center items-center gap-2 group"
                                    >
                                        Send Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Recent Transfers Log */}
                        <section id="transactions" className="scroll-mt-24">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                                    Transaction History
                                </h2>
                                <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl shrink-0 self-start">
                                    {['all', 'pending', 'completed'].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => { setFilter(f as any); setViewAll(false); }}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {filteredTransfers.length === 0 ? (
                                <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center shadow-sm">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <Send className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">No transfers found</h3>
                                    <p className="text-slate-500 mt-2">You don't have any transfers matching this filter.</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                                    <div className="overflow-x-auto w-full scrollbar-hide">
                                        <div className="min-w-[700px]">
                                            {/* Table Header */}
                                            <div className="grid grid-cols-12 gap-4 p-5 border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                <div className="col-span-4 pl-2">Receiver & Date</div>
                                                <div className="col-span-3">Method</div>
                                                <div className="col-span-3">Amount</div>
                                                <div className="col-span-2 text-right pr-2">Status</div>
                                            </div>

                                            <div className="divide-y divide-slate-100">
                                                {displayedTransfers.map((tx) => (
                                                    <div 
                                                        key={tx.id} 
                                                        onClick={() => setSelectedTx(tx)} 
                                                        className="p-5 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-all cursor-pointer group"
                                                    >
                                                        {/* Column 1: Receiver & Date */}
                                                        <div className="col-span-4 flex items-center gap-3">
                                                            <div className={`flex w-10 h-10 rounded-xl items-center justify-center shrink-0 shadow-sm ${
                                                                tx.status === 'sent' ? 'bg-emerald-500 text-white' : 
                                                                tx.status === 'paid' ? 'bg-blue-500 text-white' : 
                                                                'bg-slate-100 text-slate-500'
                                                            }`}>
                                                                {tx.status === 'sent' ? <CheckCircle2 className="w-5 h-5" /> : tx.status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-900">{tx.accountName}</div>
                                                                <div className="text-xs font-bold text-slate-500 mt-0.5">{new Date(tx.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                            </div>
                                                        </div>

                                                        {/* Column 2: Method */}
                                                        <div className="col-span-3 flex items-center gap-2">
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-700 capitalize">{tx.method.replace('_', ' ')}</div>
                                                            </div>
                                                        </div>

                                                        {/* Column 3: Amount */}
                                                        <div className="col-span-3 flex flex-col justify-center items-start rounded-xl">
                                                            <div className="text-base font-black text-slate-900">${tx.amountAud} <span className="text-xs text-slate-400 font-bold">AUD</span></div>
                                                            <div className="text-xs font-bold text-emerald-600 mt-0.5">৳ {Number(tx.amountBdt).toLocaleString()} <span className="text-slate-400 font-medium opacity-70">BDT</span></div>
                                                        </div>

                                                        {/* Column 4: Status / Actions */}
                                                        <div className="flex col-span-2 justify-end items-center gap-3 pr-2">
                                                            <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1 ${
                                                                tx.status === 'sent' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                                tx.status === 'paid' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                                                'bg-amber-50 text-amber-600 border-amber-100'
                                                            }`}>
                                                                {tx.status}
                                                            </div>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); downloadReceipt(tx); }}
                                                                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all opacity-0 group-hover:opacity-100 shrink-0 shadow-sm"
                                                                title="Download Receipt"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {filteredTransfers.length > 5 && (
                                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                                            <button
                                                onClick={() => { setActiveTab('transactions'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 rounded-xl transition-all shadow-sm text-sm"
                                            >
                                                View All Transactions <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Beneficiaries */}
                    <div className="space-y-6 scroll-mt-24" id="beneficiaries">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-emerald-600" />
                                Saved Receivers
                            </h2>
                            <button onClick={() => { setActiveTab('beneficiaries'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-1 transition-colors">
                                View All <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-3 pt-4">
                            {beneficiaries.length === 0 ? (
                                <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 m-2">
                                    <p className="text-slate-500 font-medium text-sm">No saved receivers found. They will be saved automatically when you send money.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {beneficiaries.slice(0, 4).map(ben => (
                                        <div 
                                          key={ben.id} 
                                          className="p-4 rounded-2xl hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-colors flex flex-col justify-between h-32 group cursor-pointer bg-slate-50" 
                                          onClick={() => navigate('/send', { state: { amountAud: sendAmount || 1000, beneficiary: ben } })}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center shrink-0 text-slate-500 group-hover:text-emerald-600 transition-colors">
                                                    {ben.type === 'mobile_wallet' ? <Smartphone className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                                                </div>
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1">
                                                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm truncate">{ben.name}</div>
                                                <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider truncate">{ben.provider || ben.bankName} • {ben.accountNumber.slice(-4)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Promotional Mini Card */}
                        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 text-center">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-sm shadow-emerald-200">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">Zero Hidden Fees</h3>
                            <p className="text-sm text-slate-600 font-medium">We pride ourselves on 100% transparency. The rate you see is the rate you get.</p>
                        </div>
                    </div>
                </div>
                </>
                )}

                {/* --- SEPARATE TAB: TRANSACTIONS --- */}
                {activeTab === 'transactions' && (
                    <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
                        <button onClick={() => setActiveTab('overview')} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </button>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                                Transaction History
                            </h2>
                            <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl shrink-0 self-start">
                                {['all', 'pending', 'completed'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => { setFilter(f as any); }}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all border border-transparent ${filter === f ? 'bg-white text-slate-900 shadow-sm border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {filteredTransfers.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center shadow-sm">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <Send className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No transfers found</h3>
                                <p className="text-slate-500 mt-2">You don't have any transfers matching this filter.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                                <div className="overflow-x-auto w-full scrollbar-hide">
                                    <div className="min-w-[700px]">
                                        {/* Table Header */}
                                        <div className="grid grid-cols-12 gap-4 p-5 border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="col-span-4 pl-2">Receiver & Date</div>
                                            <div className="col-span-3">Method</div>
                                            <div className="col-span-3">Amount</div>
                                            <div className="col-span-2 text-right pr-2">Status</div>
                                        </div>

                                        <div className="divide-y divide-slate-100">
                                            {filteredTransfers.map((tx) => (
                                                <div 
                                                    key={tx.id} 
                                                    onClick={() => setSelectedTx(tx)} 
                                                    className="p-5 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-all cursor-pointer group"
                                                >
                                                    {/* Column 1: Receiver & Date */}
                                                    <div className="col-span-4 flex items-center gap-3">
                                                        <div className={`flex w-10 h-10 rounded-xl items-center justify-center shrink-0 shadow-sm ${
                                                            tx.status === 'sent' ? 'bg-emerald-500 text-white' : 
                                                            tx.status === 'paid' ? 'bg-blue-500 text-white' : 
                                                            'bg-slate-100 text-slate-500'
                                                        }`}>
                                                            {tx.status === 'sent' ? <CheckCircle2 className="w-5 h-5" /> : tx.status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900">{tx.accountName}</div>
                                                            <div className="text-xs font-bold text-slate-500 mt-0.5">{new Date(tx.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                        </div>
                                                    </div>

                                                    {/* Column 2: Method */}
                                                    <div className="col-span-3 flex items-center gap-2">
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-700 capitalize">{tx.method.replace('_', ' ')}</div>
                                                        </div>
                                                    </div>

                                                    {/* Column 3: Amount */}
                                                    <div className="col-span-3 flex flex-col justify-center items-start rounded-xl">
                                                        <div className="text-base font-black text-slate-900">${tx.amountAud} <span className="text-xs text-slate-400 font-bold">AUD</span></div>
                                                        <div className="text-xs font-bold text-emerald-600 mt-0.5">৳ {Number(tx.amountBdt).toLocaleString()} <span className="text-slate-400 font-medium opacity-70">BDT</span></div>
                                                    </div>

                                                    {/* Column 4: Status / Actions */}
                                                    <div className="flex col-span-2 justify-end items-center gap-3 pr-2">
                                                        <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1 ${
                                                            tx.status === 'sent' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                            tx.status === 'paid' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                                            'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}>
                                                            {tx.status}
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); downloadReceipt(tx); }}
                                                            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all opacity-0 group-hover:opacity-100 shrink-0 shadow-sm"
                                                            title="Download Receipt"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- SEPARATE TAB: BENEFICIARIES --- */}
                {activeTab === 'beneficiaries' && (
                    <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
                        <button onClick={() => setActiveTab('overview')} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </button>
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                                <Users className="w-6 h-6 text-emerald-600" />
                                All Saved Receivers
                            </h2>
                            
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search receivers..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-full md:w-64"
                                    />
                                </div>
                                <button onClick={() => openBenModal()} className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-colors shrink-0">
                                    <Plus className="w-4 h-4" /> Add New
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-5">
                            {filteredBeneficiaries.length === 0 ? (
                                <div className="p-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">{searchTerm ? 'No receivers match your search' : 'No saved receivers found'}</h3>
                                    <p className="text-slate-500 mt-2">{searchTerm ? 'Try a different name or number.' : 'They will be saved automatically when you send money, or you can add one now.'}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredBeneficiaries.map(ben => (
                                        <div 
                                          key={ben.id} 
                                          className="p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 transition-all flex flex-col justify-between h-44 group bg-white relative" 
                                        >
                                            <div className="flex justify-between items-start">
                                                <div 
                                                    className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors cursor-pointer"
                                                    onClick={() => navigate('/send', { state: { amountAud: sendAmount || 1000, beneficiary: ben } })}
                                                >
                                                    {ben.type === 'mobile_wallet' ? <Smartphone className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openBenModal(ben)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"><Edit2 className="w-4 h-4"/></button>
                                                    <button onClick={() => handleDeleteBeneficiary(ben.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                                </div>
                                            </div>
                                            <div className="cursor-pointer mt-2" onClick={() => navigate('/send', { state: { amountAud: sendAmount || 1000, beneficiary: ben } })}>
                                                <div className="font-bold text-slate-900 text-base truncate">{ben.name}</div>
                                                <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider truncate bg-slate-50 inline-block px-2 py-1 rounded border border-slate-100">{ben.provider || ben.bankName} • {ben.accountNumber.slice(-4)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Account Details Section */}
                <section id="profile" className="mt-20 scroll-mt-24">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                        <h2 className="text-3xl font-black text-slate-900">Account Details</h2>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                        <div className="p-8 md:p-12">
                            {/* Form Side */}
                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    {/* Avatar Upload */}
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="relative group shrink-0">
                                            <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                                                {profileData.avatar ? (
                                                    <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon className="w-10 h-10 text-slate-300" />
                                                )}
                                            </div>
                                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center cursor-pointer shadow-sm hover:bg-emerald-700 transition-colors">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setProfileData({ ...profileData, avatar: reader.result as string });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </label>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900">Profile Picture</h3>
                                            <p className="text-xs text-slate-500 font-bold mt-1">PNG, JPG up to 5MB</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                            <div className="relative group">
                                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                    placeholder="Enter your full name"
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                                            <div className="relative group opacity-60">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    disabled
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-100 border border-slate-200 rounded-2xl outline-none font-bold text-slate-500 cursor-not-allowed"
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-medium px-1 italic">Email cannot be changed for security</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Mobile Number</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                                                <input
                                                    type="tel"
                                                    value={profileData.mobile}
                                                    onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
                                                    placeholder="Enter your mobile"
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Full Address</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={profileData.address}
                                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                                    placeholder="Enter your address"
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200/50 disabled:opacity-50 group hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Save Profile Updates
                                    </button>
                                </form>
                        </div>
                    </div>
                </section>
            </main>

            {/* Tracking Modal */}
            {selectedTx && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedTx(null)}></div>
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-20">
                            <div>
                                <h3 className="font-black text-xl text-slate-900">Track Transfer</h3>
                                <p className="text-slate-500 text-xs font-bold mt-1">Ref: #AUD-{selectedTx.id.toString().padStart(5, '0')}</p>
                            </div>
                            <button onClick={() => setSelectedTx(null)} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto w-full">
                            <div className="bg-slate-50 rounded-3xl p-6 text-center mb-8 border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>
                                <div className="relative z-10">
                                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Total Amount</div>
                                    <div className="text-4xl font-black text-slate-900 mb-1">${selectedTx.amountAud}</div>
                                    <div className="text-emerald-600 font-bold text-sm bg-emerald-50 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-100 transition-all">
                                        {selectedTx.status === 'sent' && <Check className="w-3.5 h-3.5" />}
                                        {selectedTx.status === 'sent' ? 'Delivered' : 'Delivering'} ৳{Number(selectedTx.amountBdt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BDT
                                    </div>
                                </div>
                            </div>

                            <div className="w-full relative px-2">
                                <h4 className="font-black text-slate-900 text-xs uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                                    TRANSIT MILESTONES
                                </h4>

                                <div className="relative pl-3">
                                    <div className="absolute left-[0.95rem] top-4 bottom-4 w-0.5 bg-slate-100"></div>
                                    <div className={`absolute left-[0.95rem] top-4 w-0.5 bg-emerald-500 transition-all duration-1000 ${selectedTx.status === 'sent' ? 'h-full' :
                                        selectedTx.status === 'paid' ? 'h-[50%]' : 'h-0'
                                        }`}></div>

                                    <ul className="space-y-6 relative">
                                        <li className="flex gap-4 items-start">
                                            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 border-4 border-white shadow-sm relative z-10">
                                                <Check className="w-4 h-4" />
                                            </div>
                                            <div className="pt-1">
                                                <p className="text-sm text-slate-900 font-bold leading-none mb-1">Transfer Initiated</p>
                                                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Completed</p>
                                            </div>
                                        </li>

                                        <li className="flex gap-4 items-start">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm relative z-10 ${selectedTx.status === 'paid' || selectedTx.status === 'sent' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                                                }`}>
                                                {(selectedTx.status === 'paid' || selectedTx.status === 'sent') ? <Check className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
                                            </div>
                                            <div className="pt-1">
                                                <p className="text-sm text-slate-900 font-bold leading-none mb-1">Payment Secured</p>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${selectedTx.status === 'paid' || selectedTx.status === 'sent' ? 'text-emerald-600' : 'text-slate-400'
                                                    }`}>
                                                    {(selectedTx.status === 'paid' || selectedTx.status === 'sent') ? 'Completed' : 'Pending Verification'}
                                                </p>
                                            </div>
                                        </li>

                                        <li className="flex gap-4 items-start">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm relative z-10 ${selectedTx.status === 'sent' ? 'bg-emerald-500 text-white' :
                                                selectedTx.status === 'paid' ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-slate-200 text-slate-500'
                                                }`}>
                                                {selectedTx.status === 'sent' ? <Check className="w-4 h-4" /> : <History className="w-3.5 h-3.5" />}
                                            </div>
                                            <div className="pt-1">
                                                <p className="text-sm text-slate-900 font-bold leading-none mb-1">Delivered to Recipient</p>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${selectedTx.status === 'sent' ? 'text-emerald-600' :
                                                    selectedTx.status === 'paid' ? 'text-amber-600' : 'text-slate-400'
                                                    }`}>
                                                    {selectedTx.status === 'sent' ? 'Completed' :
                                                        selectedTx.status === 'paid' ? 'In Progress' : 'Awaiting Processing'}
                                                </p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Footer Layout Info */}
                        <div className="bg-slate-50 p-6 border-t border-slate-100 shrink-0">
                            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-xs font-bold text-slate-500">Receiver</span>
                                <span className="text-sm font-black text-slate-900">{selectedTx.accountName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Beneficiary Modal */}
            {isBenModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsBenModalOpen(false)}></div>
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-20">
                            <h3 className="font-black text-xl text-slate-900">{editingBenId ? 'Edit Receiver' : 'Add New Receiver'}</h3>
                            <button onClick={() => setIsBenModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto w-full">
                            <form id="benForm" onSubmit={handleSaveBeneficiary} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Receiver Name / Alias</label>
                                    <input
                                        type="text"
                                        required
                                        value={benFormData.name}
                                        onChange={e => setBenFormData({ ...benFormData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-slate-900"
                                        placeholder="E.g., Mom's bKash or John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Transfer Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setBenFormData({ ...benFormData, type: 'mobile_wallet' })}
                                            className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${benFormData.type === 'mobile_wallet' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'}`}
                                        >
                                            <Smartphone className="w-4 h-4" /> Mobile Wallet
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setBenFormData({ ...benFormData, type: 'bank_transfer' })}
                                            className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${benFormData.type === 'bank_transfer' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'}`}
                                        >
                                            <Building2 className="w-4 h-4" /> Bank Transfer
                                        </button>
                                    </div>
                                </div>

                                {benFormData.type === 'mobile_wallet' && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Wallet Provider</label>
                                        <select
                                            value={benFormData.provider}
                                            onChange={e => setBenFormData({ ...benFormData, provider: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-slate-900 appearance-none"
                                        >
                                            <option value="bkash">bKash</option>
                                            <option value="nagad">Nagad</option>
                                            <option value="rocket">Rocket</option>
                                            <option value="upay">Upay</option>
                                        </select>
                                    </div>
                                )}

                                {benFormData.type === 'bank_transfer' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Bank Name</label>
                                            <input
                                                type="text"
                                                required={benFormData.type === 'bank_transfer'}
                                                value={benFormData.bankName}
                                                onChange={e => setBenFormData({ ...benFormData, bankName: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-slate-900"
                                                placeholder="e.g. Dutch Bangla Bank"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Branch</label>
                                                <input
                                                    type="text"
                                                    value={benFormData.branchName}
                                                    onChange={e => setBenFormData({ ...benFormData, branchName: e.target.value })}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-slate-900"
                                                    placeholder="Branch Name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Routing No.</label>
                                                <input
                                                    type="text"
                                                    value={benFormData.routingNumber}
                                                    onChange={e => setBenFormData({ ...benFormData, routingNumber: e.target.value })}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-slate-900"
                                                    placeholder="Routing Number"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Account Holder Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={benFormData.accountName}
                                        onChange={e => setBenFormData({ ...benFormData, accountName: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-slate-900"
                                        placeholder="Exact name on account"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Account Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={benFormData.accountNumber}
                                        onChange={e => setBenFormData({ ...benFormData, accountNumber: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-slate-900 tracking-wider"
                                        placeholder="Account or Mobile Number"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Footer Layout Info */}
                        <div className="bg-slate-50 p-6 border-t border-slate-100 shrink-0">
                            <button
                                type="submit"
                                form="benForm"
                                className="w-full bg-slate-900 text-white rounded-xl py-4 font-black flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-slate-200/50"
                            >
                                <Save className="w-5 h-5" /> Save Receiver Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
