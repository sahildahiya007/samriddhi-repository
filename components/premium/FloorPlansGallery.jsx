import React, { useState } from 'react';
import { Download, Eye } from 'lucide-react';

const FloorCard = ({ plan, onView }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-semibold text-slate-900">{plan.label}</p>
                <p className="mt-1 text-sm text-slate-600">{plan.size}</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => onView(plan)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-amber-50 text-amber-700">
                    <Eye size={16} /> View
                </button>
                {plan.pdf && (
                    <a href={plan.pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                        <Download size={16} /> PDF
                    </a>
                )}
            </div>
        </div>
        {plan.thumbnail && <img src={plan.thumbnail} alt={plan.label} className="mt-3 w-full rounded-lg object-cover" />}
    </div>
);

const FloorPlansGallery = ({ floorPlans = [] }) => {
    const [active, setActive] = useState(null);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm uppercase tracking-[0.24em] text-amber-600">Floor Plans</h3>
                <p className="text-sm text-slate-500">Download or view</p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {floorPlans.map((plan) => (
                    <div key={`${plan.label}-${plan.size}`}>
                        <FloorCard plan={plan} onView={(p) => setActive(p)} />
                    </div>
                ))}
            </div>

            {active && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="max-w-4xl overflow-hidden rounded-2xl bg-white p-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold">{active.label}</h4>
                            <button onClick={() => setActive(null)} className="text-sm text-slate-500">Close</button>
                        </div>
                        <div className="mt-4">
                            {active.fullImage ? (
                                <img src={active.fullImage} alt={active.label} className="w-full object-contain" />
                            ) : (
                                <p className="text-sm text-slate-600">Preview not available</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FloorPlansGallery;
