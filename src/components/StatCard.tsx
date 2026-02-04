export function StatCard({ title, value, subtitle, icon, trend }: { title: string, value: string, subtitle?: string, icon?: React.ReactNode, trend?: 'up' | 'down' | 'neutral' }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 font-medium text-sm">{title}</h3>
                {icon && <div className="text-blue-500 bg-blue-50 p-2 rounded-lg">{icon}</div>}
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{value}</span>
                {subtitle && <span className="text-sm text-slate-400 font-medium">{subtitle}</span>}
            </div>
        </div>
    );
}
