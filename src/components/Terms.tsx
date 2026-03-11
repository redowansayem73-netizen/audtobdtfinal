import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function Terms() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-emerald-500" />
                            Terms and Conditions
                        </h1>
                        <p className="text-slate-400 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>
                    <Link to="/" className="text-slate-300 hover:text-white flex items-center gap-2 font-bold transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Back Home
                    </Link>
                </div>
                
                <div className="p-8 md:p-12 space-y-8 text-slate-600 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest text-xs">1. Introduction</h2>
                        <p>Welcome to AUDtoBDT. These terms and conditions govern your use of our foreign exchange and remittance services. By using our platform, you agree to comply with all applicable laws and regulations of Australia and Bangladesh.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest text-xs">2. Service Eligibility</h2>
                        <p>To use our services, you must be at least 18 years old and a resident of Australia with valid identification. You agree to provide accurate and complete information during registration and transaction processes.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest text-xs">3. Transfers & Exchange Rates</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Exchange rates fluctuate and are locked in at the time of your transaction confirmation.</li>
                            <li>Funds are typically delivered instantly to mobile wallets or within 1-2 business days for bank transfers.</li>
                            <li>We reserve the right to delay or cancel transfers that flag our security or compliance checks.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest text-xs">4. Fees & Charges</h2>
                        <p>Any applicable fees will be clearly displayed before you confirm a transfer. We commit to zero hidden margins on our exchange rates.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest text-xs">5. Compliance & Security</h2>
                        <p>As an Australian Registered Service, we comply strictly with Anti-Money Laundering (AML) and Counter-Terrorism Financing (CTF) regulations. We may request additional documentation to verify the source of funds or the purpose of your transfer.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest text-xs">6. Limitation of Liability</h2>
                        <p>AUDtoBDT is not liable for delays caused by third-party banking networks, inaccurate recipient details provided by you, or events beyond our reasonable control.</p>
                    </section>
                </div>

                <div className="bg-slate-50 p-6 border-t border-slate-100 text-center text-sm font-bold text-slate-500">
                    © {new Date().getFullYear()} AUDtoBDT. Australian Registered Service.
                </div>
            </div>
        </div>
    );
}
