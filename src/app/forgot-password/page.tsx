'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            setSent(true);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 40px' }}>
            <div style={{ width: '100%', maxWidth: 420 }} className="animate-fade-in">
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 32 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={20} color="white" />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: 22 }} className="gradient-text">ShareScribe</span>
                    </Link>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mail size={28} style={{ color: '#93c5fd' }} />
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Reset your password</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>We&apos;ll send a reset link to your email</p>
                </div>

                <div className="glass-card" style={{ padding: 32 }}>
                    {!sent ? (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {error && (
                                <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13 }}>
                                    {error}
                                </div>
                            )}
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Email address</label>
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-styled" placeholder="you@example.com" style={{ padding: '12px 16px', fontSize: 15 }} />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '14px', fontSize: 15, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
                                {loading ? (
                                    <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Sending…</>
                                ) : (
                                    <>Send reset link <ArrowRight size={16} /></>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <CheckCircle size={48} style={{ color: '#22c55e', margin: '0 auto 16px' }} />
                            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Reset link sent!</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Check your inbox at <strong>{email}</strong> for the reset link.</p>
                        </div>
                    )}
                </div>

                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 14 }}>
                    Remember it?{' '}<Link href="/login" style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                </p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
