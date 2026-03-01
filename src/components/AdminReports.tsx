import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, Printer, BarChart3, TrendingUp, CalendarDays, DollarSign, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminReports() {
    const navigate = useNavigate();
    const [range, setRange] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const stored = localStorage.getItem('user');
        const staffEmail = stored ? JSON.parse(stored).email : '';
        let url = `/api/admin/reports?range=${range}&staffEmail=${staffEmail}`;
        if (range === 'custom' && startDate && endDate) {
            url += `&startDate=${startDate}&endDate=${endDate}`;
        } else if (range === 'custom') {
            setIsLoading(false);
            return;
        }

        fetch(url)
            .then(res => res.json())
            .then(d => {
                setData(d);
                setIsLoading(false);
            })
            .catch(console.error);
    }, [range, startDate, endDate]);

    const handlePrint = () => {
        window.print();
    };

    const ranges = [
        { id: 'daily', label: 'Today' },
        { id: 'weekly', label: 'This Week' },
        { id: 'monthly', label: 'This Month' },
        { id: 'yearly', label: 'This Year' },
        { id: 'all', label: 'All Time' },
        { id: 'custom', label: 'Custom Range' }
    ];

    return (
        <div className="pb-20">

            {/* Print Header */}
            <div className="hidden print:block text-center pt-8 pb-4">
                <h1 className="text-3xl font-black">Periodical Financial Statement</h1>
                <p className="text-sm text-slate-500">Range: {ranges.find(r => r.id === range)?.label} | Generated on {new Date().toLocaleString()}</p>
            </div>

            <main className="max-w-7xl mx-auto px-4 pt-10 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900">Cash Flow & Statements</h1>
                    </div>

                    <div className="flex gap-2 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto w-full md:w-auto">
                        {ranges.map(r => (
                            <button
                                key={r.id}
                                onClick={() => setRange(r.id)}
                                className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${range === r.id ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>

                {range === 'custom' && (
                    <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/40 print:hidden animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-bold text-slate-500">From:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-bold text-slate-500">To:</label>
                            <input
                                type="date"
                                value={endDate}
                                min={startDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="py-32 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-emerald-600" /></div>
                ) : (
                    <>
                        {/* Aggregate Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 print:shadow-none print:border-2">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-slate-500">Total volume (In)</span>
                                </div>
                                <div className="text-4xl font-black text-slate-900">${data.aggregates.totalAud.toLocaleString()}</div>
                                <div className="text-sm font-bold text-slate-400 mt-2">AUD Collected</div>
                            </div>

                            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 print:shadow-none print:border-2">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-slate-500">Total Volume (Out)</span>
                                </div>
                                <div className="text-4xl font-black text-slate-900">৳ {data.aggregates.totalBdt.toLocaleString()}</div>
                                <div className="text-sm font-bold text-slate-400 mt-2">BDT Disbursed / Pending</div>
                            </div>

                            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 print:shadow-none print:border-2">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-slate-500">Total Transactions</span>
                                </div>
                                <div className="text-4xl font-black text-slate-900">{data.aggregates.completedCount}</div>
                                <div className="text-sm font-bold text-slate-400 mt-2">Completed / {data.aggregates.count} Total</div>
                            </div>
                        </div>

                        {/* Statement Ledger */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden print:shadow-none print:border-2 print:rounded-none">
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 print:bg-white print:border-b-2 print:border-black">
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="text-slate-400" />
                                    <h2 className="text-xl font-bold text-slate-900">Official Ledger Statement</h2>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 print:bg-slate-100">
                                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black">Date</th>
                                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black">Reference / Tx ID</th>
                                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black">Sender</th>
                                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black">Recipient Name</th>
                                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black text-right">Debit (BDT Out)</th>
                                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black text-right">Credit (AUD In)</th>
                                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                                        {data.statement.map((row: any) => (
                                            <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-4 text-sm font-medium text-slate-500">{new Date(row.date).toLocaleString()}</td>
                                                <td className="px-8 py-4">
                                                    <div className="font-bold text-slate-900">#TRX-{row.id}</div>
                                                    {row.adminTransactionId && <div className="text-xs text-slate-400 font-mono mt-1 pt-1 border-t border-slate-100">Tx: {row.adminTransactionId}</div>}
                                                    {row.paymentIntentId && <div className="text-[10px] text-slate-400 font-mono mt-1 p-1 bg-slate-50 rounded break-all">Stripe: {row.paymentIntentId}</div>}
                                                </td>
                                                <td className="px-8 py-4 font-bold text-slate-900">{row.senderName}</td>
                                                <td className="px-8 py-4 font-bold text-slate-600">{row.accountName}</td>
                                                <td className="px-8 py-4 text-right font-black text-slate-500 text-lg">৳ {Number(row.amountBdt).toLocaleString()}</td>
                                                <td className="px-8 py-4 text-right font-black text-emerald-600 text-lg">+ ${row.amountAud}</td>
                                                <td className="px-8 py-4 text-center">
                                                    <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider ${row.status === 'sent' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>{row.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {data.statement.length === 0 && (
                                            <tr><td colSpan={7} className="py-10 text-center text-slate-400 font-medium">No records found for this period.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
