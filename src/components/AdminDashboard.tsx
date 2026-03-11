import React, { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, Search, Filter, CheckCircle2, Globe, ArrowUpRight, ExternalLink, ShieldAlert, Users, LineChart, TrendingUp, Clock, Wallet } from 'lucide-react';

export default function AdminDashboard() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [adminTxId, setAdminTxId] = useState('');
  const [currentRate, setCurrentRate] = useState<string>('0');
  const [editingRate, setEditingRate] = useState(false);
  const [newRate, setNewRate] = useState('');
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActivity, setShowActivity] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.role === 'admin' || parsed.role === 'super_admin') {
        fetchTransfers();
        fetchRate();
      }
    }
  }, []);

  const fetchRate = async () => {
    try {
      const res = await fetch('/api/config/rate');
      if (res.ok) {
        const data = await res.json();
        setCurrentRate(data.rate);
        setNewRate(data.rate);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRate = async () => {
    if (!newRate || isNaN(Number(newRate))) return;
    setIsUpdatingRate(true);
    try {
      const stored = localStorage.getItem('user');
      const staffEmail = stored ? JSON.parse(stored).email : '';
      const res = await fetch('/api/admin/config/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: newRate, staffEmail })
      });
      if (res.ok) {
        setCurrentRate(newRate);
        setEditingRate(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingRate(false);
    }
  };

  const fetchTransfers = async () => {
    try {
      const stored = localStorage.getItem('user');
      const staffEmail = stored ? JSON.parse(stored).email : '';
      const res = await fetch(`/api/admin/transfers?staffEmail=${staffEmail}`);
      const data = await res.json();
      setTransfers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    if (status === 'sent' && !adminTxId) return;

    try {
      const stored = localStorage.getItem('user');
      const staffEmail = stored ? JSON.parse(stored).email : '';
      const res = await fetch(`/api/admin/transfers/${id}?staffEmail=${staffEmail}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminTransactionId: adminTxId, staffEmail }),
      });
      if (res.ok) {
        setTransfers(transfers.map(tx => tx.id === id ? { ...tx, status, adminTransactionId: adminTxId } : tx));
        setConfirmingId(null);
        setAdminTxId('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTransfers = transfers.filter(tx => 
    (filter === 'all' || tx.status === filter) &&
    (tx.id.toString().includes(searchTerm) || 
     (tx.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
     (tx.accountName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
     (tx.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = transfers.reduce((acc, tx) => {
    if (tx.status === 'pending') acc.pendingCount++;
    if (tx.status === 'paid' || tx.status === 'sent') acc.totalBdt += parseFloat(tx.amountBdt || '0');
    return acc;
  }, { pendingCount: 0, totalBdt: 0 });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-100 mb-10 pt-10 pb-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-xl text-slate-900 leading-none">Admin Console</h2>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1 block">Master Access</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a href="/admin/reports" className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold rounded-xl transition-colors border border-slate-200 hover:border-emerald-200">
              <LineChart className="w-4 h-4" /> Audit & Reports
            </a>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900">{JSON.parse(localStorage.getItem('user') || '{}').name || 'Staff'}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Authorized Access</p>
            </div>
            <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center font-black text-white border-2 border-white shadow-sm uppercase">
              {(JSON.parse(localStorage.getItem('user') || '{}').name || 'ST').substring(0, 2)}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Rate Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100/50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-500">Exchange Rate</span>
              </div>

              {editingRate ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-lg font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    autoFocus
                  />
                  <button onClick={handleUpdateRate} disabled={isUpdatingRate} className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition">
                    {isUpdatingRate ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-4xl font-black text-slate-900">৳ {currentRate}</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm font-bold text-slate-400">1 AUD = {currentRate} BDT</div>
                    <button onClick={() => setEditingRate(true)} className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition">Update</button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Pending Transactions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100/50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-500">Pending Actions</span>
              </div>
              <div className="text-4xl font-black text-slate-900">{stats.pendingCount}</div>
              <div className="text-sm font-bold text-slate-400 mt-2">Awaiting Verification</div>
            </div>
          </div>

          {/* Total Disbursed */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100/50 text-blue-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-500">Volume Disbursed</span>
              </div>
              <div className="text-4xl font-black text-slate-900">৳ {(stats.totalBdt / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k</div>
              <div className="text-sm font-bold text-slate-400 mt-2">Total BDT cleared / ready</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Transaction Management</h1>
            <p className="text-slate-500 mt-1 font-medium">Manage and process transfers. Track audit logs continuously.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center w-full xl:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search ID, Name, Email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
                />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2 p-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto w-full sm:w-auto">
              {['all', 'pending', 'paid', 'sent'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-5 py-2 rounded-lg text-xs font-black tracking-wide uppercase transition-all whitespace-nowrap ${filter === s
                    ? (s === 'sent' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'bg-slate-900 text-white shadow-md shadow-slate-200')
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Transaction</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Sender Detail</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Recipient / Method</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransfers.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900 border-l-4 border-emerald-500 pl-3">#{tx.id}</div>
                      <div className="text-xs text-slate-400 pl-4 mt-1">
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                      {tx.paymentIntentId && (
                        <div className="text-[10px] text-slate-500 pl-4 mt-1 font-mono break-all max-w-[150px]">
                          {tx.paymentIntentId}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900">{tx.userName || 'Anonymous'}</div>
                      <div className="text-sm text-slate-400 font-medium">{tx.userEmail}</div>
                      <div className="text-xs text-slate-400">{tx.userMobile}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900">{tx.accountName}</div>
                      <div className="text-sm text-slate-500 font-medium">#{tx.accountNumber}</div>

                      {(tx.bankName || tx.branchName || tx.routingNumber) && (
                        <div className="text-xs text-slate-500 mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                          {tx.bankName && <div className="font-bold text-slate-700">{tx.bankName}</div>}
                          {tx.branchName && <div className="text-slate-500">Branch: <span className="font-medium text-slate-700">{tx.branchName}</span></div>}
                          {tx.routingNumber && <div className="text-slate-500">Routing: <span className="font-medium text-slate-700">{tx.routingNumber}</span></div>}
                        </div>
                      )}

                      {tx.provider && !tx.bankName && (
                        <div className="text-xs text-slate-500 mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100 font-bold text-slate-700">
                          {tx.provider}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase">
                          {tx.method ? tx.method.replace('_', ' ') : 'UNKNOWN'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="text-lg font-extrabold text-slate-900">৳ {Number(tx.amountBdt).toLocaleString()}</div>
                      <div className="text-xs font-bold text-slate-400">${tx.amountAud} AUD</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tx.status === 'sent' ? 'bg-emerald-100 text-emerald-800' :
                        tx.status === 'paid' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {tx.status === 'paid' && (
                        confirmingId === tx.id ? (
                          <div className="flex flex-col gap-2 min-w-[200px] animate-in slide-in-from-right-4">
                            <input
                              type="text"
                              placeholder="Enter Tx ID..."
                              value={adminTxId}
                              onChange={(e) => setAdminTxId(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateStatus(tx.id, 'sent')}
                                disabled={!adminTxId}
                                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                              >
                                Submit & Confirm
                              </button>
                              <button
                                onClick={() => { setConfirmingId(null); setAdminTxId(''); }}
                                className="px-3 py-2 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmingId(tx.id)}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-50 group hover:scale-[1.02] active:scale-[0.98]"
                          >
                            Confirm Sent <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </button>
                        )
                      )}
                      {tx.status === 'pending' && (
                        <span className="text-slate-400 text-sm italic font-medium">Waiting Payment</span>
                      )}
                      {tx.status === 'sent' && (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                            <CheckCircle2 className="w-4 h-4" /> Finalized
                          </div>
                          {tx.adminTransactionId && (
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-6">
                              Tx: {tx.adminTransactionId}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTransfers.length === 0 && (
              <div className="py-20 text-center text-slate-400 font-medium">
                No transactions found for this filter.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
