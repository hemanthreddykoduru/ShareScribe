'use client';
import { useState, useCallback, useRef } from 'react';
import { Upload, X, CheckCircle, Tag, Lock, Calendar, Globe, FileText, Copy, ExternalLink } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';



export default function UploadPage() {
    const qrRef = useRef<HTMLCanvasElement | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [drag, setDrag] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [shareUrl, setShareUrl] = useState('');
    const [uploadError, setUploadError] = useState('');


    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f?.type === 'application/pdf') setFile(f);
    }, []);

    const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f?.type === 'application/pdf') setFile(f);
    };

    const [done, setDone] = useState(false);
    const [copied, setCopied] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', tags: '', visibility: 'public', password: '', expiry: '',
    });

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setUploading(true);
        setUploadError('');
        setProgress(10);

        const fd = new FormData();
        fd.append('file', file);
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('tags', form.tags);
        fd.append('visibility', form.visibility);
        if (form.password) fd.append('password', form.password);
        if (form.expiry) fd.append('expiry', form.expiry);

        setProgress(40);
        const res = await fetch('/api/pdfs', { method: 'POST', body: fd });
        setProgress(80);
        const json = await res.json();

        if (!res.ok) {
            setUploadError(json.error || 'Upload failed. Please try again.');
            setUploading(false);
            setProgress(0);
            return;
        }

        setShareUrl(json.shareUrl);
        setProgress(100);
        setUploading(false);
        setDone(true);
    };


    const copyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadQR = () => {
        // qrcode.react renders into a canvas — grab it and trigger download
        const canvas = document.querySelector('#qr-canvas canvas') as HTMLCanvasElement;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'sharescribe-qr.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };


    if (done) {
        return (
            <div style={{ paddingTop: 88, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '88px 20px 40px' }}>
                <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }} className="animate-fade-in">
                    <div style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={36} style={{ color: '#22c55e' }} />
                    </div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>PDF uploaded successfully!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Your shareable link and QR code are ready.</p>

                    <div className="glass-card" style={{ padding: 28, marginBottom: 16 }}>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textAlign: 'left' }}>SHAREABLE LINK</p>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <input readOnly value={shareUrl} className="input-styled" style={{ padding: '10px 14px', fontSize: 13, flex: 1 }} />
                            <button onClick={copyLink} style={{
                                padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border)',
                                background: 'var(--bg-card)', color: 'var(--text)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
                                flexShrink: 0, whiteSpace: 'nowrap',
                            }}>
                                <Copy size={14} /> {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    <div className="glass-card animate-pulse-glow" style={{ padding: 32, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <div id="qr-canvas" style={{ padding: 16, borderRadius: 14, background: 'white', marginBottom: 16, display: 'inline-block' }}>
                            <QRCodeCanvas
                                ref={qrRef}
                                value={shareUrl}
                                size={180}
                                fgColor="#1a1a2e"
                                bgColor="#ffffff"
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Scan to open your PDF</p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={downloadQR} className="btn-primary" style={{ padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Download PNG</button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href={shareUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text)', textDecoration: 'none', fontSize: 14 }}>
                            <ExternalLink size={14} /> View PDF page
                        </a>
                        <button onClick={() => { setDone(false); setFile(null); setProgress(0); setShareUrl(''); setUploadError(''); setForm({ title: '', description: '', tags: '', visibility: 'public', password: '', expiry: '' }); }} className="btn-primary" style={{ padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                            Upload another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: 88, minHeight: '100vh' }}>
            <div className="page-wrap" style={{ maxWidth: 720, paddingBottom: 60 }}>
                <div style={{ marginBottom: 36 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Upload PDF</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Upload your document and get a shareable link with QR code.</p>
                </div>

                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Drop zone */}
                    <div
                        onDragOver={e => { e.preventDefault(); setDrag(true); }}
                        onDragLeave={() => setDrag(false)}
                        onDrop={onDrop}
                        style={{
                            border: `2px dashed ${drag ? '#2563eb' : file ? 'rgba(34,197,94,0.5)' : 'var(--border)'}`,
                            borderRadius: 14, padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
                            background: drag ? 'rgba(37,99,235,0.06)' : file ? 'rgba(34,197,94,0.04)' : 'var(--bg-card)',
                            transition: 'all 0.2s', position: 'relative',
                        }}
                        onClick={() => !file && document.getElementById('fileInput')?.click()}
                    >
                        <input id="fileInput" type="file" accept=".pdf" hidden onChange={onFileInput} />
                        {file ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center' }}>
                                <div style={{ width: 48, height: 56, borderRadius: 8, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileText size={24} style={{ color: '#4ade80' }} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{file.name}</p>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }} style={{ marginLeft: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px', background: 'rgba(37,99,235,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Upload size={24} style={{ color: '#93c5fd' }} />
                                </div>
                                <p style={{ fontWeight: 600, marginBottom: 6 }}>Drop your PDF here or <span style={{ color: '#93c5fd' }}>browse</span></p>
                                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Only PDF files. Max 50 MB.</p>
                            </>
                        )}
                    </div>

                    {/* Form fields */}
                    <div className="glass-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Title *</label>
                            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-styled" placeholder="e.g. Q4 Financial Report 2025" style={{ padding: '12px 16px', fontSize: 15 }} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Description</label>
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-styled" placeholder="Brief description of this document…" rows={3} style={{ padding: '12px 16px', fontSize: 14, resize: 'vertical' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Tag size={13} /> Tags</label>
                            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="input-styled" placeholder="finance, report, 2025 (comma separated)" style={{ padding: '12px 16px', fontSize: 14 }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Globe size={13} /> Visibility</label>
                                <select value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value })} className="input-styled" style={{ padding: '12px 16px', fontSize: 14 }}>
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={13} /> Expiry Date</label>
                                <input type="date" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} className="input-styled" style={{ padding: '12px 16px', fontSize: 14 }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Lock size={13} /> Password Protection (optional)</label>
                            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-styled" placeholder="Leave blank for no password" style={{ padding: '12px 16px', fontSize: 14 }} />
                        </div>
                    </div>

                    {/* Upload progress */}
                    {uploading && (
                        <div className="glass-card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>Uploading…</span>
                                <span style={{ fontSize: 14, color: '#93c5fd', fontWeight: 600 }}>{progress}%</span>
                            </div>
                            <div style={{ height: 6, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${progress}%`, borderRadius: 99, background: 'linear-gradient(90deg, #2563eb, #3b82f6)', transition: 'width 0.15s ease' }} />
                            </div>
                        </div>
                    )}

                    {uploadError && (
                        <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13 }}>
                            {uploadError}
                        </div>
                    )}

                    <button type="submit" disabled={!file || uploading} className="btn-primary" style={{
                        padding: '15px', fontSize: 16, borderRadius: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        opacity: !file || uploading ? 0.5 : 1, cursor: !file || uploading ? 'not-allowed' : 'pointer',
                    }}>
                        {uploading ? 'Uploading…' : <><Upload size={18} /> Upload & Generate QR</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
