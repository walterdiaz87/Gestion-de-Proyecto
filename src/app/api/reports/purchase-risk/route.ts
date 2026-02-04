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

    // Fetch materials that are needed or ordered but not fully received, and are past due or close to blocked tasks
    // Simplification: Materials needed for tasks starting soon, or ordered materials past delivery date

    // 1. POs with past due dates
    const today = new Date().toISOString().split('T')[0];

    const { data: delayedPOs, error: poError } = await supabase
        .from('purchase_orders')
        .select(`
      id,
      order_number,
      supplier_name,
      expected_delivery_date,
      status
    `)
        .lt('expected_delivery_date', today)
        .neq('status', 'received'); // Assuming 'received' is final

    if (poError) return NextResponse.json({ error: poError.message }, { status: 500 });

    return NextResponse.json({
        delayed_orders: delayedPOs
    });
}
