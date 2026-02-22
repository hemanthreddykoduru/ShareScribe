'use client';
import { useState, useEffect } from 'react';
import { Eye, Download, QrCode, TrendingUp, FileText, BarChart2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type DayData = { day: string; views: number; downloads: number; scans: number };
type TopPdf = { id: string; title: string; view_count: number; download_count: number; slug: string };

const RANGES = [
    { label: '7 days', value: 7 },
    { label: '30 days', value: 30 },
    { label: '90 days', value: 90 },
];

export default function AnalyticsPage() {
    const [range, setRange] = useState(7);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<DayData[]>([]);
    const [topPdfs, setTopPdfs] = useState<TopPdf[]>([]);
    const [totals, setTotals] = useState({ views: 0, downloads: 0, scans: 0, pdfs: 0 });
    const [activeTab, setActiveTab] = useState<'views' | 'downloads' | 'scans'>('views');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setLoading(false); return; }

            const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString();

            // Get all user PDFs
            const { data: userPdfs } = await supabase
                .from('pdfs')
                .select('id, title, slug, view_count, download_count')
                .eq('user_id', user.id);

            const pdfList = userPdfs ?? [];
            const pdfIds = pdfList.map(p => p.id);

            // Get analytics events for the range
            let events: { event_type: string; created_at: string }[] = [];
            if (pdfIds.length > 0) {
                const { data } = await supabase
                    .from('analytics_events')
                    .select('event_type, created_at')
                    .in('pdf_id', pdfIds)
                    .gte('created_at', since)
                    .order('created_at', { ascending: true });
                events = data ?? [];
            }

            // Fill all days in range
            const byDay: Record<string, DayData> = {};
            for (let i = range - 1; i >= 0; i--) {
                const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
                const key = d.toISOString().slice(0, 10);
                const label = d.toLocaleDateString('en-US', { weekday: range <= 7 ? 'short' : undefined, month: range > 7 ? 'short' : undefined, day: range > 7 ? 'numeric' : undefined });
                byDay[key] = { day: label, views: 0, downloads: 0, scans: 0 };
            }
            for (const e of events) {
                const key = e.created_at.slice(0, 10);
                if (!byDay[key]) continue;
                if (e.event_type === 'view') byDay[key].views++;
                if (e.event_type === 'download') byDay[key].downloads++;
                if (e.event_type === 'qr_scan') byDay[key].scans++;
            }

            const chart = Object.values(byDay);
            setChartData(chart);
            setTopPdfs(pdfList.sort((a, b) => b.view_count - a.view_count).slice(0, 5));
            setTotals({
                views: pdfList.reduce((s, p) => s + (p.view_count || 0), 0),
                downloads: pdfList.reduce((s, p) => s + (p.download_count || 0), 0),
                scans: events.filter(e => e.event_type === 'qr_scan').length,
                pdfs: pdfList.length,
            });
            setLoading(false);
        };
        load();
    }, [range]);

    const maxVal = Math.max(...chartData.map(d => d[activeTab]), 1);

    const statCards = [
        { icon: <FileText size={18} />, label: 'Total PDFs', value: totals.pdfs, color: '#2563eb' },
        { icon: <Eye size={18} />, label: 'Total Views', value: totals.views, color: '#3b82f6' },
        { icon: <Download size={18} />, label: 'Downloads', value: totals.downloads, color: '#10b981' },
        { icon: <QrCode size={18} />, label: 'QR Scans', value: totals.scans, color: '#3b82f6' },
    ];

    if (loading) return (
        <div style={{ paddingTop: 88, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(37,99,235,0.2)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div style={{ paddingTop: 88, minHeight: '100vh' }}>
            <div className="page-wrap" style={{ paddingBottom: 60 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>Analytics</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Track views, downloads, and QR scans for your PDFs.</p>
                    </div>
                    {/* Range selector */}
                    <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                        {RANGES.map(r => (
                            <button key={r.value} onClick={() => setRange(r.value)} style={{
                                padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                                background: range === r.value ? 'rgba(37,99,235,0.2)' : 'transparent',
                                color: range === r.value ? '#93c5fd' : 'var(--text-muted)',
                            }}>{r.label}</button>
                        ))}
                    </div>
                </div>

                {/* Stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                    {statCards.map(s => (
                        <div key={s.label} className="glass-card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}20`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                                <TrendingUp size={13} style={{ color: s.value > 0 ? '#22c55e' : 'var(--text-faint)' }} />
                            </div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: 3 }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Chart */}
                <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                    {/* Chart tabs */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                        <h2 style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><BarChart2 size={16} style={{ color: '#2563eb' }} /> Activity</h2>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {(['views', 'downloads', 'scans'] as const).map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                    padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                    background: activeTab === tab ? 'rgba(37,99,235,0.2)' : 'transparent',
                                    color: activeTab === tab ? '#93c5fd' : 'var(--text-muted)',
                                    textTransform: 'capitalize',
                                }}>{tab}</button>
                            ))}
                        </div>
                    </div>

                    {/* Bar chart */}
                    {chartData.length === 0 || totals.views + totals.downloads + totals.scans === 0 ? (
                        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
                            <BarChart2 size={32} style={{ color: 'var(--text-faint)' }} />
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No activity yet — share your PDFs to get data here.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 160, paddingBottom: 24, position: 'relative' }}>
                            {chartData.map((d, i) => {
                                const h = Math.round((d[activeTab] / maxVal) * 130);
                                return (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
                                        <div title={`${d[activeTab]} ${activeTab}`} style={{
                                            width: '100%', height: Math.max(h, 3), borderRadius: '4px 4px 0 0',
                                            background: h > 0 ? 'linear-gradient(180deg, #2563eb, #3b82f6)' : 'var(--border)',
                                            transition: 'height 0.4s ease',
                                            cursor: 'default',
                                        }} />
                                        <span style={{ fontSize: 10, color: 'var(--text-faint)', position: 'absolute', bottom: -18, whiteSpace: 'nowrap' }}>{d.day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Top PDFs table */}
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                        <h2 style={{ fontWeight: 700, fontSize: 16 }}>Top PDFs</h2>
                    </div>
                    {topPdfs.length === 0 ? (
                        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No PDFs yet. <a href="/upload" style={{ color: '#93c5fd' }}>Upload one →</a></p>
                        </div>
                    ) : (
                        <>
                            {/* Table header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: 12, padding: '10px 20px', background: 'rgba(37,99,235,0.05)', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                                <span>DOCUMENT</span><span style={{ textAlign: 'center' }}>VIEWS</span><span style={{ textAlign: 'center' }}>DOWNLOADS</span>
                            </div>
                            {topPdfs.map((pdf, i) => (
                                <div key={pdf.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: 12, padding: '14px 20px', borderTop: '1px solid var(--border)', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 11, fontWeight: 800, color: i === 0 ? '#f59e0b' : 'var(--text-faint)', width: 16 }}>#{i + 1}</span>
                                        <FileText size={15} style={{ color: '#93c5fd', flexShrink: 0 }} />
                                        <a href={`/p/${pdf.slug}`} target="_blank" rel="noreferrer" style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdf.title}</a>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                                        <Eye size={13} style={{ color: '#3b82f6' }} />
                                        <span style={{ fontWeight: 700, fontSize: 14 }}>{pdf.view_count}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                                        <Download size={13} style={{ color: '#10b981' }} />
                                        <span style={{ fontWeight: 700, fontSize: 14 }}>{pdf.download_count}</span>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
