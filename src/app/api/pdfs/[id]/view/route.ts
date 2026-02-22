import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const ipHash = request.headers.get('x-forwarded-for') || 'unknown';
    await supabase.from('analytics_events').insert({
        pdf_id: id,
        event_type: 'view',
        ip_hash: ipHash.slice(0, 20),
    });

    // Increment view count using a raw update
    await supabase
        .from('pdfs')
        .update({ view_count: supabase.rpc as unknown as number })
        .eq('id', id);

    // Use raw SQL increment via rpc
    await supabase.rpc('increment_view_count', { pdf_id_arg: id }).maybeSingle();

    return NextResponse.json({ success: true });
}
