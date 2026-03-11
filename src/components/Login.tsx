import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Code
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
      } else {
        setError(data.error || 'Failed to send code');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e?: React.FormEvent, overrideCode?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: overrideCode || code }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('loginTimestamp', Date.now().toString());
        navigate('/dashboard');
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl transition-all bg-emerald-600 shadow-emerald-200">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mt-2">
            Log in securely to your dashboard.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100">{error}</div>}

          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-medium"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-70 group"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
                {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm font-bold mb-6 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Change Email
                </button>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Verification Code</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setCode(val);
                    if (val.length === 6) {
                      // Trigger verification automatically when 6 digits are entered
                      handleVerifyCode(undefined, val);
                    }
                  }}
                  className="block w-full px-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-medium text-center text-3xl tracking-[0.5em] shadow-inner"
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
                <p className="text-center text-xs text-slate-400 mt-4">We sent a 6-digit code to <span className="text-slate-900 font-bold">{email}</span></p>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-400 mt-8">
          Don't have an account? No worries, one will be created for you when you send money.
        </p>
      </div>
    </div>
  );
}
