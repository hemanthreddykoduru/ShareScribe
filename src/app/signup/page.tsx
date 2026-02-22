'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, FileText, ArrowRight, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';


export default function SignupPage() {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    const strength = (() => {
        const p = form.password;
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    })();
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
    const strengthColor = ['', '#ef4444', '#f59e0b', '#22c55e', '#2563eb'][strength];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        setLoading(true);
        setError('');

        const { error: authError } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: { full_name: form.name },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
                <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }} className="animate-fade-in">
                    <div style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={36} style={{ color: '#22c55e' }} />
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Check your email!</h2>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                        We sent a confirmation link to <strong>{form.email}</strong>.<br />
                        Click The link to activate your account and get started.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 40px' }}>
            <div style={{ width: '100%', maxWidth: 460 }} className="animate-fade-in">
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 32 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}>
                            <FileText size={20} color="white" />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: 22 }} className="gradient-text">ShareScribe</span>
                    </Link>
                    <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Create your account</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Start hosting PDFs in seconds</p>
                </div>

                <div className="glass-card" style={{ padding: 32 }}>
                    {error && (
                        <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, marginBottom: 20 }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Full name</label>
                            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-styled" placeholder="Jane Smith" style={{ padding: '12px 16px', fontSize: 15 }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Email address</label>
                            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-styled" placeholder="you@example.com" style={{ padding: '12px 16px', fontSize: 15 }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input type={show ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-styled" placeholder="Min. 8 characters" style={{ padding: '12px 48px 12px 16px', fontSize: 15 }} />
                                <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {form.password && (
                                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ flex: 1, height: 3, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', borderRadius: 99, transition: 'all 0.3s', width: `${(strength / 4) * 100}%`, background: strengthColor }} />
                                    </div>
                                    <span style={{ fontSize: 12, color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>
                                </div>
                            )}
                        </div>

                        {/* Plan selector */}
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-muted)' }}>Plan</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {[
                                    { plan: 'free', label: 'Free', price: '$0/mo', items: ['5 PDFs', 'Basic QR', 'Limited analytics'] },
                                    { plan: 'pro', label: 'Pro', price: '$9/mo', items: ['Unlimited PDFs', 'Custom QR', 'Advanced analytics'] },
                                ].map(({ plan, label, price, items }) => (
                                    <div key={plan} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14, background: 'var(--bg-card)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>
                                            <span style={{ fontSize: 13, color: '#93c5fd', fontWeight: 600 }}>{price}</span>
                                        </div>
                                        {items.map(item => (
                                            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                                                <Check size={10} style={{ color: '#22c55e' }} /> {item}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '14px', fontSize: 15, borderRadius: 10, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
                            {loading ? (
                                <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Creating account…</>
                            ) : (
                                <>Create free account <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 14 }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                </p>
                <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--text-faint)' }}>
                    By signing up, you agree to our{' '}
                    <Link href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</Link> and{' '}
                    <Link href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</Link>.
                </p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
