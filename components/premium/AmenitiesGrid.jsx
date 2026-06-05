import React, { useState } from 'react';

const Amenity = ({ name }) => (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="h-8 w-8 rounded-md bg-slate-50" />
        <div className="text-sm text-slate-700">{name}</div>
    </div>
);

const AmenitiesGrid = ({ amenities = [] }) => {
    const [expanded, setExpanded] = useState(false);
    const top = amenities.slice(0, 8);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm uppercase tracking-[0.24em] text-amber-600">Amenities</h3>
                <button onClick={() => setExpanded(!expanded)} className="text-sm text-amber-600">{expanded ? 'Show less' : 'Show all'}</button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(expanded ? amenities : top).map((a) => (
                    <Amenity key={a} name={a} />
                ))}
            </div>
        </div>
    );
};

export default AmenitiesGrid;
