import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Globe, Menu, X, ArrowUpRight } from 'lucide-react';

export default function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [amountAud, setAmountAud] = useState<number>(1000);
    const [exchangeRate, setExchangeRate] = useState(75.45);
    const [amountBdt, setAmountBdt] = useState<number>(1000 * 75.45);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/config/rate')
            .then(res => res.json())
            .then(data => {
                if (data.rate) {
                    setExchangeRate(data.rate);
                    setAmountBdt(amountAud * data.rate);
                }
            })
            .catch(err => console.error('Failed to fetch rate:', err));
    }, []);

    const handleAudChange = (val: number) => {
        setAmountAud(val);
        setAmountBdt(Number((val * exchangeRate).toFixed(2)));
    };

    const handleBdtChange = (val: number) => {
        setAmountBdt(val);
        setAmountAud(Number((val / exchangeRate).toFixed(2)));
    };

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                            <img src="/logo.png" alt="AUD TO BDT" className="h-14 w-auto drop-shadow-sm hover:scale-105 transition-transform" />
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <Link to="/" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Home</Link>
                            <Link to="/dashboard" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">My Transfers</Link>
                            <Link to="/login" className="px-6 py-2.5 rounded-full font-bold text-slate-900 border-2 border-slate-200 hover:border-slate-300 transition-all">Login</Link>
                            <Link to="/send" className="px-6 py-2.5 rounded-full font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">Send Money</Link>
                        </div>

                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600">
                                {isMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden glass border-t border-slate-100 p-4 space-y-4 animate-in slide-in-from-top-4">
                        <Link to="/" className="block py-2 text-slate-600 font-medium">Home</Link>
                        <Link to="/dashboard" className="block py-2 text-slate-600 font-medium">My Transfers</Link>
                        <Link to="/login" className="block py-2 text-slate-600 font-medium font-bold">Login</Link>
                        <Link to="/send" className="block py-3 rounded-xl bg-slate-900 text-white text-center font-bold">Send Money</Link>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-100 animate-fade-in">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Trusted by 10k+ users in Australia
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1]">
                            The smartest way to send money home.
                        </h1>
                        <p className="text-xl text-slate-500 max-w-xl leading-relaxed">
                            Fast, secure, and transparent. Send money to Bangladesh with the best exchange rates and zero hidden fees.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100">
                                    <ShieldCheck className="text-emerald-600 w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Secure Payments</p>
                                    <p className="text-xs text-slate-500">Stripe encrypted</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100">
                                    <Zap className="text-emerald-600 w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Instant Transfer</p>
                                    <p className="text-xs text-slate-500">Ready in minutes</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Calculator Widget */}
                    <div className="relative">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-200/30 blur-3xl rounded-full -z-10 animate-pulse"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-200/30 blur-3xl rounded-full -z-10 animate-pulse delay-1000"></div>

                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Globe className="w-32 h-32" />
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">You Send</label>
                                    <div className="flex items-center justify-between border-2 border-slate-100 rounded-2xl p-5 hover:border-emerald-500 transition-colors focus-within:border-emerald-500">
                                        <input
                                            type="number"
                                            value={amountAud}
                                            onChange={(e) => handleAudChange(Number(e.target.value))}
                                            className="text-4xl font-extrabold bg-transparent border-none p-0 focus:ring-0 w-full text-slate-900"
                                        />
                                        <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2 shrink-0 border border-slate-100">
                                            <span className="text-2xl">🇦🇺</span>
                                            <span className="font-bold text-slate-700 text-lg">AUD</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center -my-3 relative z-10">
                                    <div className="bg-slate-900 rounded-full p-3 shadow-xl text-white">
                                        <ArrowRight className="w-6 h-6 rotate-90" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Recipient Gets</label>
                                    <div className="flex items-center justify-between border-2 border-emerald-50 bg-emerald-50/20 rounded-2xl p-5 hover:border-emerald-500 transition-colors focus-within:border-emerald-500">
                                        <input
                                            type="number"
                                            value={amountBdt}
                                            onChange={(e) => handleBdtChange(Number(e.target.value))}
                                            className="text-4xl font-extrabold bg-transparent border-none p-0 focus:ring-0 w-full text-emerald-700"
                                        />
                                        <div className="flex items-center gap-3 bg-emerald-50 rounded-xl px-4 py-2 shrink-0 border border-emerald-100">
                                            <span className="text-2xl">🇧🇩</span>
                                            <span className="font-bold text-emerald-800 text-lg">BDT</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-4 border-y border-dashed border-slate-200">
                                    <div className="text-sm font-medium text-slate-500">Exchange Rate</div>
                                    <div className="font-bold text-slate-900">1 AUD = ৳ {exchangeRate}</div>
                                </div>

                                <button
                                    onClick={() => navigate('/send', { state: { amountAud } })}
                                    className="w-full bg-emerald-600 text-white py-5 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 group"
                                >
                                    Start Transfer <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-20 bg-slate-900 text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 text-center space-y-12">
                    <h2 className="text-3xl font-bold">Supported Methods</h2>
                    <div className="flex flex-wrap justify-center items-center gap-8">
                        <div className="group bg-white p-4 rounded-2xl border border-white/10 shadow-sm hover:scale-110 transition-transform duration-300">
                            <img src="/bkash.png" alt="bKash" className="h-10 w-auto object-contain" />
                        </div>
                        <div className="group bg-white p-4 rounded-2xl border border-white/10 shadow-sm hover:scale-110 transition-transform duration-300">
                            <img src="/nagad.png" alt="Nagad" className="h-10 w-auto object-contain" />
                        </div>
                        <div className="group bg-white p-4 rounded-2xl border border-white/10 shadow-sm hover:scale-110 transition-transform duration-300">
                            <img src="/rocket.png" alt="Rocket" className="h-10 w-auto object-contain" />
                        </div>
                        <div className="px-8 py-4 bg-white/5 rounded-2xl border border-white/10 font-bold text-xl hover:bg-white/10 transition-colors cursor-default">
                            Any Bank BD
                        </div>
                    </div>
                </div>
            </section>

            <footer className="py-12 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
                    © 2024 AUDtoBDT. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
