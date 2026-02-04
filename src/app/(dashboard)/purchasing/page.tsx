'use client';

import { ShoppingCart, Plus, Filter, Search } from 'lucide-react';

export default function PurchasingPage() {
    const materials = [
        { id: 1, name: 'Perfil IPN 200', task: 'Fabricación Estructura', qty: 5000, unit: 'kg', status: 'partial', received: 2500, supplier: 'Acindar' },
        { id: 2, name: 'Cemento Portland', task: 'Fundaciones', qty: 200, unit: 'bolsas', status: 'ordered', received: 0, supplier: 'Holcim' },
        { id: 3, name: 'Hierro del 8', task: 'Fundaciones', qty: 300, unit: 'varillas', status: 'received', received: 300, supplier: 'Acindar' },
        { id: 4, name: 'Pintura Epoxi', task: 'Pintura', qty: 200, unit: 'lts', status: 'needed', received: 0, supplier: '-' },
    ];

    return (
        <div className="w-full space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Compras & Materiales</h1>
                    <p className="text-slate-500 font-medium">Gestión de insumos y entregas industriales</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex-1 md:flex-none bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-5 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm">
                        <Filter size={20} />
                        <span>Filtrar</span>
                    </button>
                    <button className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                        <Plus size={22} />
                        <span>Solicitar</span>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                <input
                    type="text"
                    placeholder="Buscar material, proveedor o tarea..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-lg"
                />
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-8 py-5 font-bold text-slate-900 text-xs uppercase tracking-wider">Insumo / Material</th>
                            <th className="px-8 py-5 font-bold text-slate-900 text-xs uppercase tracking-wider">Tarea Asociada</th>
                            <th className="px-8 py-5 font-bold text-slate-900 text-xs uppercase tracking-wider">Proveedor</th>
                            <th className="px-8 py-5 font-bold text-slate-900 text-xs uppercase tracking-wider text-center">Progreso Entrega</th>
                            <th className="px-8 py-5 font-bold text-slate-900 text-xs uppercase tracking-wider text-right">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {materials.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-6 font-bold text-slate-900">{m.name}</td>
                                <td className="px-8 py-6 text-slate-600 font-medium">{m.task}</td>
                                <td className="px-8 py-6 text-slate-500">{m.supplier}</td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${m.status === 'received' ? 'bg-green-500' : 'bg-blue-500 shadow-lg shadow-blue-500/20'}`}
                                                style={{ width: `${(m.received / m.qty) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap bg-slate-100 px-2 py-1 rounded-md min-w-[100px] text-center">
                                            {m.received} / {m.qty} {m.unit}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <Badge status={m.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {materials.map((m) => (
                    <div key={m.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm active:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg leading-tight">{m.name}</h3>
                                <p className="text-sm text-slate-500 mt-0.5">{m.task}</p>
                            </div>
                            <Badge status={m.status} />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end text-sm">
                                <span className="text-slate-400 font-medium">Progreso: <span className="text-slate-900">{(m.received / m.qty * 100).toFixed(0)}%</span></span>
                                <span className="font-bold text-slate-900">{m.received} / {m.qty} <span className="text-[10px] text-slate-400 uppercase">{m.unit}</span></span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${m.status === 'received' ? 'bg-green-500' : 'bg-blue-500'}`}
                                    style={{ width: `${(m.received / m.qty) * 100}%` }}
                                ></div>
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Proveedor:</div>
                                <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">{m.supplier}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Badge({ status }: { status: string }) {
    const styles = {
        received: 'bg-green-100 text-green-700 border-green-200',
        ordered: 'bg-blue-50 text-blue-700 border-blue-200',
        partial: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        needed: 'bg-slate-100 text-slate-600 border-slate-200',
    };

    const labels = {
        received: 'Recibido',
        ordered: 'Pedido',
        partial: 'Parcial',
        needed: 'Requerido',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles]}`}>
            {labels[status as keyof typeof labels]}
        </span>
    );
}
