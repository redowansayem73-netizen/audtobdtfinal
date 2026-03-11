import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

export default function Privacy() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                            <Lock className="w-8 h-8 text-emerald-500" />
                            Privacy Policy
                        </h1>
                        <p className="text-slate-400 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>
                    <Link to="/" className="text-slate-300 hover:text-white flex items-center gap-2 font-bold transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Back Home
                    </Link>
                </div>
                
                <div className="p-8 md:p-12 space-y-8 text-slate-600 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest text-xs">1. Your Privacy Matters</h2>
                        <p>At AUDtoBDT, we take your privacy seriously. This policy explains how we collect, use, and protect your personal data when you use our remittance services.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest text-xs">2. Information We Collect</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Personal Identity:</strong> Name, address, date of birth, and identification documents (e.g., passport, driver's license).</li>
                            <li><strong>Contact Details:</strong> Email address and mobile phone number.</li>
                            <li><strong>Financial Info:</strong> Payment details, transaction history, and beneficiary information.</li>
                            <li><strong>Technical Data:</strong> IP address, browser type, and device identifiers.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest text-xs">3. How We Use Your Data</h2>
                        <p>We use your information strictly to process your transfers safely, verify your identity according to Australian AML/CTF laws, provide customer support, and improve our services. We do not sell your personal data to third parties.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest text-xs">4. Data Sharing & Disclosure</h2>
                        <p>We only share your information with trusted third parties necessary to complete your transactions (such as banks, Stripe for payment processing, and regulatory authorities when legally required).</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest text-xs">5. Data Security</h2>
                        <p>We employ bank-level encryption and advanced security infrastructure to protect your data from unauthorized access, alteration, or disclosure.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-widest text-xs">6. Your Rights</h2>
                        <p>You have the right to access, correct, or request deletion of your personal data, subject to our legal obligations to retain transaction records for compliance purposes.</p>
                    </section>
                </div>

                <div className="bg-slate-50 p-6 border-t border-slate-100 text-center text-sm font-bold text-slate-500">
                    © {new Date().getFullYear()} AUDtoBDT. Australian Registered Service.
                </div>
            </div>
        </div>
    );
}
