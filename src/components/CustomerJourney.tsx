import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Printer, ShieldCheck, MapPin, Building2, Smartphone } from 'lucide-react';

export default function CustomerJourney() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        const staffEmail = stored ? JSON.parse(stored).email : '';
        fetch(`/api/admin/customers/${id}?staffEmail=${staffEmail}`)
            .then(res => res.json())
            .then(d => {
                setData(d);
                setIsLoading(false);
            })
            .catch(console.error);
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (isLoading || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
        );
    }

    const { transfers, beneficiaries } = data;

    return (
        <div className="pb-20">

            {/* Print Header */}
            <div className="hidden print:block text-left pt-10 pb-4 border-b-4 border-emerald-600 mb-8 max-w-5xl mx-auto px-4">
                <h1 className="text-4xl font-black text-slate-900">Full Customer Journey</h1>
                <p className="text-sm font-bold text-slate-500 mt-2">ID: {data.id} | Generated: {new Date().toLocaleString()}</p>
            </div>

            <main className="max-w-5xl mx-auto px-4 pt-10 space-y-12">
                {/* Profile Section */}
                <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 print:shadow-none print:border-2 print:border-slate-100 flex justify-between items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-100 pt-1.5">
                            <ShieldCheck className="w-3 h-3" /> Verified Sender
                        </div>
                        <h1 className="text-4xl font-black text-slate-900">{data.name || 'Unknown User'}</h1>
                        <div className="text-slate-500 font-medium text-lg mt-2 flex gap-4">
                            <span>{data.email}</span>
                            <span>•</span>
                            <span>{data.mobile || 'No Mobile Available'}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Joined</p>
                        <p className="text-2xl font-black text-slate-900">{new Date(data.createdAt).toLocaleDateString()}</p>
                    </div>
                </section>

                {/* Saved Beneficiaries */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                        <h2 className="text-2xl font-black text-slate-900">Saved Receivers Directory</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {beneficiaries.map((b: any) => (
                            <div key={b.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-md flex gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                                    {b.type === 'mobile_wallet' ? <Smartphone className="text-blue-600" /> : <Building2 className="text-blue-600" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">{b.name}</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 mb-2">{b.type.replace('_', ' ')} • {b.provider || b.bankName}</p>
                                    <p className="text-sm font-medium text-slate-600"><span className="font-bold">A/C Name:</span> {b.accountName}</p>
                                    <p className="text-sm font-medium text-slate-600"><span className="font-bold">A/C No:</span> {b.accountNumber}</p>
                                </div>
                            </div>
                        ))}
                        {beneficiaries.length === 0 && (
                            <div className="col-span-2 py-10 text-center text-slate-400 font-medium">No saved beneficiaries.</div>
                        )}
                    </div>
                </section>

                {/* Transaction History */}
                <section className="space-y-6 print:break-before-page">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                        <h2 className="text-2xl font-black text-slate-900">Comprehensive Transfer Logs</h2>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden print:shadow-none print:border-2">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 print:bg-slate-100">
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Date & ID</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Recipient</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">AUD Sent</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">BDT Disbursed</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transfers.map((tx: any) => (
                                    <tr key={tx.id}>
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-slate-900">#{tx.id}</div>
                                            <div className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-slate-600">{tx.accountName}</td>
                                        <td className="px-6 py-5 text-right font-black text-slate-900">${tx.amountAud}</td>
                                        <td className="px-6 py-5 text-right font-black text-emerald-600">৳ {Number(tx.amountBdt).toLocaleString()}</td>
                                        <td className="px-6 py-5 text-center px-4 py-2">
                                            <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${tx.status === 'sent' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>{tx.status}</span>
                                        </td>
                                    </tr>
                                ))}
                                {transfers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">No transfer history found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}
