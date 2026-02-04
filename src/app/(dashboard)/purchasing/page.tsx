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
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Compras y Materiales</h1>
                    <p className="text-slate-500">Gestión de insumos y entregas</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors">
                        <Filter size={18} />
                        Filtros
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                        <Plus size={20} />
                        Solicitar Material
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar material, proveedor o tarea..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Material</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm hidden md:table-cell">Tarea</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm hidden sm:table-cell">Proveedor</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-center">Progreso</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {materials.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-900">{m.name}</div>
                                    <div className="text-sm text-slate-500 md:hidden">{m.task}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-600 hidden md:table-cell">{m.task}</td>
                                <td className="px-6 py-4 text-slate-600 hidden sm:table-cell">{m.supplier}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-xs font-medium text-slate-500 w-16 text-right">
                                            {m.received} / {m.qty} {m.unit}
                                        </span>
                                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${m.status === 'received' ? 'bg-green-500' : 'bg-blue-500'}`}
                                                style={{ width: `${(m.received / m.qty) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Badge status={m.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
