'use client';

import { useState } from 'react';
import { Calendar, Clock, Save, Plus } from 'lucide-react';

export default function TimesheetPage() {
    const [entries, setEntries] = useState([
        { id: 1, task: 'Excavación masiva', hours: 4, date: '2024-03-12', notes: 'Zanja principal' },
        { id: 2, task: 'Compactación', hours: 4, date: '2024-03-12', notes: '' },
    ]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Carga de Horas</h1>
                    <p className="text-slate-500">Registra tu trabajo diario</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                    <Plus size={20} />
                    Nuevo Registro
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Mobile-friendly list */}
                <div className="divide-y divide-slate-100">
                    {entries.map((entry) => (
                        <div key={entry.id} className="p-5 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-slate-800">{entry.task}</h3>
                                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                                    <Clock size={16} />
                                    {entry.hours}h
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={16} />
                                    {entry.date}
                                </div>
                            </div>
                            {entry.notes && (
                                <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg italic border border-slate-100">
                                    "{entry.notes}"
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
