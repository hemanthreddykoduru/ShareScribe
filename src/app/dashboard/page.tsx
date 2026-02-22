'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, QrCode, Eye, HardDrive, Upload, BarChart2, Plus, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type Pdf = {
    id: string;
    title: string;
    slug: string;
    visibility: 'public' | 'private';
    view_count: number;
    created_at: string;
    size_bytes: number;
};

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 60) return `${min}m ago`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

function formatBytes(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [pdfs, setPdfs] = useState<Pdf[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalPdfs: 0, totalViews: 0, storageUsed: 0 });

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const emoji = hour < 12 ? '☀️' : hour < 17 ? '👋' : '🌙';

    useEffect(() => {
        const load = async () => {
            const { data: { user: u } } = await supabase.auth.getUser();
            setUser(u);
            if (!u) { setLoading(false); return; }

            const { data: pdfData } = await supabase
                .from('pdfs')
                .select('id, title, slug, visibility, view_count, created_at, size_bytes')
                .eq('user_id', u.id)
                .order('created_at', { ascending: false })
                .limit(10);

            const list = pdfData ?? [];
            setPdfs(list);
            setStats({
                totalPdfs: list.length,
                totalViews: list.reduce((sum, p) => sum + (p.view_count || 0), 0),
                storageUsed: list.reduce((sum, p) => sum + (p.size_bytes || 0), 0),
            });
            setLoading(false);
        };
        load();
    }, []);

    const storageMB = (stats.storageUsed / 1024 / 1024).toFixed(1);
    const storagePct = Math.min((stats.storageUsed / 1024 / 1024 / 100) * 100, 100);

    const statCards = [
        { icon: <FileText size={18} />, label: 'Total PDFs', value: stats.totalPdfs, color: '#2563eb', sub: `${Math.max(0, pdfs.filter(p => { const d = Date.now() - new Date(p.created_at).getTime(); return d < 7 * 24 * 3600000; }).length)} this week` },
        { icon: <QrCode size={18} />, label: 'QR Codes', value: stats.totalPdfs, color: '#3b82f6', sub: 'One per PDF' },
        { icon: <Eye size={18} />, label: 'Total Views', value: stats.totalViews, color: '#3b82f6', sub: 'All time' },
        { icon: <HardDrive size={18} />, label: 'Storage Used', value: `${storageMB} MB`, color: '#ec4899', sub: 'of 100 MB free' },
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
                            {greeting}, {user?.user_metadata?.full_name?.split(' ')[0] ?? 'there'}! {emoji}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
                            {stats.totalPdfs === 0 ? 'Upload your first PDF to get started.' : `Here's what's happening with your documents.`}
                        </p>
                    </div>
                    <Link href="/upload" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 11, background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 20px rgba(37,99,235,0.3)' }}>
                        <Plus size={16} /> Upload New PDF
                    </Link>
                </div>

                {/* Stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                    {statCards.map(s => (
                        <div key={s.label} className="glass-card" style={{ padding: 22 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${s.color}20`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                                <TrendingUp size={14} style={{ color: '#22c55e' }} />
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: 4 }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 2 }}>{s.label}</div>
                            <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>{s.sub}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
                    {/* Recent PDFs */}
                    <div className="glass-card" style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontWeight: 700, fontSize: 16 }}>Recent PDFs</h2>
                            <Link href="/my-pdfs" style={{ fontSize: 13, color: '#93c5fd', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
                        </div>

                        {pdfs.length === 0 ? (
                            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                                <FileText size={40} style={{ color: 'var(--text-faint)', margin: '0 auto 16px' }} />
                                <p style={{ fontWeight: 600, marginBottom: 8 }}>No PDFs yet</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Upload your first PDF to get a shareable link and QR code.</p>
                                <Link href="/upload" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 9, background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                                    <Upload size={14} /> Upload your first PDF
                                </Link>
                            </div>
                        ) : (
                            pdfs.slice(0, 8).map(pdf => (
                                <div key={pdf.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <div style={{ width: 38, height: 44, borderRadius: 8, background: 'rgba(37,99,235,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <FileText size={18} style={{ color: '#93c5fd' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdf.title}</p>
                                        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={10} /> {pdf.view_count}</span>
                                            <span>{formatBytes(pdf.size_bytes)}</span>
                                            <span>{timeAgo(pdf.created_at)}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: pdf.visibility === 'public' ? 'rgba(34,197,94,0.1)' : 'rgba(37,99,235,0.1)', color: pdf.visibility === 'public' ? '#4ade80' : '#93c5fd' }}>
                                            {pdf.visibility === 'public' ? 'Public' : 'Private'}
                                        </span>
                                        <Link href={`/p/${pdf.slug}`} target="_blank" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'none' }}>View →</Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Quick actions */}
                        <div className="glass-card" style={{ padding: 20 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Quick Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { href: '/upload', label: 'Upload PDF', icon: <Upload size={14} />, color: '#2563eb' },
                                    { href: '/qr-generator', label: 'Generate QR', icon: <QrCode size={14} />, color: '#3b82f6' },
                                    { href: '/analytics', label: 'View Analytics', icon: <BarChart2 size={14} />, color: '#3b82f6' },
                                ].map(a => (
                                    <Link key={a.href} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 9, background: `${a.color}15`, color: a.color, textDecoration: 'none', fontWeight: 700, fontSize: 13, transition: 'background 0.15s' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = `${a.color}25`)}
                                        onMouseLeave={e => (e.currentTarget.style.background = `${a.color}15`)}
                                    >
                                        {a.icon} {a.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Storage */}
                        <div className="glass-card" style={{ padding: 20 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Storage</h3>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>{storageMB} MB of 100 MB used</p>
                            <div style={{ height: 6, borderRadius: 99, background: 'var(--border)', overflow: 'hidden', marginBottom: 14 }}>
                                <div style={{ height: '100%', width: `${storagePct}%`, background: storagePct > 80 ? '#f59e0b' : 'linear-gradient(90deg, #2563eb, #3b82f6)', borderRadius: 99, transition: 'width 0.8s ease' }} />
                            </div>
                            {storagePct > 80 && <p style={{ fontSize: 12, color: '#f59e0b', marginBottom: 12 }}>⚠️ Storage almost full</p>}
                            <Link href="/pricing" style={{ display: 'block', textAlign: 'center', padding: '10px', borderRadius: 9, background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
                                Upgrade to Pro ↗
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:768px){.dash-grid{grid-template-columns:1fr!important;}}`}</style>
        </div>
    );
}
