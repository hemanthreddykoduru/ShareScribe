'use client';
import { useState, useEffect } from 'react';
import { Search, Grid, List, QrCode, Copy, Trash2, Eye, FileText, Plus, Clock, Check } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Pdf = {
    id: string;
    title: string;
    slug: string;
    visibility: 'public' | 'private';
    view_count: number;
    download_count: number;
    size_bytes: number;
    created_at: string;
    tags: string[];
};

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m ago`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

function formatBytes(bytes: number) {
    if (!bytes) return '—';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function MyPdfsPage() {
    const [pdfs, setPdfs] = useState<Pdf[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'grid' | 'list'>('list');
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const load = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data } = await supabase
            .from('pdfs')
            .select('id, title, slug, visibility, view_count, download_count, size_bytes, created_at, tags')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        setPdfs(data ?? []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const filtered = pdfs.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

    const copyLink = (pdf: Pdf) => {
        navigator.clipboard.writeText(`${appUrl}/p/${pdf.slug}`);
        setCopiedId(pdf.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const deletePdf = async (id: string) => {
        if (!confirm('Delete this PDF? This cannot be undone.')) return;
        setDeletingId(id);
        await fetch(`/api/pdfs/${id}`, { method: 'DELETE' });
        setPdfs(prev => prev.filter(p => p.id !== id));
        setDeletingId(null);
    };

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
                        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>My PDFs</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>{pdfs.length} document{pdfs.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Link href="/upload" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                        <Plus size={15} /> Upload PDF
                    </Link>
                </div>

                {/* Toolbar */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                        <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} className="input-styled" placeholder="Search PDFs…" style={{ padding: '10px 14px 10px 40px', fontSize: 14, width: '100%' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg-card)', borderRadius: 9, border: '1px solid var(--border)' }}>
                        {(['list', 'grid'] as const).map(v => (
                            <button key={v} onClick={() => setView(v)} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', background: view === v ? 'rgba(37,99,235,0.2)' : 'transparent', color: view === v ? '#93c5fd' : 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
                                {v === 'list' ? <List size={15} /> : <Grid size={15} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Empty state */}
                {filtered.length === 0 && (
                    <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
                        <FileText size={44} style={{ color: 'var(--text-faint)', margin: '0 auto 16px' }} />
                        <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                            {search ? `No PDFs matching "${search}"` : "No PDFs yet"}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                            {search ? 'Try a different search term.' : 'Upload your first PDF to get a shareable link and QR code.'}
                        </p>
                        {!search && (
                            <Link href="/upload" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '11px 24px', borderRadius: 9, background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                                <Plus size={14} /> Upload your first PDF
                            </Link>
                        )}
                    </div>
                )}

                {/* List view */}
                {filtered.length > 0 && view === 'list' && (
                    <div className="glass-card" style={{ overflow: 'hidden' }}>
                        {filtered.map((pdf, i) => (
                            <div key={pdf.id} style={{
                                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                                transition: 'background 0.15s', opacity: deletingId === pdf.id ? 0.4 : 1,
                            }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <div style={{ width: 40, height: 46, borderRadius: 8, background: 'rgba(37,99,235,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FileText size={18} style={{ color: '#93c5fd' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdf.title}</p>
                                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={10} /> {pdf.view_count} views</span>
                                        <span>{formatBytes(pdf.size_bytes)}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} /> {timeAgo(pdf.created_at)}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: pdf.visibility === 'public' ? 'rgba(34,197,94,0.1)' : 'rgba(37,99,235,0.1)', color: pdf.visibility === 'public' ? '#4ade80' : '#93c5fd' }}>
                                        {pdf.visibility === 'public' ? 'Public' : 'Private'}
                                    </span>
                                    <button onClick={() => copyLink(pdf)} title="Copy link" style={{ padding: '7px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: copiedId === pdf.id ? '#4ade80' : 'var(--text-muted)', cursor: 'pointer' }}>
                                        {copiedId === pdf.id ? <Check size={14} /> : <Copy size={14} />}
                                    </button>
                                    <Link href={`/p/${pdf.slug}`} target="_blank" title="View" style={{ padding: '7px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', display: 'flex' }}>
                                        <Eye size={14} />
                                    </Link>
                                    <Link href={`/qr-generator?url=${appUrl}/p/${pdf.slug}`} title="Generate QR" style={{ padding: '7px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', display: 'flex' }}>
                                        <QrCode size={14} />
                                    </Link>
                                    <button onClick={() => deletePdf(pdf.id)} title="Delete" style={{ padding: '7px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', color: '#f87171', cursor: 'pointer' }} disabled={deletingId === pdf.id}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Grid view */}
                {filtered.length > 0 && view === 'grid' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                        {filtered.map(pdf => (
                            <div key={pdf.id} className="glass-card" style={{ padding: 20, opacity: deletingId === pdf.id ? 0.4 : 1 }}>
                                <div style={{ width: '100%', height: 100, borderRadius: 10, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                                    <FileText size={36} style={{ color: '#93c5fd' }} />
                                </div>
                                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdf.title}</p>
                                <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                                    <span><Eye size={10} style={{ display: 'inline' }} /> {pdf.view_count}</span>
                                    <span>{formatBytes(pdf.size_bytes)}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: pdf.visibility === 'public' ? '#4ade80' : '#93c5fd' }}>{pdf.visibility}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => copyLink(pdf)} style={{ flex: 1, padding: '8px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: copiedId === pdf.id ? '#4ade80' : 'var(--text-muted)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                        {copiedId === pdf.id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                                    </button>
                                    <button onClick={() => deletePdf(pdf.id)} style={{ padding: '8px 10px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', color: '#f87171', cursor: 'pointer' }} disabled={deletingId === pdf.id}>
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
