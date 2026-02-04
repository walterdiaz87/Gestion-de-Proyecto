import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin client for reports (bypassing RLS if needed, or complying with it)
// Ideally we use a Service Role key for n8n/admin/backend reports to ensure we see everything.
// However, sticking to the user's "Use existing Supabase" meant we might not have the service key easily if not provided.
// In the prompt context, we are in a Supabase environment. Next.js usually has process.env.SUPABASE_SERVICE_ROLE_KEY.
// We will try to use the standard environment variables.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: NextRequest) {
  // 1. Verify API Key
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== process.env.REPORTS_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Initialize Client
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 3. Fetch Data
  // We want: Total Tasks, Completed Tasks, % Progress, Delayed Tasks
  // We can do this with a few queries or a single RPC. Let's do parallel queries for simplicity.
  
  const { data: projects, error: projectError } = await supabase
    .from('projects')
    .select('id, name, status, start_date, end_date');

  if (projectError) return NextResponse.json({ error: projectError.message }, { status: 500 });

  const { data: tasks, error: taskError } = await supabase
    .from('tasks')
    .select('id, status, project_id, is_blocked');

  if (taskError) return NextResponse.json({ error: taskError.message }, { status: 500 });

  // 4. Transform Data
  const reports = projects.map(p => {
    const pTasks = tasks.filter(t => t.project_id === p.id);
    const total = pTasks.length;
    const completed = pTasks.filter(t => t.status === 'done').length;
    const blocked = pTasks.filter(t => t.is_blocked).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      project_id: p.id,
      name: p.name,
      status: p.status,
      kpis: {
        total_tasks: total,
        completed_tasks: completed,
        blocked_tasks: blocked,
        progress_percentage: progress
      }
    };
  });

  return NextResponse.json({ 
    timestamp: new Date().toISOString(),
    reports 
  });
}
