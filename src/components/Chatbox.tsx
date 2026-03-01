import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, ChevronLeft, PlusCircle } from 'lucide-react';

export default function Chatbox() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [hasEmail, setHasEmail] = useState(false);
    const [tickets, setTickets] = useState<any[]>([]);
    const [currentTicket, setCurrentTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);

    const [newSubject, setNewSubject] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [replyMessage, setReplyMessage] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const u = JSON.parse(userStr);
                if (u.email) {
                    setEmail(u.email);
                    setHasEmail(true);
                }
            } catch (e) { }
        }
    }, []);

    useEffect(() => {
        if (isOpen && hasEmail && !currentTicket && !isCreating) {
            fetchTickets();
        }
    }, [isOpen, hasEmail, currentTicket, isCreating]);

    useEffect(() => {
        let interval: any;
        if (isOpen && currentTicket) {
            fetchMessages(currentTicket.id);
            interval = setInterval(() => {
                fetchMessages(currentTicket.id);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isOpen, currentTicket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchTickets = async () => {
        try {
            const res = await fetch(`/api/support/tickets?email=${encodeURIComponent(email)}`);
            const data = await res.json();
            setTickets(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMessages = async (ticketId: number) => {
        try {
            const res = await fetch(`/api/support/tickets/${ticketId}/messages`);
            const data = await res.json();
            setMessages(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setHasEmail(true);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubject.trim() || !newMessage.trim()) return;

        try {
            const res = await fetch('/api/support/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, subject: newSubject, message: newMessage })
            });
            const data = await res.json();
            if (data.success) {
                setIsCreating(false);
                setNewSubject('');
                setNewMessage('');
                setCurrentTicket({ id: data.ticketId, subject: newSubject });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim() || !currentTicket) return;

        const tempMsg = replyMessage;
        setReplyMessage('');

        // Optimistic UI
        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', message: tempMsg }]);

        try {
            await fetch(`/api/support/tickets/${currentTicket.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, message: tempMsg })
            });
            fetchMessages(currentTicket.id);
        } catch (err) {
            console.error(err);
        }
    };

    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/super-admin')) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-xl transition-transform hover:scale-105"
                >
                    <MessageCircle size={28} />
                </button>
            )}

            {isOpen && (
                <div className="bg-white w-80 sm:w-96 h-[500px] max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
                    {/* Header */}
                    <div className="bg-emerald-600 text-white p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {currentTicket || isCreating ? (
                                <button onClick={() => { setCurrentTicket(null); setIsCreating(false); }} className="hover:bg-emerald-500 p-1 rounded">
                                    <ChevronLeft size={20} />
                                </button>
                            ) : null}
                            <h3 className="font-semibold text-lg">
                                {currentTicket ? 'Support Chat' : isCreating ? 'New Ticket' : 'Support Help'}
                            </h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-emerald-500 p-1 rounded">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
                        {!hasEmail ? (
                            <div className="p-6 flex-1 flex flex-col justify-center">
                                <p className="text-slate-600 mb-4 text-center">Please enter your email to start chatting with support.</p>
                                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        required
                                    />
                                    <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-xl font-medium hover:bg-emerald-700">
                                        Continue
                                    </button>
                                </form>
                            </div>
                        ) : isCreating ? (
                            <form onSubmit={handleCreateTicket} className="p-6 flex flex-col gap-4 h-full">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        value={newSubject}
                                        onChange={e => setNewSubject(e.target.value)}
                                        placeholder="Brief description of issue"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                    <textarea
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder="How can we help you?"
                                        className="w-full flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                                        required
                                    />
                                </div>
                                <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 flex justify-center items-center gap-2">
                                    <Send size={18} /> Send Message
                                </button>
                            </form>
                        ) : currentTicket ? (
                            <div className="flex flex-col h-full bg-white">
                                <div className="p-3 bg-emerald-50 border-b border-emerald-100 text-emerald-800 text-sm font-medium sticky top-0">
                                    Ticket #{currentTicket.id}: {currentTicket.subject}
                                </div>
                                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                    {messages.map((m: any, i) => (
                                        <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${m.sender === 'user'
                                                    ? 'bg-emerald-600 text-white rounded-tr-sm'
                                                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                                                }`}>
                                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                <form onSubmit={handleReply} className="p-3 border-t border-slate-100 bg-white flex items-end gap-2">
                                    <textarea
                                        value={replyMessage}
                                        onChange={e => setReplyMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 max-h-32 min-h-[44px] px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                                        rows={1}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleReply(e);
                                            }
                                        }}
                                    />
                                    <button type="submit" disabled={!replyMessage.trim()} className="h-[44px] w-[44px] shrink-0 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600">
                                        <Send size={18} className="translate-x-[1px]" />
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="p-4 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-4 px-2">
                                    <h4 className="font-semibold text-slate-800">Your Tickets</h4>
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm font-medium"
                                    >
                                        <PlusCircle size={16} /> New Chat
                                    </button>
                                </div>
                                {tickets.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm px-6 text-center">
                                        <MessageCircle size={32} className="mb-3 text-slate-300" />
                                        <p>You have no active support tickets.</p>
                                        <p className="mt-1">Click "New Chat" to start.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 overflow-y-auto flex-1">
                                        {tickets.map(t => (
                                            <div
                                                key={t.id}
                                                onClick={() => setCurrentTicket(t)}
                                                className="bg-white p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all"
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Ticket #{t.id}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {t.status}
                                                    </span>
                                                </div>
                                                <h5 className="font-medium text-slate-800 truncate">{t.subject}</h5>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
