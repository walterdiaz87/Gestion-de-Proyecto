'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid, BarChart3, Plus, X } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

type ViewMode = 'gantt' | 'kanban';

type Task = {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
    progress?: number;
    responsable?: { full_name: string };
};

export default function ProjectOverviewPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('gantt');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        loadTasks();
    }, []);

    async function loadTasks() {
        const { data } = await supabase
            .from('tasks')
            .select('*, responsable:profiles!responsable_id(full_name)')
            .order('start_date', { ascending: true });

        setTasks(data || []);
        setLoading(false);
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Vista de Proyecto</h1>
                    <p className="text-slate-500">Gantt y Kanban de tareas</p>
                </div>

                <div className="flex gap-2">
                    {/* View Toggle */}
                    <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                        <button
                            onClick={() => setViewMode('gantt')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'gantt'
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <BarChart3 size={18} />
                            <span className="hidden sm:inline">Gantt</span>
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'kanban'
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <LayoutGrid size={18} />
                            <span className="hidden sm:inline">Kanban</span>
                        </button>
                    </div>

                    {/* Add Task Button */}
                    <button
                        onClick={() => setShowTaskModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Nueva Tarea</span>
                    </button>
                </div>
            </div>

            {viewMode === 'gantt' ? (
                <EnhancedGanttView tasks={tasks} loading={loading} />
            ) : (
                <KanbanView tasks={tasks} loading={loading} />
            )}

            {showTaskModal && (
                <TaskModal onClose={() => { setShowTaskModal(false); loadTasks(); }} />
            )}
        </div>
    );
}

function EnhancedGanttView({ tasks, loading }: { tasks: Task[], loading: boolean }) {
    // Calculate timeline (months)
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    // Color palette for tasks (similar to reference image)
    const colors = [
        'bg-red-500',
        'bg-orange-500',
        'bg-yellow-500',
        'bg-green-500',
        'bg-cyan-500',
        'bg-blue-500',
        'bg-indigo-500',
        'bg-purple-500',
        'bg-pink-500',
    ];

    function getTaskPosition(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const startMonth = start.getMonth();
        const endMonth = end.getMonth();
        const duration = endMonth - startMonth + 1;

        return {
            start: startMonth,
            duration: Math.max(duration, 1),
        };
    }

    if (loading) {
        return <div className="bg-white rounded-2xl p-8 text-center text-slate-400">Cargando...</div>;
    }

    return (
        <div className="bg-slate-800 rounded-2xl p-6 overflow-x-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-white text-xl font-bold mb-2">Cronograma Anual</h2>
                <div className="text-slate-400 text-sm">Vista de 12 meses</div>
            </div>

            {/* Timeline Grid */}
            <div className="min-w-[800px]">
                {/* Month Headers */}
                <div className="grid grid-cols-12 gap-1 mb-4">
                    {months.map((month) => (
                        <div key={month} className="text-center text-slate-400 text-xs font-semibold py-2">
                            {month}
                        </div>
                    ))}
                </div>

                {/* Task Rows */}
                <div className="space-y-3">
                    {tasks.map((task, index) => {
                        const pos = getTaskPosition(task.start_date, task.end_date);
                        const color = colors[index % colors.length];

                        return (
                            <div key={task.id} className="relative">
                                {/* Task Label */}
                                <div className="text-sm font-medium mb-1.5" style={{ color: color.replace('bg-', '#') }}>
                                    {task.name}
                                </div>

                                {/* Timeline Grid */}
                                <div className="grid grid-cols-12 gap-1 h-8">
                                    {months.map((_, monthIndex) => (
                                        <div key={monthIndex} className="bg-slate-700/30 rounded"></div>
                                    ))}

                                    {/* Task Bar */}
                                    <div
                                        className={`absolute h-8 ${color} rounded shadow-lg transition-all hover:shadow-xl cursor-pointer`}
                                        style={{
                                            left: `calc(${(pos.start / 12) * 100}% + ${pos.start * 0.25}rem)`,
                                            width: `calc(${(pos.duration / 12) * 100}% - ${0.25}rem)`,
                                        }}
                                        title={`${task.name} - ${task.responsable?.full_name || 'Sin asignar'}`}
                                    >
                                        <div className="px-3 py-1.5 text-white text-xs font-semibold truncate">
                                            {task.name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {tasks.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        No hay tareas creadas. Haz clic en "Nueva Tarea" para comenzar.
                    </div>
                )}
            </div>
        </div>
    );
}

function KanbanView({ tasks, loading }: { tasks: Task[], loading: boolean }) {
    const columns = [
        { id: 'pending', title: 'Pendiente', tasks: tasks.filter(t => t.status === 'pending') },
        { id: 'in_progress', title: 'En Curso', tasks: tasks.filter(t => t.status === 'in_progress') },
        { id: 'blocked', title: 'Bloqueado', tasks: tasks.filter(t => t.status === 'blocked') },
        { id: 'done', title: 'Completado', tasks: tasks.filter(t => t.status === 'done') },
    ];

    if (loading) {
        return <div className="bg-white rounded-2xl p-8 text-center text-slate-400">Cargando...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((col) => (
                <div key={col.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900">{col.title}</h3>
                        <span className="bg-white text-slate-600 text-xs font-bold px-2 py-1 rounded-full border border-slate-200">
                            {col.tasks.length}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {col.tasks.map((task) => (
                            <div key={task.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <h4 className="font-semibold text-slate-900 mb-2 text-sm">{task.name}</h4>
                                <div className="text-xs text-slate-500">{task.responsable?.full_name || 'Sin asignar'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function TaskModal({ onClose }: { onClose: () => void }) {
    const [formData, setFormData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        responsable_id: '',
    });
    const [profiles, setProfiles] = useState<any[]>([]);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function loadProfiles() {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['supervisor', 'responsable'])
                .order('full_name');
            setProfiles(data || []);
        }
        loadProfiles();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Get the first project (for simplicity)
        const { data: projects } = await supabase.from('projects').select('id').limit(1);
        const projectId = projects?.[0]?.id;

        if (!projectId) {
            alert('No hay proyectos disponibles');
            return;
        }

        await supabase.from('tasks').insert([{
            ...formData,
            project_id: projectId,
            status: 'pending',
        }]);

        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Nueva Tarea</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre de la Tarea *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ej: Instalación eléctrica"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Responsable *</label>
                        <select
                            required
                            value={formData.responsable_id}
                            onChange={(e) => setFormData({ ...formData, responsable_id: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Seleccionar...</option>
                            {profiles.map((p) => (
                                <option key={p.id} value={p.id}>{p.full_name} ({p.role})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha Inicio *</label>
                            <input
                                type="date"
                                required
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha Fin *</label>
                            <input
                                type="date"
                                required
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
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
                            Crear Tarea
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
