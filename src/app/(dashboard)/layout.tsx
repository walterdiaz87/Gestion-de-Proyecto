'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Home, BarChart2, ShoppingCart, Clock, Settings, LogOut, Menu, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<{ email: string; full_name: string; role: string } | null>(null);
    const router = useRouter();

    const supabase = getSupabaseBrowserClient();

    useEffect(() => {
        async function loadUser() {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (profile) {
                    setUser(profile as { email: string; full_name: string; role: string });
                }
            }
        }
        loadUser();
    }, []);

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push('/login');
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Mobile Sidebar Overlay (TODO: Add functionality) */}

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shadow-xl fixed h-full z-10">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex-shrink-0"></div>
                    <span className="font-bold text-lg tracking-tight">GestiónObra</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavLink href="/dashboard" icon={<Home size={20} />} label="Inicio" />
                    <NavLink href="/projects/gantt" icon={<BarChart2 size={20} />} label="Gantt" />
                    <NavLink href="/purchasing" icon={<ShoppingCart size={20} />} label="Compras" />
                    <NavLink href="/timesheet" icon={<Clock size={20} />} label="Horas" />
                    <NavLink href="/admin" icon={<Settings size={20} />} label="Administración" />
                </nav>

                {/* User Profile Section */}
                <div className="p-4 border-t border-slate-800">
                    {user && (
                        <div className="mb-3 px-4 py-2 bg-slate-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <User size={16} className="text-blue-400" />
                                <span className="text-sm font-semibold text-white">{user.full_name}</span>
                            </div>
                            <div className="text-xs text-slate-400">{user.email}</div>
                            <div className="mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'supervisor' ? 'bg-purple-900 text-purple-200' :
                                    user.role === 'responsable' ? 'bg-blue-900 text-blue-200' :
                                        'bg-green-900 text-green-200'
                                    }`}>
                                    {user.role === 'supervisor' ? 'Supervisor' :
                                        user.role === 'responsable' ? 'Responsable' : 'Operario'}
                                </span>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8">
                {/* Mobile Header */}
                <header className="md:hidden mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                        GestiónObra
                    </div>
                    <button className="p-2 bg-white rounded-md shadow-sm border">
                        <Menu size={24} />
                    </button>
                </header>

                {children}
            </main>
        </div>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    // Simple active state check would be done via usePathname hook
    return (
        <Link href={href} className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors group">
            <span className="group-hover:text-blue-400 transition-colors">{icon}</span>
            <span className="font-medium">{label}</span>
        </Link>
    );
}
