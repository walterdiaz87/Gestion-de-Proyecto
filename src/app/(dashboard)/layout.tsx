'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, ShoppingCart, Clock, Settings, LogOut, Menu, User, MoreHorizontal, LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<{ email: string; full_name: string; role: string } | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

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
        <div className="flex h-[100dvh] bg-slate-50 overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-[40] md:hidden backdrop-blur-md transition-all duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar (Desktop Persistent / Mobile Drawer) */}
            <aside className={`
                fixed inset-y-0 left-0 z-[50] w-72 bg-slate-900 text-white shadow-2xl 
                transform transition-all duration-300 ease-in-out
                md:relative md:translate-x-0 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-500 rounded-xl flex-shrink-0 shadow-lg shadow-blue-500/20"></div>
                            <span className="font-bold text-xl tracking-tight text-white">GestiónObra</span>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 hover:bg-slate-800 rounded-lg">
                            <Menu size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                        <NavLink href="/dashboard" icon={<LayoutDashboard size={22} />} label="Panel de Control" active={pathname === '/dashboard'} />
                        <NavLink href="/projects/gantt" icon={<BarChart2 size={22} />} label="Gantt & Cronograma" active={pathname.includes('/projects')} />
                        <NavLink href="/purchasing" icon={<ShoppingCart size={22} />} label="Compras & Entregas" active={pathname === '/purchasing'} />
                        <NavLink href="/timesheet" icon={<Clock size={22} />} label="Carga de Horas" active={pathname === '/timesheet'} />
                        <NavLink href="/admin" icon={<Settings size={22} />} label="Ajustes Sistema" active={pathname === '/admin'} />
                    </nav>

                    {/* User Profile Section */}
                    <div className="p-4 bg-slate-800/50 border-t border-slate-800">
                        {user && (
                            <div className="mb-4 px-4 py-3 bg-slate-800 rounded-xl border border-slate-700/50 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold ring-2 ring-blue-400/20">
                                        {user.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold truncate text-white">{user.full_name}</div>
                                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                            {user.role === 'supervisor' ? 'Súper' : user.role === 'responsable' ? 'Responsable' : 'Operario'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-medium cursor-pointer"
                        >
                            <LogOut size={20} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Desktop/Mobile Common Header */}
                <header className="h-16 px-4 md:px-8 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg md:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-3 md:hidden">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                            <span className="font-bold text-slate-900 truncate">Obra Activa</span>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm">
                            <span>GestiónObra</span>
                            <span>/</span>
                            <span className="text-slate-900 font-medium capitalize">
                                {pathname.split('/').pop()?.replace('-', ' ') || 'Inicio'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right">
                            <div className="text-xs font-semibold text-slate-900 leading-none">V2.9.0 Stable</div>
                            <div className="text-[10px] text-slate-400">Proyectos Activos: 3</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer hover:bg-slate-200 transition-colors">
                            <User size={18} />
                        </div>
                    </div>
                </header>

                {/* Content Container */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 md:p-8 lg:p-10 custom-scrollbar pb-24 md:pb-8">
                    {children}
                </main>

                {/* Mobile Bottom Nav */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-[40] pb-safe">
                    <BottomNavItem href="/dashboard" icon={<LayoutDashboard size={22} />} label="Inicio" active={pathname === '/dashboard'} />
                    <BottomNavItem href="/projects/gantt" icon={<BarChart2 size={22} />} label="Gantt" active={pathname.includes('/projects')} />
                    <BottomNavItem href="/purchasing" icon={<ShoppingCart size={22} />} label="Compras" active={pathname === '/purchasing'} />
                    <BottomNavItem href="/timesheet" icon={<Clock size={22} />} label="Horas" active={pathname === '/timesheet'} />
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="flex flex-col items-center justify-center gap-1 min-w-[64px] text-slate-500"
                    >
                        <MoreHorizontal size={22} />
                        <span className="text-[10px] font-medium">Más</span>
                    </button>
                </nav>
            </div>
        </div>
    );
}

function NavLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
    return (
        <Link
            href={href}
            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'}
            `}
        >
            <span className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`}>
                {icon}
            </span>
            <span>{label}</span>
        </Link>
    );
}

function BottomNavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
    return (
        <Link
            href={href}
            className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all
                ${active ? 'text-blue-600' : 'text-slate-500'}
            `}
        >
            <div className={`p-1 rounded-lg ${active ? 'bg-blue-50' : ''}`}>
                {icon}
            </div>
            <span className="text-[10px] font-bold">{label}</span>
        </Link>
    );
}
