'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';
import { AlertTriangle } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [configError, setConfigError] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!isSupabaseConfigured()) {
            setConfigError(true);
        }
    }, []);

    // Initialize client (env vars must be set)
    const supabase = getSupabaseBrowserClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // For demo/dev purposes, simple login
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (error.message === 'Failed to fetch') {
                alert('Error de Conexión: No se pudo contactar a Supabase. Verifica que las claves de Vercel estén bien configuradas.');
            } else {
                alert('Error: ' + error.message);
            }
            setLoading(false);
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="mb-8 text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto mb-4 shadow-lg shadow-blue-600/20"></div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bienvenido</h1>
                    <p className="text-slate-500 mt-2">Ingresa a GestiónObra</p>
                </div>

                {configError && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800 text-sm">
                        <AlertTriangle className="shrink-0" size={20} />
                        <div>
                            <p className="font-bold mb-1">¡Faltan claves de configuración!</p>
                            <p>Debes añadir `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en el panel de Vercel.</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="usuario@demo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-lg shadow-slate-900/10 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Iniciando...' : 'Ingresar'}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-slate-400">
                    Demo Access: supervisor@demo.com
                </div>
            </div>
        </div>
    );
}
