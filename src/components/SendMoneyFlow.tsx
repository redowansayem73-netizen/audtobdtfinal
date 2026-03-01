import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, Building2, Smartphone, ShieldCheck, Mail, User, Clock, Info, Zap, Shield, AlertCircle, Lock, Check } from 'lucide-react';

const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_sample');

export default function SendMoneyFlow() {
  const location = useLocation();
  const initialAmount = location.state?.amountAud || 1000;
  const initialBeneficiary = location.state?.beneficiary;

  const [step, setStep] = useState(initialBeneficiary ? 2 : 1);
  const [amountAud, setAmountAud] = useState<number>(initialAmount);
  const [exchangeRate, setExchangeRate] = useState(75.45);

  const [deliveryMethod, setDeliveryMethod] = useState<'mobile_wallet' | 'bank'>(initialBeneficiary?.type || 'mobile_wallet');
  const [walletProvider, setWalletProvider] = useState(initialBeneficiary?.provider || 'bkash');
  const [accountName, setAccountName] = useState(initialBeneficiary?.accountName || '');
  const [accountNumber, setAccountNumber] = useState(initialBeneficiary?.accountNumber || '');

  const [bankName, setBankName] = useState(initialBeneficiary?.bankName || '');
  const [branchName, setBranchName] = useState(initialBeneficiary?.branchName || '');
  const [routingNumber, setRoutingNumber] = useState(initialBeneficiary?.routingNumber || '');

  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderMobile, setSenderMobile] = useState('');

  const [clientSecret, setClientSecret] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const [savedBeneficiaries, setSavedBeneficiaries] = useState<any[]>([]);

  const [amountBdt, setAmountBdt] = useState<number>(initialAmount * 75.45);

  useEffect(() => {
    fetch('/api/config/rate')
      .then(res => res.json())
      .then(data => {
        if (data.rate) {
          setExchangeRate(data.rate);
          setAmountBdt(amountAud * data.rate);
        }
      })
      .catch(console.error);

    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      setSenderEmail(parsed.email || '');
      setSenderName(parsed.name || '');
      setSenderMobile(parsed.mobile || '');

      fetch(`/api/user/beneficiaries?email=${parsed.email}`)
        .then(res => res.json())
        .then(setSavedBeneficiaries)
        .catch(console.error);
    }
  }, []);

  const handleAudChange = (val: number) => {
    setAmountAud(val);
    setAmountBdt(Number((val * exchangeRate).toFixed(2)));
  };

  const handleBdtChange = (val: number) => {
    setAmountBdt(val);
    setAmountAud(Number((val / exchangeRate).toFixed(2)));
  };

  const handleCreatePaymentIntent = async () => {
    setIsProcessing(true);
    try {
      const destinationDetails = deliveryMethod === 'mobile_wallet'
        ? { walletProvider, accountName, accountNumber }
        : { bankName, branchName, accountName, accountNumber, routingNumber };

      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountAud,
          email: senderEmail,
          name: senderName,
          mobile: senderMobile,
          deliveryMethod,
          destinationDetails
        }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        setClientSecret(data.clientSecret);
        setStep(4);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Connection error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pt-6 pb-12 px-2 bg-slate-50 flex flex-col justify-center">
      <div className="max-w-sm mx-auto w-full">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
          className="mb-4 flex items-center gap-2 text-slate-500 text-sm font-bold hover:text-slate-900 transition-colors group"
        >
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-slate-100 group-hover:border-slate-300 transition-all">
            <ArrowLeft className="w-3 h-3" />
          </div>
          Back
        </button>

        {/* Progress */}
        {step < 5 && (
          <div className="mb-6 flex justify-between relative px-2">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-slate-200"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-emerald-500 transition-all duration-700" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>

            {[
              { id: 1, label: 'Amount' },
              { id: 2, label: 'Dest' },
              { id: 3, label: 'Info' },
              { id: 4, label: 'Pay' }
            ].map((s) => (
              <div key={s.id} className="relative flex flex-col items-center gap-1">
                <div className={`relative z-10 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm border-2 transition-all duration-500 ${step >= s.id ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100' : 'bg-white border-slate-200 text-slate-300'}`}>
                  {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${step >= s.id ? 'text-slate-900' : 'text-slate-300'}`}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-5 relative overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] opacity-60 pointer-events-none"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-50 rounded-full blur-[80px] opacity-60 pointer-events-none"></div>

          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
              <div className="text-left">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Send Money</h2>
                <div className="inline-flex items-center gap-1 mt-1 font-bold text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  <Zap className="w-3 h-3" /> Best exchange rate guaranteed.
                </div>
              </div>

              <div className="relative">
                {/* You Send Card */}
                <div className="p-4 sm:p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] relative z-10 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:bg-white transition-all">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">You Send</label>
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="number"
                      value={amountAud}
                      onChange={(e) => handleAudChange(Number(e.target.value))}
                      className="text-3xl sm:text-4xl font-black bg-transparent border-none p-0 focus:ring-0 w-full text-slate-900 placeholder:text-slate-300"
                      placeholder="0"
                    />
                    <div className="flex items-center gap-2 bg-white rounded-xl px-2.5 py-1.5 shrink-0 shadow-sm border border-slate-100">
                      <div className="w-3.5 h-3.5 rounded bg-slate-100 flex items-center justify-center text-[7px] text-slate-400 font-black">↕</div>
                      <span className="text-lg leading-none">🇦🇺</span>
                      <span className="font-bold text-slate-900 text-[11px] sm:text-xs">AUD</span>
                    </div>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="bg-slate-900 rounded-full w-8 h-8 flex items-center justify-center text-white border-[3px] border-white shadow hover:bg-slate-800 transition-colors cursor-pointer">
                    <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                  </div>
                </div>

                {/* They Receive Card */}
                <div className="p-4 sm:p-5 bg-emerald-50/50 border border-emerald-100 rounded-[1.5rem] mt-1 relative z-0 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:bg-white transition-all">
                  <label className="text-[9px] font-black text-emerald-600/70 uppercase tracking-widest block mb-1">They Receive</label>
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="number"
                      value={amountBdt}
                      onChange={(e) => handleBdtChange(Number(e.target.value))}
                      className="text-3xl sm:text-4xl font-black bg-transparent border-none p-0 focus:ring-0 w-full text-emerald-700 placeholder:text-emerald-300"
                      placeholder="0"
                    />
                    <div className="flex items-center gap-2 bg-white rounded-xl px-2.5 py-1.5 shrink-0 shadow-sm border border-emerald-100">
                      <span className="text-lg leading-none">🇧🇩</span>
                      <span className="font-bold text-emerald-800 text-[11px] sm:text-xs">BDT</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transfer Summary Card */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between items-center text-[11px] sm:text-xs">
                  <span className="text-slate-500 font-bold">Exchange Rate</span>
                  <span className="text-slate-900 font-black">1 AUD = {exchangeRate} BDT</span>
                </div>
                <div className="flex justify-between items-center text-[11px] sm:text-xs">
                  <span className="text-slate-500 font-bold">Transfer Fee</span>
                  <span className="text-emerald-600 font-black">FREE</span>
                </div>
                <div className="flex justify-between items-center text-[11px] sm:text-xs border-t border-slate-200 pt-2.5">
                  <span className="text-slate-900 font-black">Estimated Arrival</span>
                  <span className="flex items-center gap-1 text-blue-600 font-black">
                    <Clock className="w-3 h-3" /> 15 - 30 Min
                  </span>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-slate-900 text-white py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 mt-2 group"
              >
                Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
              <div className="text-left">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Delivery</h2>
                <p className="text-slate-400 mt-1 text-sm font-bold">Choose how you want your money sent.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'mobile_wallet', label: 'Mobile Wallet', sub: 'Instant', icon: Smartphone, speed: 'Fast' },
                  { id: 'bank', label: 'Bank Account', sub: '1-2 Biz Days', icon: Building2, speed: 'Standard' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setDeliveryMethod(m.id as any)}
                    className={`p-4 sm:p-5 rounded-[1.5rem] border-2 text-left transition-all relative overflow-hidden group ${deliveryMethod === m.id ? 'border-emerald-500 bg-emerald-50/40 shadow-xl shadow-emerald-50' : 'border-slate-100 bg-slate-50 hover:border-slate-300'}`}
                  >
                    <m.icon className={`w-6 h-6 mb-3 transition-colors ${deliveryMethod === m.id ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <div className="font-black text-slate-900 text-sm">{m.label}</div>
                    <div className="text-[9px] text-slate-400 font-black mt-0.5 uppercase tracking-widest">{m.sub}</div>
                    {deliveryMethod === m.id && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest">ON</div>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                  <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em]">RECIPIENT ACCOUNT</h3>
                </div>

                {savedBeneficiaries.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Select Saved Receiver</p>
                    <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                      {savedBeneficiaries.map(ben => (
                        <button
                          key={ben.id}
                          onClick={() => {
                            setDeliveryMethod(ben.type);
                            if (ben.type === 'mobile_wallet') setWalletProvider(ben.provider || 'bkash');
                            setAccountNumber(ben.accountNumber);
                            setAccountName(ben.name);
                            if (ben.type === 'bank') {
                              setBankName(ben.bankName || '');
                              setBranchName(ben.branchName || '');
                              setRoutingNumber(ben.routingNumber || '');
                            }
                          }}
                          className="flex items-center gap-3 shrink-0 p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition-all text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase text-xs shrink-0">
                            {ben.name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 leading-tight">{ben.name}</div>
                            <div className="text-[10px] font-bold text-slate-400 mt-0.5">{ben.provider || ben.bankName}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {deliveryMethod === 'mobile_wallet' ? (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-3 gap-2">
                      {['bkash', 'nagad', 'rocket'].map(p => (
                        <button
                          key={p}
                          onClick={() => setWalletProvider(p)}
                          className={`py-2 text-xs rounded-xl border-2 font-bold capitalize transition-all ${walletProvider === p ? 'border-slate-900 bg-slate-900 text-white shadow-md' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          className="block w-full text-sm pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-bold"
                        />
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="Mobile Number"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="block w-full text-sm pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <input type="text" placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} className="block w-full text-sm px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-bold" />
                    <input type="text" placeholder="Branch Name" value={branchName} onChange={(e) => setBranchName(e.target.value)} className="block w-full text-sm px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-bold" />
                    <input type="text" placeholder="Account Name" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="block w-full text-sm px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-bold" />
                    <input type="text" placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="block w-full text-sm px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-bold" />
                    <input type="text" placeholder="Routing Number" value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value)} className="block w-full text-sm px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-bold" />
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl flex gap-3 items-start border border-blue-100">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-blue-200 shrink-0">
                  <Info className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-[10px] text-blue-700 font-bold leading-relaxed mt-0.5">
                  Ensure account details match exactly for correct disbursement.
                </p>
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!accountName || !accountNumber}
                className="w-full bg-slate-900 text-white py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-30 disabled:grayscale mt-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
              <div className="text-left">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verification</h2>
                <p className="text-slate-400 mt-1 text-sm font-bold">Verify your identity for secure transfer.</p>
              </div>

              <div className="space-y-3">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Full Name (Sender)"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="block w-full text-sm pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-bold"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="block w-full text-sm pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-bold"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Mobile Number (Australia)"
                    value={senderMobile}
                    onChange={(e) => setSenderMobile(e.target.value)}
                    className="block w-full text-sm pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="p-5 bg-emerald-600 rounded-[1.5rem] text-white shadow-xl shadow-emerald-200/50 flex gap-4 items-start">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-0.5 mt-0.5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-100/90">Security Protocol</h4>
                  <p className="text-[11px] font-bold leading-relaxed opacity-95">
                    We'll create your account automatically. You'll receive a secure login link via email to track this transfer.
                  </p>
                </div>
              </div>

              <button
                onClick={handleCreatePaymentIntent}
                disabled={!senderName || !senderEmail || !senderMobile || isProcessing}
                className="w-full bg-slate-900 text-white py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 mt-2 group disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Review & Pay <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </div>
          )}

          {step === 4 && clientSecret && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-emerald-600 tracking-tight">Secure Payment</h2>
                  <p className="text-slate-400 mt-1 text-sm font-bold">Finalize your transfer with Stripe.</p>
                </div>
                <div className="w-8 h-8 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-5">
                  <div>
                    <span className="text-slate-400 font-black uppercase text-[9px] tracking-[0.2em] block mb-1">Total Payable</span>
                    <span className="text-3xl font-black tracking-tight">${amountAud.toFixed(2)} <span className="text-sm text-slate-500">AUD</span></span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 font-black uppercase text-[9px] tracking-[0.2em] block mb-1">Recipient gets</span>
                    <span className="text-lg font-black text-emerald-400">৳ {amountBdt.toLocaleString()} BDT</span>
                  </div>
                  <div className="bg-white/10 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-300">Rate Lock</div>
                </div>
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { borderRadius: '16px', colorPrimary: '#10b981', fontFamily: 'Inter, system-ui, sans-serif' } } }}>
                <CheckoutForm
                  onSuccess={() => setStep(5)}
                />
              </Elements>
            </div>
          )}

          {step === 5 && (
            <div className="text-center py-4 space-y-6 animate-in zoom-in-95 duration-700">
              <div>
                <h2 className="text-[2.5rem] leading-[2.5rem] font-black text-slate-900 tracking-tight mb-3">Success!</h2>
                <p className="text-slate-500 text-[15px] font-bold leading-relaxed px-4">
                  Your payment has been secured. Your transfer <span className="bg-blue-600/90 text-white px-1.5 py-0.5 whitespace-nowrap">is now in the fast lane</span>.
                </p>
              </div>

              <div className="bg-slate-50/80 rounded-[2rem] p-6 text-left relative overflow-hidden flex flex-col items-center">
                <div className="w-full flex justify-between items-start mb-8 relative z-10 w-full">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">CURRENT STATUS</h4>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fef3c7] text-[#92400e] rounded-xl text-[10px] font-black uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" /> PROCESSING PENDING
                    </span>
                  </div>
                  <div className="text-right">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">REFERENCE</h4>
                    <span className="text-[13px] font-black text-slate-900">#AUD-{Date.now().toString().slice(-6)}</span>
                  </div>
                </div>

                <div className="w-full bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-8 mt-2">
                  <div className="flex justify-between items-center mb-3 border-b border-slate-50 pb-3">
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">You sent:</span>
                    <span className="text-lg font-black text-slate-900">${amountAud.toFixed(2)} AUD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Receiver Gets:</span>
                    <span className="text-lg font-black text-emerald-600">৳ {amountBdt.toLocaleString()} BDT</span>
                  </div>
                </div>

                <div className="w-full relative z-10">
                  <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-[0.2em] flex items-center gap-2 mb-6 ml-1">
                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                    TRANSIT MILESTONES
                  </h3>

                  <div className="relative pl-3">
                    {/* Vertical connecting line */}
                    <div className="absolute left-[1.1rem] top-4 bottom-4 w-0.5 bg-slate-200"></div>

                    <ul className="space-y-5 relative">
                      {[
                        { step: 1, text: 'Payment Received', time: 'SUCCESS', active: true },
                        { step: 2, text: 'BDT disbursement', time: 'IN PROGRESS', active: false },
                        { step: 3, text: 'Receipt sent to your email', time: 'FINAL STEP', active: false }
                      ].map((m) => (
                        <li key={m.step} className="flex gap-4 items-center">
                          <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-[11px] font-black shrink-0 relative z-10 ${m.active ? 'bg-emerald-500' : 'bg-slate-900'}`}>
                            {m.active ? <Check size={14} strokeWidth={4} /> : m.step}
                          </div>
                          <div className="-mt-1">
                            <p className="text-sm text-slate-900 font-bold leading-none mb-1">{m.text}</p>
                            <p className={`text-[9px] font-black uppercase tracking-widest ${m.active ? 'text-emerald-500' : 'text-slate-400'}`}>{m.time}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-[#1a1f2e] text-white py-4 rounded-[1.5rem] text-sm font-black hover:bg-slate-800 transition-all"
                >
                  Track in My Dashboard
                </button>
                <button
                  onClick={() => { setStep(1); setAmountAud(1000); }}
                  className="group flex items-center justify-center gap-1.5 text-emerald-600 font-black uppercase tracking-[0.2em] text-[10px] hover:text-emerald-700 transition-all mt-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> SEND ANOTHER TRANSFER
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help section */}
        <div className="mt-12 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" /> Trusted by 50,000+ Senders
          </p>
        </div>
      </div>
    </div>
  );
}

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'An error occurred');
      setIsProcessing(false);
    } else if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture')) {
      // Optimistically show success to the user immediately
      onSuccess();

      // Confirm payment on server in the background
      fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
      }).catch(err => {
        console.error('Background server update failed after payment success:', err);
      });
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error && (
        <div className="flex gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 group animate-in shake-in duration-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-emerald-600 text-white py-4 rounded-2xl text-base font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 group"
      >
        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Pay Securely <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" /></>}
      </button>

      <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3" /> 256-bit AES Encryption
      </p>
    </form>
  );
}
