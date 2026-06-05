import React from 'react';

const Fact = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-sm font-semibold text-slate-900">{value || '—'}</span>
    </div>
);

const PropertyFacts = ({ facts = {} }) => {
    const items = [
        { label: 'Starting Price', value: facts.startingPrice },
        { label: 'Property Type', value: facts.propertyType },
        { label: 'Configuration', value: facts.configuration },
        { label: 'Sizes', value: facts.sizes },
        { label: 'Possession', value: facts.possession },
        { label: 'Status', value: facts.status },
        { label: 'RERA', value: facts.rera },
        { label: 'Land Parcel', value: facts.landParcel },
        { label: 'Towers', value: facts.towers },
        { label: 'Total Units', value: facts.totalUnits },
        { label: 'Floors', value: facts.floors },
        { label: 'Parking', value: facts.parking },
    ];

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm uppercase tracking-[0.24em] text-amber-600">Property facts</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((it) => (
                    <div key={it.label} className="rounded-xl bg-slate-50 p-4">
                        <Fact label={it.label} value={it.value} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PropertyFacts;
