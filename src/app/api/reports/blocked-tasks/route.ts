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

    // Fetch blocked tasks with details
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
      id,
      name,
      project:projects(name),
      responsable:profiles!responsable_id(full_name, email),
      subtasks(
        title,
        status,
        is_blocking,
        assigned_to
      )
    `)
        .eq('is_blocked', true);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Format for reporting
    const blockedTasks = tasks.map((t: any) => ({
        task_name: t.name,
        project: t.project?.name,
        responsable: t.responsable?.full_name,
        blocking_factors: t.subtasks
            .filter((st: any) => st.is_blocking && st.status !== 'done')
            .map((st: any) => st.title)
    }));

    return NextResponse.json({
        count: blockedTasks.length,
        tasks: blockedTasks
    });
}
