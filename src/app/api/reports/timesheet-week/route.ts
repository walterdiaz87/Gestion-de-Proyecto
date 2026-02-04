import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: NextRequest) {
    const apiKey = req.headers.get('x-api-key');
    if (apiKey !== process.env.REPORTS_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get start and end of current week or requested week
    const today = new Date();
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay())); // Sunday
    const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6)); // Saturday

    const start = firstDay.toISOString().split('T')[0];
    const end = lastDay.toISOString().split('T')[0];

    const { data: timesheets, error } = await supabase
        .from('timesheets')
        .select(`
      date,
      hours,
      user:profiles!user_id(full_name, role),
      subtask:subtasks(title, project:tasks(project:projects(name)))
    `)
        .gte('date', start)
        .lte('date', end);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Group by User
    const report: Record<string, any> = {};

    timesheets.forEach((t: any) => {
        const userName = t.user?.full_name || 'Unknown';
        if (!report[userName]) {
            report[userName] = {
                role: t.user?.role,
                total_hours: 0,
                entries: []
            };
        }
        report[userName].total_hours += Number(t.hours);
        report[userName].entries.push({
            date: t.date,
            hours: t.hours,
            task: t.subtask?.title,
            project: t.subtask?.project?.project?.name
        });
    });

    return NextResponse.json({
        period: { start, end },
        data: report
    });
}
