import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    const daysBack = range === '90d' ? 90 : range === '30d' ? 30 : 7;
    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

    // Get all PDF ids for this user
    const { data: userPdfs } = await supabase
        .from('pdfs')
        .select('id, title, view_count, download_count')
        .eq('user_id', user.id);

    const pdfIds = (userPdfs ?? []).map(p => p.id);

    // Get analytics events
    const { data: events } = await supabase
        .from('analytics_events')
        .select('event_type, created_at')
        .in('pdf_id', pdfIds)
        .gte('created_at', since)
        .order('created_at', { ascending: true });

    // Aggregate by day
    const byDay: Record<string, { views: number; downloads: number; scans: number }> = {};
    for (const e of events ?? []) {
        const day = e.created_at.slice(0, 10);
        if (!byDay[day]) byDay[day] = { views: 0, downloads: 0, scans: 0 };
        if (e.event_type === 'view') byDay[day].views++;
        if (e.event_type === 'download') byDay[day].downloads++;
        if (e.event_type === 'qr_scan') byDay[day].scans++;
    }

    const chartData = Object.entries(byDay).map(([date, counts]) => ({
        date,
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        ...counts,
    }));

    return NextResponse.json({
        chartData,
        topPdfs: (userPdfs ?? [])
            .sort((a, b) => b.view_count - a.view_count)
            .slice(0, 5),
    });
}
