import React from 'react';

const ConfigCard = ({ cfg }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">{cfg.label}</p>
        <p className="mt-2 text-lg font-bold text-amber-600">{cfg.price}</p>
        <p className="mt-1 text-sm text-slate-600">{cfg.size}</p>
    </div>
);

const Configurations = ({ configs = [] }) => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div className="flex items-center justify-between">
            <h3 className="text-sm uppercase tracking-[0.24em] text-amber-600">Available Configurations</h3>
            <p className="text-sm text-slate-500">Select & compare</p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {configs.map((c) => (
                <ConfigCard key={c.label} cfg={c} />
            ))}
        </div>
    </div>
);

export default Configurations;
