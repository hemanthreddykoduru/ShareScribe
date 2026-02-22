'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Download, Copy, QrCode, Share2, Eye, Calendar, FileText, Check, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';

type Pdf = {
    id: string;
    title: string;
    description: string | null;
    tags: string[];
    slug: string;
    file_url: string;
    visibility: 'public' | 'private';
    password_hash: string | null;
    view_count: number;
    download_count: number;
    size_bytes: number;
    created_at: string;
};

function formatBytes(bytes: number) {
    if (!bytes) return '—';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function PublicPdfPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [pdf, setPdf] = useState<Pdf | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [unlocked, setUnlocked] = useState(false);

    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

    useEffect(() => {
        if (!slug) return;
        const load = async () => {
            const { data, error } = await supabase
                .from('pdfs')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error || !data) { setNotFound(true); setLoading(false); return; }
            setPdf(data);
            setLoading(false);

            // Track view
            await fetch(`/api/pdfs/${data.id}/view`, { method: 'POST' });
        };
        load();
    }, [slug]);

    const copyLink = () => {
        navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple check — in production use bcrypt on server side
        if (passwordInput === pdf?.password_hash) {
            setUnlocked(true);
            setPasswordError('');
        } else {
            setPasswordError('Incorrect password. Please try again.');
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #dbeafe', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    if (notFound) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', flexDirection: 'column', gap: 16 }}>
            <FileText size={48} style={{ color: '#93c5fd' }} />
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>PDF not found</h1>
            <p style={{ color: 'var(--text-muted)' }}>This link may have expired or been removed.</p>
            <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>← Back to ShareScribe</Link>
        </div>
    );

    if (!pdf) return null;

    // Password gate
    if (pdf.password_hash && !unlocked) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '20px' }}>
            <div className="glass-card" style={{ maxWidth: 400, width: '100%', padding: 36, textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Lock size={28} style={{ color: '#2563eb' }} />
                </div>
                <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Password protected</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>Enter the password to view <strong>{pdf.title}</strong></p>
                <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="input-styled" placeholder="Enter password" style={{ padding: '12px 16px' }} />
                    {passwordError && <p style={{ color: '#ef4444', fontSize: 13 }}>{passwordError}</p>}
                    <button type="submit" className="btn-primary" style={{ padding: '12px', borderRadius: 10, fontSize: 15 }}>Unlock</button>
                </form>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', maxWidth: 1100, margin: '0 auto', padding: '0 20px 40px', gap: 20, alignItems: 'start' }}>
                {/* PDF Viewer */}
                <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #dbeafe', background: '#f8faff', boxShadow: '0 4px 20px rgba(37,99,235,0.08)' }}>
                    <iframe
                        src={`${pdf.file_url}#toolbar=0`}
                        style={{ width: '100%', height: 'calc(100vh - 120px)', border: 'none', display: 'block' }}
                        title={pdf.title}
                    />
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Info card */}
                    <div className="glass-card" style={{ padding: 22 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10, lineHeight: 1.3, color: '#0f172a' }}>{pdf.title}</h1>
                        {pdf.description && <p style={{ fontSize: 14, color: '#4a7ca5', lineHeight: 1.6, marginBottom: 14 }}>{pdf.description}</p>}

                        {/* Tags */}
                        {pdf.tags?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                                {pdf.tags.map(tag => (
                                    <span key={tag} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, background: '#dbeafe', color: '#2563eb', fontWeight: 600 }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Stats row */}
                        <div style={{ display: 'flex', gap: 20, padding: '14px 0', borderTop: '1px solid #dbeafe', borderBottom: '1px solid #dbeafe', marginBottom: 14 }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{pdf.view_count}</div>
                                <div style={{ fontSize: 11, color: '#4a7ca5', display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={10} /> Views</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{pdf.download_count}</div>
                                <div style={{ fontSize: 11, color: '#4a7ca5', display: 'flex', alignItems: 'center', gap: 3 }}><Download size={10} /> Downloads</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{formatBytes(pdf.size_bytes)}</div>
                                <div style={{ fontSize: 11, color: '#4a7ca5' }}>Size</div>
                            </div>
                        </div>

                        <div style={{ fontSize: 12, color: '#93c5fd', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Calendar size={11} />
                            {new Date(pdf.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="glass-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <a href={pdf.file_url} download target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 10, background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(37,99,235,0.25)' }}>
                            <Download size={15} /> Download PDF
                        </a>

                        <button onClick={copyLink} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 10, border: '1px solid #dbeafe', background: 'white', color: '#0f172a', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                            {copied ? <><Check size={15} style={{ color: '#22c55e' }} /> Copied!</> : <><Copy size={15} /> Copy Link</>}
                        </button>

                        <button onClick={() => setShowQr(!showQr)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 10, border: '1px solid #dbeafe', background: showQr ? '#dbeafe' : 'white', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                            <QrCode size={15} /> {showQr ? 'Hide QR Code' : 'Show QR Code'}
                        </button>

                        {showQr && (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0', borderTop: '1px solid #dbeafe' }}>
                                <div style={{ padding: 14, borderRadius: 12, background: 'white', border: '1px solid #dbeafe', display: 'inline-block' }}>
                                    <QRCodeCanvas value={pageUrl} size={160} fgColor="#1d4ed8" bgColor="#ffffff" level="H" />
                                </div>
                            </div>
                        )}

                        <button onClick={async () => { try { await navigator.share({ title: pdf.title, url: pageUrl }); } catch { copyLink(); } }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 10, border: '1px solid #dbeafe', background: 'white', color: '#4a7ca5', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                            <Share2 size={15} /> Share
                        </button>
                    </div>

                    {/* Powered by */}
                    <div style={{ textAlign: 'center', paddingTop: 4 }}>
                        <Link href="/" style={{ fontSize: 13, color: '#93c5fd', textDecoration: 'none' }}>
                            Powered by <strong style={{ color: '#2563eb' }}>ShareScribe</strong>
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
        @media(max-width:768px){
          div[style*="grid-template-columns"]{grid-template-columns:1fr!important;}
        }
      `}</style>
        </div>
    );
}
