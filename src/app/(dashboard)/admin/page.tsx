'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Building2, Plus, Edit, Trash2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

type Profile = {
    id: string;
    email: string;
    full_name: string;
    role: string;
};

type Supplier = {
    id: string;
    name: string;
    contact_person: string;
    email: string;
    phone: string;
};

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'users' | 'suppliers'>('users');
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    );

    useEffect(() => {
        loadData();
    }, [activeTab]);

    async function loadData() {
        setLoading(true);
        if (activeTab === 'users') {
            const { data } = await supabase.from('profiles').select('*').order('role', { ascending: true });
            setProfiles(data || []);
        } else {
            const { data } = await supabase.from('suppliers').select('*').order('name', { ascending: true });
            setSuppliers(data || []);
        }
        setLoading(false);
    }

    async function updateProfile(id: string, updates: Partial<Profile>) {
        await supabase.from('profiles').update(updates).eq('id', id);
        loadData();
    }

    async function deleteSupplier(id: string) {
        if (confirm('¿Eliminar este proveedor?')) {
            await supabase.from('suppliers').delete().eq('id', id);
            loadData();
        }
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Administración</h1>
                <p className="text-slate-500">Gestión de usuarios y proveedores</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-white border border-slate-200 rounded-xl p-1 w-fit">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'users'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Users size={18} />
                    Usuarios
                </button>
                <button
                    onClick={() => setActiveTab('suppliers')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'suppliers'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Building2 size={18} />
                    Proveedores
                </button>
            </div>

            {activeTab === 'users' ? (
                <UsersPanel profiles={profiles} onUpdate={updateProfile} loading={loading} />
            ) : (
                <SuppliersPanel suppliers={suppliers} onDelete={deleteSupplier} onRefresh={loadData} loading={loading} />
            )}
        </div>
    );
}

function UsersPanel({ profiles, onUpdate, loading }: { profiles: Profile[], onUpdate: (id: string, updates: Partial<Profile>) => void, loading: boolean }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 text-left font-semibold text-slate-700 text-sm">Nombre</th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-700 text-sm">Email</th>
                        <th className="px-6 py-4 text-left font-semibold text-slate-700 text-sm">Rol</th>
                        <th className="px-6 py-4 text-right font-semibold text-slate-700 text-sm">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {loading ? (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Cargando...</td></tr>
                    ) : (
                        profiles.map((profile) => (
                            <tr key={profile.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    {editingId === profile.id ? (
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="px-3 py-1 border border-slate-300 rounded-lg text-sm"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="font-semibold text-slate-900">{profile.full_name}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-slate-600">{profile.email}</td>
                                <td className="px-6 py-4">
                                    <RoleBadge role={profile.role} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {editingId === profile.id ? (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    onUpdate(profile.id, { full_name: editName });
                                                    setEditingId(null);
                                                }}
                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="px-3 py-1 bg-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-300"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditingId(profile.id);
                                                setEditName(profile.full_name);
                                            }}
                                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 ml-auto"
                                        >
                                            <Edit size={16} />
                                            Editar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

function SuppliersPanel({ suppliers, onDelete, onRefresh, loading }: { suppliers: Supplier[], onDelete: (id: string) => void, onRefresh: () => void, loading: boolean }) {
    const [showForm, setShowForm] = useState(false);

    return (
        <div>
            <div className="mb-4 flex justify-end">
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                >
                    <Plus size={20} />
                    Nuevo Proveedor
                </button>
            </div>

            {showForm && <SupplierForm onClose={() => { setShowForm(false); onRefresh(); }} />}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-left font-semibold text-slate-700 text-sm">Nombre</th>
                            <th className="px-6 py-4 text-left font-semibold text-slate-700 text-sm">Contacto</th>
                            <th className="px-6 py-4 text-left font-semibold text-slate-700 text-sm">Email</th>
                            <th className="px-6 py-4 text-left font-semibold text-slate-700 text-sm">Teléfono</th>
                            <th className="px-6 py-4 text-right font-semibold text-slate-700 text-sm">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Cargando...</td></tr>
                        ) : suppliers.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No hay proveedores registrados</td></tr>
                        ) : (
                            suppliers.map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-900">{supplier.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{supplier.contact_person || '-'}</td>
                                    <td className="px-6 py-4 text-slate-600">{supplier.email || '-'}</td>
                                    <td className="px-6 py-4 text-slate-600">{supplier.phone || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onDelete(supplier.id)}
                                            className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1 ml-auto"
                                        >
                                            <Trash2 size={16} />
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SupplierForm({ onClose }: { onClose: () => void }) {
    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
    });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        await supabase.from('suppliers').insert([formData]);
        onClose();
    }

    return (
        <div className="mb-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Nuevo Proveedor</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre *</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Persona de Contacto</label>
                    <input
                        type="text"
                        value={formData.contact_person}
                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Dirección</label>
                    <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        rows={2}
                    />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Guardar
                    </button>
                </div>
            </form>
        </div>
    );
}

function RoleBadge({ role }: { role: string }) {
    const styles = {
        supervisor: 'bg-purple-100 text-purple-700 border-purple-200',
        responsable: 'bg-blue-100 text-blue-700 border-blue-200',
        operario: 'bg-green-100 text-green-700 border-green-200',
    };

    const labels = {
        supervisor: 'Supervisor',
        responsable: 'Responsable',
        operario: 'Operario',
    };

    return (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[role as keyof typeof styles] || 'bg-slate-100 text-slate-600'}`}>
            {labels[role as keyof typeof labels] || role}
        </span>
    );
}
