import React, { useState } from 'react';
import { Phone, MessageCircle, Download } from 'lucide-react';

const QuickForm = ({ onSubmit }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit({ name, phone });
            }}
            className="space-y-3"
        >
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
            <button type="submit" className="w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white">Request Call</button>
        </form>
    );
};

const PremiumSidebar = ({ startingPrice, brochureUrl, onCall, onWhatsApp }) => {
    const handleSubmit = (data) => {
        console.log('quick contact', data);
        alert('Thanks — our team will call you.');
    };

    return (
        <div className="sticky top-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-amber-600">Starting Price</p>
                <div className="mt-2 flex items-baseline gap-3">
                    <div className="text-2xl font-bold text-slate-900">{startingPrice}</div>
                </div>
                <div className="mt-4 space-y-3">
                    <QuickForm onSubmit={handleSubmit} />
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={onCall} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                            <Phone size={16} /> Call
                        </button>
                        <button onClick={onWhatsApp} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                            <MessageCircle size={16} /> WhatsApp
                        </button>
                        {brochureUrl && (
                            <a href={brochureUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                                <Download size={16} /> Brochure
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-900">Why buy here</p>
                <ul className="mt-3 space-y-2 text-slate-700">
                    <li>Strong connectivity</li>
                    <li>High rental demand</li>
                    <li>Trusted builder</li>
                </ul>
            </div>
        </div>
    );
};

export default PremiumSidebar;
