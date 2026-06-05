import React from 'react';

const ConnectivityCard = ({ name, distance }) => (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <div className="text-sm font-medium text-slate-900">{name}</div>
        <div className="text-sm text-slate-500">{distance}</div>
    </div>
);

const LocationConnectivity = ({ property = {} }) => {
    const query = encodeURIComponent(property.address || property.location || 'Gurgaon');
    const mapSrc = `https://www.google.com/maps?q=${query}&output=embed`;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm uppercase tracking-[0.24em] text-amber-600">Location & Connectivity</h3>
            <p className="mt-2 text-sm text-slate-700">{property.location || property.address}</p>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg overflow-hidden border border-slate-200">
                    <iframe title="map" src={mapSrc} className="h-48 w-full border-0" />
                </div>

                <div className="space-y-3">
                    {(property.nearbyPlaces || []).map((p) => (
                        <ConnectivityCard key={p.name} name={p.name} distance={p.distance} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LocationConnectivity;
