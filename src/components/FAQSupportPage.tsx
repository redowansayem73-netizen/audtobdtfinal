import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, Phone, MessageCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
    {
        question: "How long does a transfer take?",
        answer: "Most transfers are completed within 15-30 minutes during business hours. Bank transfers may take up to 1-2 business days depending on the receiving bank."
    },
    {
        question: "What are the fees for sending money?",
        answer: "We offer completely transparent pricing. The transfer fee is calculated based on the amount you send. You'll always see the exact fee and exchange rate before you confirm your transfer."
    },
    {
        question: "Is my money safe?",
        answer: "Yes. We use bank-level encryption and security measures to ensure your funds and personal information are protected at all times. We are fully regulated and licensed."
    },
    {
        question: "How can I track my transfer?",
        answer: "You can track the status of your transfer in real-time from your Customer Dashboard. You will also receive email notifications at every step."
    },
    {
        question: "What if I enter the wrong recipient details?",
        answer: "If you notice a mistake, please contact our support team immediately. If the funds haven't been delivered yet, we can usually amend the details."
    }
];

export default function FAQSupportPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="min-h-screen bg-slate-50 premium-gradient pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <Link to="/" className="text-2xl font-black text-slate-900 tracking-tight">
                            AUD TO BDT
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 pt-12">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">How can we help?</h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">Find answers to common questions or get in touch with our dedicated support team.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* FAQ Section */}
                    <div className="md:col-span-2 space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <MessageCircle className="w-6 h-6 text-emerald-500" />
                            Frequently Asked Questions
                        </h2>
                        {faqs.map((faq, index) => (
                            <div 
                                key={index} 
                                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            >
                                <div className="px-6 py-5 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 pr-4">{faq.question}</h3>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${openIndex === index ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {openIndex === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="px-6 pb-5 pt-0 text-slate-600 leading-relaxed border-t border-slate-100 mt-2">
                                        <div className="pt-4">{faq.answer}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact Support Section */}
                    <div className="md:col-span-1">
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white sticky top-28 shadow-xl shadow-slate-900/20">
                            <h2 className="text-xl font-bold mb-2">Still need help?</h2>
                            <p className="text-slate-400 text-sm mb-8">Our support team is available 24/7 to assist you with your transfers.</p>
                            
                            <div className="space-y-6">
                                <a href="mailto:support@audtobdt.com" className="flex items-start gap-4 group">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors shrink-0">
                                        <Mail className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email Us</p>
                                        <p className="font-bold">support@audtobdt.com</p>
                                    </div>
                                </a>
                                
                                <div className="flex items-start gap-4 group">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors shrink-0">
                                        <Phone className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Call Us</p>
                                        <p className="font-bold">+61 2 1234 5678</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/10">
                                <p className="text-xs text-slate-400 text-center">For the fastest response, please use the live chat available on your dashboard.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
