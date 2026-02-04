'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Plus, ChevronRight, ChevronDown, Calendar, X, Edit2, Trash2, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

type Task = {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
    parent_task_id: string | null;
    is_milestone: boolean;
    completed_at: string | null;
    notes: string | null;
    responsable?: { id: string; full_name: string };
    children?: Task[];
};

type TimeRange = 'month' | 'day';

const PROJECT_ID = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01';

export default function GanttPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedParent, setSelectedParent] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<TimeRange>('month');
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [notesTask, setNotesTask] = useState<Task | null>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    );

    useEffect(() => {
        loadTasks();
    }, []);

    async function loadTasks() {
        const { data: tasksData } = await supabase
            .from('tasks')
            .select('*, responsable:profiles!responsable_id(id, full_name)')
            .eq('project_id', PROJECT_ID)
            .order('task_order', { ascending: true });

        if (tasksData) {
            const taskMap = new Map<string, Task>();
            (tasksData as any[]).forEach((t: any) => taskMap.set(t.id, { ...t, children: [] }));

            const rootTasks: Task[] = [];
            (tasksData as any[]).forEach((task: any) => {
                if (task.parent_task_id) {
                    const parent = taskMap.get(task.parent_task_id);
                    if (parent) parent.children!.push(taskMap.get(task.id)!);
                } else {
                    rootTasks.push(taskMap.get(task.id)!);
                }
            });

            setTasks(rootTasks);
            const allIds = new Set<string>((tasksData as any[]).map((t: any) => t.id));
            setExpandedTasks(allIds);
        }
        setLoading(false);
    }

    function toggleExpand(taskId: string) {
        const newExpanded = new Set(expandedTasks);
        if (newExpanded.has(taskId)) {
            newExpanded.delete(taskId);
        } else {
            newExpanded.add(taskId);
        }
        setExpandedTasks(newExpanded);
    }

    async function deleteTask(taskId: string) {
        if (confirm('¿Eliminar esta tarea y todas sus subtareas?')) {
            await supabase.from('tasks').delete().eq('id', taskId);
            loadTasks();
        }
    }

    async function completeTask(taskId: string) {
        await supabase.from('tasks').update({
            completed_at: new Date().toISOString(),
            status: 'done'
        }).eq('id', taskId);
        loadTasks();
    }

    function handleEdit(task: Task) {
        setEditingTask(task);
        setShowTaskModal(true);
    }

    function handleNotes(task: Task) {
        setNotesTask(task);
        setShowNotesModal(true);
    }

    function getAllTasks(taskList: Task[]): Task[] {
        const result: Task[] = [];
        taskList.forEach(task => {
            result.push(task);
            if (task.children && task.children.length > 0 && expandedTasks.has(task.id)) {
                result.push(...getAllTasks(task.children));
            }
        });
        return result;
    }

    const flatTasks = getAllTasks(tasks);

    // Check for overdue tasks
    const overdueTasks = flatTasks.filter(t => {
        if (t.completed_at) return false;
        const endDate = new Date(t.end_date);
        const today = new Date();
        return endDate < today;
    });

    return (
        <div className="max-w-full mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Diagrama de Gantt</h1>
                    <p className="text-slate-500">Cronograma del proyecto</p>
                    {overdueTasks.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm font-medium">
                            <AlertTriangle size={16} />
                            {overdueTasks.length} tarea{overdueTasks.length > 1 ? 's' : ''} excedida{overdueTasks.length > 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    {/* Time Range Selector */}
                    <div className="flex bg-white border border-slate-200 rounded-xl p-1">
                        <button
                            onClick={() => setTimeRange('month')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${timeRange === 'month' ? 'bg-slate-900 text-white' : 'text-slate-600'
                                }`}
                        >
                            Año (Meses)
                        </button>
                        <button
                            onClick={() => setTimeRange('day')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${timeRange === 'day' ? 'bg-slate-900 text-white' : 'text-slate-600'
                                }`}
                        >
                            Mes (Días)
                        </button>
                    </div>

                    <button
                        onClick={() => { setEditingTask(null); setSelectedParent(null); setShowTaskModal(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                        <Plus size={20} />
                        Nueva Tarea
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl p-8 text-center text-slate-400">Cargando...</div>
            ) : (
                <MSProjectLayout
                    tasks={tasks}
                    flatTasks={flatTasks}
                    expanded={expandedTasks}
                    hoveredTaskId={hoveredTaskId}
                    timeRange={timeRange}
                    onToggle={toggleExpand}
                    onAddSubtask={(id) => { setSelectedParent(id); setEditingTask(null); setShowTaskModal(true); }}
                    onEdit={handleEdit}
                    onDelete={deleteTask}
                    onComplete={completeTask}
                    onHover={setHoveredTaskId}
                    onNotes={handleNotes}
                />
            )}

            {showTaskModal && (
                <TaskModal
                    task={editingTask}
                    parentTaskId={selectedParent}
                    onClose={() => { setShowTaskModal(false); setEditingTask(null); loadTasks(); }}
                />
            )}

            {showNotesModal && notesTask && (
                <NotesModal
                    task={notesTask}
                    onClose={() => { setShowNotesModal(false); setNotesTask(null); loadTasks(); }}
                />
            )}
        </div>
    );
}

function MSProjectLayout({ tasks, flatTasks, expanded, hoveredTaskId, timeRange, onToggle, onAddSubtask, onEdit, onDelete, onComplete, onHover, onNotes }: {
    tasks: Task[];
    flatTasks: Task[];
    expanded: Set<string>;
    hoveredTaskId: string | null;
    timeRange: TimeRange;
    onToggle: (id: string) => void;
    onAddSubtask: (id: string) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onComplete: (id: string) => void;
    onHover: (id: string | null) => void;
    onNotes: (task: Task) => void;
}) {
    const colors = [
        '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
        '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'
    ];

    // Generate timeline headers based on time range
    const getTimelineHeaders = () => {
        if (timeRange === 'month') {
            return ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        } else {
            // Current month days
            const now = new Date();
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
        }
    };

    const headers = getTimelineHeaders();

    function getTaskPosition(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (timeRange === 'month') {
            const startMonth = start.getMonth();
            const endMonth = end.getMonth();
            const duration = endMonth - startMonth + 1;

            return {
                start: startMonth,
                duration: Math.max(duration, 1),
            };
        } else {
            // Day view - current month
            const now = new Date();
            const startDay = start.getDate();
            const endDay = end.getDate();
            const duration = endDay - startDay + 1;

            return {
                start: startDay - 1,
                duration: Math.max(duration, 1),
            };
        }
    }

    function isTaskOverdue(task: Task): boolean {
        if (task.completed_at) return false;
        const endDate = new Date(task.end_date);
        const today = new Date();
        return endDate < today;
    }

    function getTaskLevel(task: Task): number {
        let level = 0;
        let currentParentId = task.parent_task_id;

        while (currentParentId) {
            level++;
            const parent = flatTasks.find(t => t.id === currentParentId);
            currentParentId = parent?.parent_task_id || null;
        }

        return level;
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="flex">
                {/* LEFT: Task List */}
                <div className="w-[550px] border-r border-slate-200 bg-slate-50">
                    <div className="bg-slate-800 text-white px-4 py-3 font-bold text-sm">
                        LISTA DE TAREAS
                    </div>

                    <div className="overflow-y-auto max-h-[600px]">
                        {flatTasks.map((task, index) => {
                            const level = getTaskLevel(task);
                            const hasChildren = task.children && task.children.length > 0;
                            const isExpanded = expanded.has(task.id);
                            const isHovered = hoveredTaskId === task.id;
                            const isCompleted = !!task.completed_at;
                            const isOverdue = isTaskOverdue(task);
                            const color = colors[index % colors.length];

                            return (
                                <div
                                    key={task.id}
                                    className={`px-4 py-2 border-b border-slate-200 transition-all cursor-pointer ${isHovered ? 'bg-blue-100 shadow-inner' : 'hover:bg-slate-100'
                                        } ${isCompleted ? 'opacity-60' : ''}`}
                                    style={{ paddingLeft: `${16 + level * 24}px` }}
                                    onMouseEnter={() => onHover(task.id)}
                                    onMouseLeave={() => onHover(null)}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            {hasChildren && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
                                                    className="text-slate-600 hover:text-slate-900 flex-shrink-0"
                                                >
                                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                </button>
                                            )}

                                            {task.is_milestone && (
                                                <div className="w-2 h-2 bg-yellow-500 rotate-45 flex-shrink-0"></div>
                                            )}

                                            {isCompleted && (
                                                <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                                            )}

                                            {isOverdue && (
                                                <AlertTriangle size={14} className="text-red-600 flex-shrink-0" />
                                            )}

                                            <span
                                                className={`text-sm font-semibold truncate ${isCompleted ? 'line-through' : ''}`}
                                                style={{ color: isCompleted ? '#94a3b8' : color }}
                                                title={task.name}
                                            >
                                                {task.name}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {task.notes && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onNotes(task); }}
                                                    className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                                                    title="Ver notas"
                                                >
                                                    <FileText size={14} />
                                                </button>
                                            )}
                                            {!isCompleted && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}
                                                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                                                    title="Marcar como completada"
                                                >
                                                    <CheckCircle size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                                title="Editar"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onAddSubtask(task.id); }}
                                                className="p-1 text-green-600 hover:bg-green-100 rounded text-xs font-bold"
                                                title="Agregar subtarea"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-xs text-slate-500 mt-1 ml-4">
                                        {task.responsable?.full_name || 'Sin asignar'} • {new Date(task.start_date).toLocaleDateString('es-AR')} - {new Date(task.end_date).toLocaleDateString('es-AR')}
                                        {isCompleted && task.completed_at && (
                                            <span className="ml-2 text-green-600 font-medium">
                                                ✓ Completada {new Date(task.completed_at).toLocaleDateString('es-AR')}
                                            </span>
                                        )}
                                        {isOverdue && (
                                            <span className="ml-2 text-red-600 font-medium">
                                                ⚠ Excedida
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: Timeline */}
                <div className="flex-1 bg-slate-800 overflow-x-auto">
                    <div className={timeRange === 'month' ? 'min-w-[700px]' : 'min-w-[1800px]'}>
                        {/* Headers */}
                        <div
                            className={`grid gap-px px-4 py-3`}
                            style={{ gridTemplateColumns: timeRange === 'day' ? `repeat(${headers.length}, 60px)` : `repeat(${headers.length}, minmax(0, 1fr))` }}
                        >
                            {headers.map((header, idx) => (
                                <div key={idx} className="text-center text-slate-300 text-xs font-bold border-b border-slate-600 pb-2">
                                    {header}
                                </div>
                            ))}
                        </div>

                        {/* Task Bars */}
                        <div className="px-4 pb-4 space-y-2 max-h-[560px] overflow-y-auto">
                            {flatTasks.map((task, index) => {
                                const pos = getTaskPosition(task.start_date, task.end_date);
                                const color = colors[index % colors.length];
                                const isHovered = hoveredTaskId === task.id;
                                const isCompleted = !!task.completed_at;
                                const isOverdue = isTaskOverdue(task);

                                return (
                                    <div
                                        key={task.id}
                                        className="relative h-8"
                                        onMouseEnter={() => onHover(task.id)}
                                        onMouseLeave={() => onHover(null)}
                                    >
                                        <div
                                            className={`grid gap-px h-full relative`}
                                            style={{ gridTemplateColumns: timeRange === 'day' ? `repeat(${headers.length}, 60px)` : `repeat(${headers.length}, minmax(0, 1fr))` }}
                                        >
                                            {headers.map((_, idx) => (
                                                <div key={idx} className="bg-slate-700/20 border-r border-slate-700"></div>
                                            ))}

                                            {/* Task Bar */}
                                            <div
                                                className={`absolute h-7 rounded shadow-lg transition-all cursor-pointer group ${isHovered ? 'ring-4 ring-white/50 scale-105 z-10' : ''
                                                    } ${isCompleted ? 'opacity-40' : ''} ${isOverdue ? 'ring-2 ring-red-500' : ''}`}
                                                style={{
                                                    backgroundColor: isCompleted ? '#94a3b8' : color,
                                                    left: timeRange === 'day'
                                                        ? `${pos.start * 60}px`
                                                        : `calc(${(pos.start / headers.length) * 100}% + ${pos.start * 0.25}rem)`,
                                                    width: timeRange === 'day'
                                                        ? `${pos.duration * 60 - 2}px`
                                                        : `calc(${(pos.duration / headers.length) * 100}% - ${0.25}rem)`,
                                                    top: '2px',
                                                }}
                                            >
                                                <div className="px-2 py-1 text-white text-xs font-bold truncate h-full flex items-center">
                                                    {task.name}
                                                </div>

                                                {/* Tooltip on hover */}
                                                <div className="absolute hidden group-hover:block bg-slate-900 text-white text-xs p-3 rounded-lg shadow-2xl -top-24 left-0 z-20 min-w-[250px]">
                                                    <div className="font-bold text-sm mb-1">{task.name}</div>
                                                    <div className="text-slate-300">{task.responsable?.full_name || 'Sin asignar'}</div>
                                                    <div className="text-slate-400 text-xs mt-1">
                                                        {new Date(task.start_date).toLocaleDateString('es-AR')} - {new Date(task.end_date).toLocaleDateString('es-AR')}
                                                    </div>
                                                    {task.notes && (
                                                        <div className="mt-2 pt-2 border-t border-slate-700 text-slate-300 italic">
                                                            📝 {task.notes}
                                                        </div>
                                                    )}
                                                    {isCompleted && task.completed_at && (
                                                        <div className="mt-2 text-green-400 font-medium">
                                                            ✓ Completada: {new Date(task.completed_at).toLocaleDateString('es-AR')}
                                                        </div>
                                                    )}
                                                    {isOverdue && (
                                                        <div className="mt-2 text-red-400 font-medium">
                                                            ⚠ Tarea excedida
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {flatTasks.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    No hay tareas. Crea una nueva tarea para comenzar.
                </div>
            )}
        </div>
    );
}

function TaskModal({ task, parentTaskId, onClose }: {
    task: Task | null;
    parentTaskId: string | null;
    onClose: () => void;
}) {
    const [formData, setFormData] = useState({
        name: task?.name || '',
        start_date: task?.start_date || '',
        end_date: task?.end_date || '',
        responsable_id: task?.responsable?.id || '',
        is_milestone: task?.is_milestone || false,
        notes: task?.notes || '',
    });
    const [profiles, setProfiles] = useState<any[]>([]);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        async function loadProfiles() {
            const { data } = await supabase.from('profiles').select('*').in('role', ['supervisor', 'responsable']).order('full_name');
            setProfiles(data || []);
        }
        loadProfiles();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (task) {
            await supabase.from('tasks').update({
                name: formData.name,
                start_date: formData.start_date,
                end_date: formData.end_date,
                responsable_id: formData.responsable_id || null,
                is_milestone: formData.is_milestone,
                notes: formData.notes || null,
            }).eq('id', task.id);
        } else {
            await supabase.from('tasks').insert([{
                ...formData,
                responsable_id: formData.responsable_id || null,
                notes: formData.notes || null,
                project_id: PROJECT_ID,
                parent_task_id: parentTaskId,
                status: 'pending',
            }]);
        }

        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">
                        {task ? 'Editar Tarea' : (parentTaskId ? 'Nueva Subtarea' : 'Nueva Tarea')}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Nombre *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Responsable</label>
                        <select
                            value={formData.responsable_id}
                            onChange={(e) => setFormData({ ...formData, responsable_id: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Sin asignar</option>
                            {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
                                <Calendar size={16} className="text-blue-500" />
                                Inicio *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
                                <Calendar size={16} className="text-blue-500" />
                                Fin *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
                            <FileText size={16} className="text-purple-500" />
                            Notas / Anotaciones
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            rows={3}
                            placeholder="Agregar notas sobre esta tarea..."
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="milestone"
                            checked={formData.is_milestone}
                            onChange={(e) => setFormData({ ...formData, is_milestone: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <label htmlFor="milestone" className="text-sm font-medium">Es un hito</label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            {task ? 'Guardar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function NotesModal({ task, onClose }: { task: Task; onClose: () => void }) {
    const [notes, setNotes] = useState(task.notes || '');

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function handleSave() {
        await supabase.from('tasks').update({ notes: notes || null }).eq('id', task.id);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FileText size={20} className="text-purple-500" />
                        Notas: {task.name}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    rows={6}
                    placeholder="Agregar notas o comentarios sobre esta tarea..."
                />

                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        Guardar Notas
                    </button>
                </div>
            </div>
        </div>
    );
}
