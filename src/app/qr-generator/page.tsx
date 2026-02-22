'use client';
import { useState, useRef } from 'react';
import { Download, Share2, Palette, Image as ImageIcon, Type, Save, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';

type QrType = 'pdf_url' | 'custom_url' | 'text' | 'vcard';

const QR_TYPES: { value: QrType; label: string; icon: string; placeholder: string }[] = [
    { value: 'pdf_url', label: 'PDF URL', icon: '📄', placeholder: 'https://sharescribe.app/p/your-pdf' },
    { value: 'custom_url', label: 'Custom URL', icon: '🔗', placeholder: 'https://your-website.com' },
    { value: 'text', label: 'Custom Text', icon: '✏️', placeholder: 'Enter any text to encode…' },
    { value: 'vcard', label: 'Contact Card', icon: '👤', placeholder: 'Name, Phone, Email…' },
];

const COLORS = ['#2563eb', '#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#000000'];

export default function QrGeneratorPage() {
    const [qrType, setQrType] = useState<QrType>('pdf_url');
    const [data, setData] = useState('');
    const [fgColor, setFgColor] = useState('#2563eb');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [logo, setLogo] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [size, setSize] = useState(200);
    const qrContainerRef = useRef<HTMLDivElement>(null);

    const currentType = QR_TYPES.find(t => t.value === qrType)!;
    const hasData = data.trim().length > 0;

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => setLogo(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const downloadQR = () => {
        const canvas = qrContainerRef.current?.querySelector('canvas') as HTMLCanvasElement;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'sharescribe-qr.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };


    return (
        <div style={{ paddingTop: 88, minHeight: '100vh' }}>
            <div className="page-wrap" style={{ paddingBottom: 60 }}>
                <div style={{ marginBottom: 36 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>QR Code Generator</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Create custom QR codes for PDFs, URLs, text, and contact cards.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
                    {/* Left: Config panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Type selector */}
                        <div className="glass-card" style={{ padding: 24 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>QR Type</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {QR_TYPES.map(t => (
                                    <button key={t.value} onClick={() => setQrType(t.value)} style={{
                                        padding: '14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                                        border: `1px solid ${qrType === t.value ? '#2563eb' : 'var(--border)'}`,
                                        background: qrType === t.value ? 'rgba(37,99,235,0.12)' : 'var(--bg-card)',
                                        color: qrType === t.value ? '#93c5fd' : 'var(--text-muted)',
                                        transition: 'all 0.15s',
                                    }}>
                                        <div style={{ fontSize: 18, marginBottom: 6 }}>{t.icon}</div>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{t.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Data input */}
                        <div className="glass-card" style={{ padding: 24 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Type size={15} /> Content
                            </h3>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>QR Code Name (optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., My Portfolio Link"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="input-styled"
                                    style={{ padding: '12px 16px', background: 'var(--bg)' }}
                                />
                            </div>

                            {qrType === 'vcard' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {['Full Name', 'Phone', 'Email', 'Company', 'Website'].map(field => (
                                        <div key={field}>
                                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>{field}</label>
                                            <input className="input-styled" placeholder={field} style={{ padding: '10px 14px', fontSize: 14 }} onChange={e => setData(e.target.value)} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    value={data}
                                    onChange={e => setData(e.target.value)}
                                    rows={4}
                                    className="input-styled"
                                    placeholder={currentType.placeholder}
                                    style={{ padding: '12px 16px', fontSize: 14, resize: 'vertical' }}
                                />
                            )}
                        </div>

                        {/* Customization */}
                        <div className="glass-card" style={{ padding: 24 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Palette size={15} /> Customization
                            </h3>

                            {/* Foreground */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, display: 'block' }}>QR Color</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {COLORS.map(c => (
                                        <button key={c} onClick={() => setFgColor(c)} style={{
                                            width: 32, height: 32, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                                            outline: fgColor === c ? `2px solid ${c}` : 'none', outlineOffset: 2, transition: 'all 0.15s',
                                        }} />
                                    ))}
                                    <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0 }} title="Custom color" />
                                </div>
                            </div>

                            {/* Background */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, display: 'block' }}>Background Color</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {['#ffffff', '#000000', '#f8faff'].map(c => (
                                        <button key={c} onClick={() => setBgColor(c)} style={{
                                            width: 32, height: 32, borderRadius: '50%', background: c,
                                            border: `1px solid var(--border)`, cursor: 'pointer',
                                            outline: bgColor === c ? '2px solid #2563eb' : 'none', outlineOffset: 2,
                                        }} />
                                    ))}
                                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0 }} />
                                </div>
                            </div>

                            {/* Logo upload */}
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ImageIcon size={13} /> Logo in center (optional — Pro)
                                </label>
                                {logo ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: 'var(--bg-card-hover)', borderRadius: 8, border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={logo} alt="Logo preview" style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'contain' }} />
                                            <span style={{ fontSize: 13, fontWeight: 600 }}>Custom Logo Attached</span>
                                        </div>
                                        <button onClick={() => setLogo(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Remove</button>
                                    </div>
                                ) : (
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: '1px dashed var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14 }}>
                                        <ImageIcon size={16} /> Click to upload logo image
                                        <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Preview panel */}
                    <div style={{ position: 'sticky', top: 88 }}>
                        <div className="glass-card" style={{ padding: 28, textAlign: 'center' }}>
                            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 24 }}>Preview</h3>

                            {/* Real QR Code */}
                            <div
                                ref={qrContainerRef}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    padding: 16, borderRadius: 14, background: bgColor,
                                    marginBottom: 24, minWidth: size + 32, minHeight: size + 32,
                                    border: '1px solid var(--border)',
                                    boxShadow: hasData ? `0 12px 40px ${fgColor}30` : 'none',
                                    transition: 'all 0.3s',
                                }}
                            >
                                {hasData ? (
                                    <QRCodeCanvas
                                        value={data.trim()}
                                        size={size}
                                        fgColor={fgColor}
                                        bgColor={bgColor}
                                        level="H"
                                        imageSettings={logo ? { src: logo, excavate: true, height: 48, width: 48 } : undefined}
                                        includeMargin={false}
                                    />
                                ) : (
                                    <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 14 }}>
                                        Enter data to preview
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                                <button onClick={downloadQR} disabled={!hasData} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: hasData ? 'pointer' : 'not-allowed', opacity: hasData ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <Download size={16} /> Download
                                </button>
                                <button onClick={async () => {
                                    if (!hasData) return;
                                    setSaving(true);
                                    const { data: { user } } = await supabase.auth.getUser();
                                    if (!user) { window.location.href = '/login?redirect=/qr-generator'; return; }

                                    await supabase.from('qr_codes').insert({
                                        user_id: user.id,
                                        type: qrType,
                                        data: data,
                                        config: { fgColor, bgColor, size, hasLogo: !!logo, name }
                                    });
                                    setSaving(false);
                                    setSaved(true);
                                    setTimeout(() => setSaved(false), 3000);
                                }} disabled={!hasData || saving} style={{ flex: 1, padding: '12px', background: saved ? '#10b981' : 'var(--bg)', color: saved ? 'white' : 'var(--text)', border: saved ? 'none' : '1px solid var(--border)', borderRadius: 10, cursor: hasData ? 'pointer' : 'not-allowed', opacity: hasData ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                                    {saved ? <><Check size={16} /> Saved!</> : saving ? <><div style={{ width: 16, height: 16, border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={16} /> Save</>}
                                </button>
                                <button onClick={() => {
                                    const canvas = qrContainerRef.current?.querySelector('canvas');
                                    if (canvas) {
                                        canvas.toBlob(blob => {
                                            if (blob) navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                                        });
                                    }
                                }} disabled={!hasData} title="Copy Image" style={{ padding: '12px', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 10, cursor: hasData ? 'pointer' : 'not-allowed', opacity: hasData ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Share2 size={16} />
                                </button>
                            </div>

                            {/* Size slider */}
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Size</label>
                                    <span style={{ fontSize: 12, color: '#93c5fd' }}>{size}px</span>
                                </div>
                                <input type="range" min={120} max={320} value={size} onChange={e => setSize(Number(e.target.value))} style={{ width: '100%', accentColor: '#2563eb' }} />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <style>{`@media(max-width:768px){.qr-grid{grid-template-columns:1fr!important;}}`}</style>
        </div>
    );
}
