import React from 'react';

const BuilderProfile = ({ builder = {} }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
            {builder.logo ? (
                <img src={builder.logo} alt={builder.name} className="h-16 w-16 rounded-lg object-contain" />
            ) : (
                <div className="h-16 w-16 rounded-lg bg-slate-100" />
            )}
            <div>
                <p className="text-sm font-semibold text-slate-900">{builder.name || 'Builder name'}</p>
                <p className="mt-1 text-sm text-slate-600">{builder.years || '—'} years • {builder.projectsDelivered || 0} projects</p>
            </div>
        </div>
        <div className="mt-4 text-sm text-slate-700">{builder.description}</div>
        <div className="mt-4 flex items-center justify-between">
            <a className="text-sm font-semibold text-amber-600" href={builder.link || '#'}>View all projects</a>
            <div className="text-sm text-slate-500">Trusted developer</div>
        </div>
    </div>
);

export default BuilderProfile;
