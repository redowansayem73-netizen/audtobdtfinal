import React, { useState, useEffect } from 'react';
import { Loader2, Users, ArrowLeft, ArrowUpRight, Download, Printer } from 'lucide-react';

export default function CustomerManagement() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('user');
        const staffEmail = stored ? JSON.parse(stored).email : '';
        fetch(`/api/admin/customers?staffEmail=${staffEmail}`)
            .then(res => res.json())
            .then(data => {
                setCustomers(data);
                setIsLoading(false);
            })
            .catch(console.error);
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="pb-20">

            {/* Print Only Header */}
            <div className="hidden print:block text-center pt-8 pb-4">
                <h1 className="text-3xl font-black">Customer Audit Report</h1>
                <p className="text-sm text-slate-500">Generated on {new Date().toLocaleString()}</p>
            </div>

            <main className="max-w-7xl mx-auto px-4 pt-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 print:hidden">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900">Senders Directory</h1>
                        <p className="text-slate-500 mt-1 font-medium">Comprehensive list of all customers carrying out transactions.</p>
                    </div>

                    <div className="w-full max-w-sm relative">
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-5 pr-5 py-3 rounded-xl border border-slate-200 focus:ring-0 focus:border-emerald-500 font-medium bg-white shadow-sm"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden print:shadow-none print:border-none print:rounded-none">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 print:bg-slate-100">
                                    <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black">Customer Info</th>
                                    <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black text-center">Join Date</th>
                                    <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black text-center">Total Transfers</th>
                                    <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black text-right">Lifetime Volume (AUD)</th>
                                    <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest print:hidden">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCustomers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-slate-900 text-lg border-l-4 border-emerald-500 pl-3">{user.name || 'Unknown'}</div>
                                            <div className="text-sm text-slate-500 font-medium pl-4 mt-1">{user.email}</div>
                                            <div className="text-xs text-slate-400 pl-4">{user.mobile || 'No mobile'}</div>
                                        </td>
                                        <td className="px-8 py-6 text-center text-sm font-bold text-slate-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 font-black text-emerald-700">
                                                {user.stats.count}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="text-xl font-extrabold text-slate-900">${Number(user.stats.totalAud).toLocaleString()}</div>
                                        </td>
                                        <td className="px-8 py-6 print:hidden">
                                            <button
                                                onClick={() => window.location.href = `/admin/customers/${user.id}`}
                                                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all group"
                                            >
                                                View Journey <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredCustomers.length === 0 && (
                            <div className="py-20 text-center text-slate-400 font-medium">
                                No customers found.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
