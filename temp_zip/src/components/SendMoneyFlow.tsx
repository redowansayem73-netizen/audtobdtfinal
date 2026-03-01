import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, ArrowRight, CheckCircle2, Building2, Smartphone, ShieldCheck } from 'lucide-react';

const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const EXCHANGE_RATE = 75.45;

export default function SendMoneyFlow() {
  const [step, setStep] = useState(1);
  const [amountAud, setAmountAud] = useState<number>(1000);
  
  const [deliveryMethod, setDeliveryMethod] = useState<'mobile_wallet' | 'bank'>('mobile_wallet');
  const [walletProvider, setWalletProvider] = useState('bkash');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');

  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderMobile, setSenderMobile] = useState('');

  const [clientSecret, setClientSecret] = useState('');
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      setSenderEmail(parsed.email || '');
      setSenderName(parsed.name || '');
      setSenderMobile(parsed.mobile || '');
    }
  }, []);

  const amountBdt = amountAud * EXCHANGE_RATE;

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
        setClientSecret(data.clientSecret);
        setTransactionId(data.transactionId);
        setStep(4);
      } else {
        alert('Failed to initialize payment: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress Bar */}
      {step < 5 && (
        <div className="mb-8 flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full -z-10 transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
          
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step >= i ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>
              {i}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Send Money to Bangladesh</h2>
              <p className="text-slate-500 mt-2">Fast, secure, and great exchange rates.</p>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">You Send</label>
                <div className="flex items-center justify-between border-2 border-slate-200 rounded-2xl p-4 group-focus-within:border-emerald-500 transition-colors bg-slate-50 group-focus-within:bg-white">
                  <input
                    type="number"
                    value={amountAud}
                    onChange={(e) => setAmountAud(Number(e.target.value))}
                    className="text-3xl font-bold bg-transparent border-none p-0 focus:ring-0 w-full text-slate-900"
                    min="10"
                  />
                  <div className="flex items-center gap-2 bg-slate-200/50 rounded-lg px-3 py-1.5 shrink-0">
                    <span className="text-xl">🇦🇺</span>
                    <span className="font-bold text-slate-700">AUD</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <div className="bg-white rounded-full p-2 shadow-sm border border-slate-100 text-emerald-600">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">They Receive</label>
                <div className="flex items-center justify-between border-2 border-slate-200 rounded-2xl p-4 bg-emerald-50/50 border-emerald-100">
                  <div className="text-3xl font-bold text-emerald-700">
                    {amountBdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-100/50 rounded-lg px-3 py-1.5 shrink-0">
                    <span className="text-xl">🇧🇩</span>
                    <span className="font-bold text-emerald-800">BDT</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-500 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="font-medium">Exchange Rate</span>
                <span className="font-bold text-slate-900">1 AUD = ৳ {EXCHANGE_RATE}</span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-slate-900 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors mt-8"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Delivery Method</h2>
              <p className="text-slate-500 mt-1">How should we deliver the money?</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setDeliveryMethod('mobile_wallet')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${deliveryMethod === 'mobile_wallet' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <Smartphone className={`w-6 h-6 mb-3 ${deliveryMethod === 'mobile_wallet' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div className="font-bold text-slate-900">Mobile Wallet</div>
                <div className="text-xs text-slate-500 mt-1">Instant transfer</div>
              </button>
              <button
                onClick={() => setDeliveryMethod('bank')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${deliveryMethod === 'bank' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <Building2 className={`w-6 h-6 mb-3 ${deliveryMethod === 'bank' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div className="font-bold text-slate-900">Bank Transfer</div>
                <div className="text-xs text-slate-500 mt-1">1-2 business days</div>
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Recipient Details</h3>
              
              {deliveryMethod === 'mobile_wallet' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Provider</label>
                    <select
                      value={walletProvider}
                      onChange={(e) => setWalletProvider(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    >
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Name</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Branch Name</label>
                    <input
                      type="text"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Name</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Routing Number</label>
                    <input
                      type="text"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 bg-slate-100 text-slate-700 py-4 rounded-xl text-lg font-bold hover:bg-slate-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 bg-slate-900 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                disabled={!accountName || !accountNumber}
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Your Details</h2>
              <p className="text-slate-500 mt-1">We'll create an account for you automatically.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile Number (AU)</label>
                <input
                  type="text"
                  value={senderMobile}
                  onChange={(e) => setSenderMobile(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800">
                Your details are securely stored. You can log in later using a code sent to your email.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 bg-slate-100 text-slate-700 py-4 rounded-xl text-lg font-bold hover:bg-slate-200 transition-colors"
                disabled={isProcessing}
              >
                Back
              </button>
              <button
                onClick={handleCreatePaymentIntent}
                className="w-2/3 bg-slate-900 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-70"
                disabled={!senderName || !senderEmail || !senderMobile || isProcessing}
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Proceed to Pay'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && clientSecret && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Payment</h2>
              <p className="text-slate-500 mt-1">Pay securely with Stripe.</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500 text-sm">Amount to pay</span>
                <span className="font-bold text-slate-900">${amountAud.toFixed(2)} AUD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Recipient gets</span>
                <span className="font-bold text-emerald-700">৳ {amountBdt.toFixed(2)} BDT</span>
              </div>
            </div>

            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
              <CheckoutForm 
                clientSecret={clientSecret} 
                onSuccess={() => setStep(5)} 
                onBack={() => setStep(3)} 
              />
            </Elements>
          </div>
        )}

        {step === 5 && (
          <div className="text-center space-y-6 py-8 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Payment Received!</h2>
            <p className="text-slate-600 max-w-sm mx-auto">
              We've received your payment of <span className="font-bold text-slate-900">${amountAud.toFixed(2)} AUD</span>. 
              The transaction status to the destination is currently <span className="font-semibold text-amber-600">Pending</span>.
            </p>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 text-left max-w-sm mx-auto mt-8">
              <h3 className="font-bold text-slate-900 mb-4">What happens next?</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" /> Our team verifies the transaction.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" /> Money is sent to the destination.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" /> You receive an email receipt.</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setStep(1);
                setAmountAud(1000);
              }}
              className="mt-8 text-emerald-600 font-semibold hover:text-emerald-700"
            >
              Send another transfer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutForm({ clientSecret, onSuccess, onBack }: { clientSecret: string, onSuccess: () => void, onBack: () => void }) {
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
      // Notify backend
      try {
        await fetch('/api/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });
        onSuccess();
      } catch (err) {
        console.error(err);
        setError('Payment succeeded but failed to update server.');
        setIsProcessing(false);
      }
    } else {
      onSuccess(); // Assume success for demo if redirected or pending
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 bg-slate-100 text-slate-700 py-4 rounded-xl text-lg font-bold hover:bg-slate-200 transition-colors"
          disabled={isProcessing}
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-2/3 bg-slate-900 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-70"
        >
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay Now'}
        </button>
      </div>
    </form>
  );
}
