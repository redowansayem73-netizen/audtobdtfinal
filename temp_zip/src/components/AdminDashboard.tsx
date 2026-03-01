import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Clock, Send } from 'lucide-react';

type Transaction = {
  id: number;
  user_id: number;
  amount_aud: number;
  amount_bdt: number;
  delivery_method: string;
  destination_details: string;
  status: string;
  created_at: string;
  user_name: string;
  user_email: string;
  user_mobile: string;
};

export default function AdminDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<number | null>(null);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/admin/transactions');
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const markAsSent = async (id: number) => {
    setSendingId(id);
    try {
      await fetch(`/api/admin/transactions/${id}/send`, { method: 'POST' });
      fetchTransactions();
    } catch (err) {
      console.error(err);
    } finally {
      setSendingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and process money transfers</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">ID / Date</th>
                <th className="px-6 py-4 font-semibold">Sender</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Destination</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => {
                const dest = JSON.parse(tx.destination_details);
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">#{tx.id}</div>
                      <div className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{tx.user_name}</div>
                      <div className="text-xs text-slate-500">{tx.user_email}</div>
                      <div className="text-xs text-slate-500">{tx.user_mobile}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">${tx.amount_aud.toFixed(2)} AUD</div>
                      <div className="text-xs font-medium text-emerald-600">৳ {tx.amount_bdt.toFixed(2)} BDT</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                        {tx.delivery_method}
                      </div>
                      <div className="text-xs text-slate-600">
                        {tx.delivery_method === 'mobile_wallet' ? (
                          <>
                            <span className="font-medium">{dest.walletProvider}</span> - {dest.accountNumber}
                            <br />{dest.accountName}
                          </>
                        ) : (
                          <>
                            <span className="font-medium">{dest.bankName}</span> ({dest.branchName})
                            <br />Acc: {dest.accountNumber}
                            <br />Routing: {dest.routingNumber}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.status === 'paid' && (
                        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> Pending Send
                        </span>
                      )}
                      {tx.status === 'sent' && (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sent
                        </span>
                      )}
                      {tx.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-200">
                          Awaiting Payment
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {tx.status === 'paid' && (
                        <button
                          onClick={() => markAsSent(tx.id)}
                          disabled={sendingId === tx.id}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-all"
                        >
                          {sendingId === tx.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-4 h-4" /> Send Money
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
