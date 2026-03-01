import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Globe, Menu, X, CheckCircle2, Headphones, Lock } from 'lucide-react';

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

    const trustFeatures = [
        "Transparent pricing",
        "Real-time exchange rates",
        "Fast processing",
        "24/7 customer support",
        "Secure & compliant transfers"
    ];

    const partnerLogos = [
        { name: 'bKash', src: '/bkash.png' },
        { name: 'Nagad', src: '/nagad.png' },
        { name: 'Rocket', src: '/rocket.png' }
    ];

    return (
        <div className="min-h-screen bg-white selection:bg-emerald-100 italic-none">
            {/* Header / Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                            <img src="/logo.png" alt="AUD TO BDT" className="h-12 md:h-14 w-auto transition-transform hover:scale-105" />
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <Link to="/login" className="text-slate-600 hover:text-emerald-600 font-bold transition-colors">Login</Link>
                            <Link to="/send" className="px-8 py-3 rounded-2xl font-black text-white bg-slate-900 hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 hover:shadow-emerald-100">Send Money Now</Link>
                        </div>

                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600">
                                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-100 p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                        <Link to="/login" className="block py-3 text-slate-900 font-bold text-lg">Login</Link>
                        <Link to="/send" className="block py-4 rounded-2xl bg-slate-900 text-white text-center font-black text-lg">Send Money Now</Link>
                    </div>
                )}
            </nav>

            {/* Hero Section - SEND TAKA TO HOME */}
            <section className="relative pt-24 pb-16 lg:pt-36 lg:pb-24 overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-3xl -z-10 opacity-50"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl -z-10 opacity-50"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Text Content */}
                        <div className="max-w-2xl space-y-8 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-black tracking-widest uppercase border border-emerald-100">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                                </span>
                                Fast, Secure & Trusted
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.95] tracking-tight">
                                SEND TAKA <br />
                                <span className="text-emerald-600">TO HOME</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed">
                                No matter how far you are from home, your support makes a difference. Send money from Australia to Bangladesh safely and quickly.
                            </p>

                            <div className="hidden lg:block space-y-4 pt-4">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Directly transfer to:</p>
                                <div className="flex items-center gap-6">
                                    {partnerLogos.map((logo) => (
                                        <div key={logo.name} className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center grayscale hover:grayscale-0 transition-all h-10 w-28">
                                            <img src={logo.src} alt={logo.name} className="h-6 w-auto object-contain" />
                                        </div>
                                    ))}
                                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center italic font-black text-slate-400 text-sm h-10 border-dashed">
                                        All BD Banks
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Calculator Widget - Visible on first sight */}
                        <div className="relative z-10 w-full max-w-md mx-auto lg:ml-auto">
                            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10 relative group">
                                <div className="space-y-6">
                                    <div className="text-center mb-4">
                                        <h3 className="text-xl font-black text-slate-900">AUD to BDT Transfers</h3>
                                        <p className="text-slate-500 font-medium text-sm">Best rates in Australia</p>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">You Send</label>
                                        <div className="flex items-center justify-between border-2 border-slate-100 rounded-3xl p-5 hover:border-emerald-500 transition-all focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-50">
                                            <input
                                                type="number"
                                                value={amountAud}
                                                onChange={(e) => handleAudChange(Number(e.target.value))}
                                                className="text-4xl font-black bg-transparent border-none p-0 focus:ring-0 w-full text-slate-900 placeholder:text-slate-200"
                                            />
                                            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3 shrink-0 border border-slate-100">
                                                <span className="text-2xl">🇦🇺</span>
                                                <span className="font-extrabold text-slate-900">AUD</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center -my-4 relative z-20">
                                        <div className="bg-emerald-600 rounded-2xl p-4 shadow-xl text-white transform group-hover:rotate-180 transition-transform duration-500">
                                            <ArrowRight className="w-6 h-6 rotate-90" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Recipient Gets</label>
                                        <div className="flex items-center justify-between border-2 border-emerald-50 bg-emerald-50/20 rounded-3xl p-5 hover:border-emerald-500 transition-all focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-50">
                                            <input
                                                type="number"
                                                value={amountBdt}
                                                onChange={(e) => handleBdtChange(Number(e.target.value))}
                                                className="text-4xl font-black bg-transparent border-none p-0 focus:ring-0 w-full text-emerald-700 placeholder:text-emerald-100"
                                            />
                                            <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shrink-0 border border-emerald-100 shadow-sm">
                                                <span className="text-2xl">🇧🇩</span>
                                                <span className="font-extrabold text-slate-900">BDT</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-5 border-y border-dashed border-slate-200">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rate Today</div>
                                        <div className="font-black text-slate-900 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                                            1 AUD = ৳ {exchangeRate}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate('/send', { state: { amountAud } })}
                                        className="w-full bg-slate-900 text-white py-6 rounded-3xl text-xl font-black flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-200 hover:shadow-emerald-200 active:scale-95"
                                    >
                                        Send Money Now <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                    </button>

                                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                        Zero processing fees on your first transfer
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Thousands Trust Us Section */}
            <section className="py-24 bg-slate-50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Why Thousands Trust Us</h2>
                        <div className="w-20 h-2 bg-emerald-500 mx-auto rounded-full"></div>
                        <p className="text-xl text-slate-600 font-medium pt-4">
                            We understand that sending money home is more than just a transaction — it’s support, care, and responsibility.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Features List */}
                        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
                            {trustFeatures.map((feature, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group">
                                    <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <span className="text-lg font-bold text-slate-800">{feature}</span>
                                </div>
                            ))}
                            <div className="bg-emerald-600 p-8 rounded-3xl text-white flex flex-col justify-center gap-2 shadow-xl shadow-emerald-200">
                                <span className="font-black text-2xl">Your trust is our priority.</span>
                                <span className="opacity-80 font-medium">Every minute matters when your family needs you.</span>
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="relative z-10 space-y-6">
                                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                                    <Headphones size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900">24/7 Human Support</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Need help? Our friendly team is always here to ensure your funds reach home safely.
                                </p>
                                <button className="text-emerald-600 font-black flex items-center gap-2 hover:gap-4 transition-all">
                                    Contact Support <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Support Methods Dynamic logos */}
            <section className="py-20 bg-white border-y border-slate-50">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h3 className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs mb-12">Dynamic Transfer Methods</h3>
                    <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20">
                        {partnerLogos.map((logo) => (
                            <div key={logo.name} className="group flex flex-col items-center gap-4">
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 duration-300 w-48 h-24 flex items-center justify-center">
                                    <img src={logo.src} alt={logo.name} className="max-h-12 w-auto object-contain" />
                                </div>
                                <span className="text-slate-400 font-bold tracking-widest uppercase text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">{logo.name} Network</span>
                            </div>
                        ))}
                        <div className="group flex flex-col items-center gap-4">
                            <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl hover:-translate-y-2 transition-all duration-300 w-48 h-24 flex items-center justify-center">
                                <span className="text-white font-black text-xl">All BD Banks</span>
                            </div>
                            <span className="text-slate-400 font-bold tracking-widest uppercase text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">SWIFT/National</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Send Money Anytime, Anywhere */}
            <section className="py-32 bg-white selection:bg-blue-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sm:grid lg:grid-cols-2 gap-20 items-center">
                    <div className="order-2 lg:order-1 relative">
                        <div className="aspect-square bg-slate-900 rounded-[3rem] p-12 text-white flex flex-col justify-center gap-10 shadow-3xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 -m-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -m-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>

                            <h3 className="text-4xl font-black leading-tight relative z-10">Send Money Anytime, Anywhere</h3>
                            <p className="text-xl text-slate-300 font-medium relative z-10 italic">
                                "Whether you're in Sydney, Melbourne, Brisbane, or anywhere in Australia — you can send money home to Bangladesh in just a few taps."
                            </p>

                            <div className="flex flex-wrap gap-3 relative z-10">
                                {["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra"].map(city => (
                                    <span key={city} className="px-5 py-2 rounded-full bg-white/10 text-white font-bold text-sm backdrop-blur-sm border border-white/5">
                                        {city}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 space-y-8 mb-16 lg:mb-0">
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1]">Support your family. Stay connected.</h2>
                        <p className="text-xl text-slate-500 font-medium leading-relaxed">
                            We bridge the gap between you and your loved ones. Pay for important needs, education, or emergencies with complete peace of mind.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "No monthly subscription fees",
                                "Instant notification to receiver",
                                "Zero hidden currency margins"
                            ].map((li, idx) => (
                                <li key={idx} className="flex items-center gap-4 text-slate-700 font-bold">
                                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                                        <ArrowRight size={14} />
                                    </div>
                                    {li}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Bottom CTA Section */}
            <section className="py-24 bg-emerald-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">Start Your Transfer Today</h2>
                        <p className="text-2xl text-emerald-100 font-bold">Send AUD to BDT Now — Fast. Secure. Reliable.</p>
                    </div>

                    <button
                        onClick={() => navigate('/send')}
                        className="inline-flex items-center gap-4 px-12 py-6 rounded-[2rem] bg-white text-emerald-700 text-2xl font-black shadow-2xl hover:bg-slate-900 hover:text-white transition-all transform hover:-translate-y-2 active:scale-95 group"
                    >
                        Send Money Now <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
                    </button>

                    <div className="flex flex-center justify-center gap-10 pt-10 border-t border-emerald-500/50">
                        <div className="flex items-center gap-3 text-white">
                            <Lock size={20} />
                            <span className="font-bold text-sm uppercase tracking-widest">Stripe Secured</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <ShieldCheck size={20} />
                            <span className="font-bold text-sm uppercase tracking-widest">Compliant Transfers</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
                    <img src="/logo.png" alt="AUD TO BDT" className="h-10 w-auto opacity-50 grayscale" />
                    <div className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                        © 2024 AUDtoBDT. Australian Registered Service.
                    </div>
                    <div className="flex gap-8">
                        <Link to="/login" className="text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest">Terms</Link>
                        <Link to="/login" className="text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest">Privacy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
