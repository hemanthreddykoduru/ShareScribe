'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, FileText, ArrowRight, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/dashboard';

    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ email: '', password: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error: authError } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            router.push(redirect);
            router.refresh();
        }
    };

    const handleGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback?next=${redirect}` },
        });
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 40px' }}>
            <div style={{ width: '100%', maxWidth: 440 }} className="animate-fade-in">
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 32 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}>
                            <FileText size={20} color="white" />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: 22 }} className="gradient-text">ShareScribe</span>
                    </Link>
                    <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Welcome back</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Sign in to access your dashboard</p>
                </div>

                <div className="glass-card" style={{ padding: 32 }}>
                    {error && (
                        <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, marginBottom: 20 }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Email address</label>
                            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-styled" placeholder="you@example.com" style={{ padding: '12px 16px', fontSize: 15 }} />
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Password</label>
                                <Link href="/forgot-password" style={{ fontSize: 13, color: '#93c5fd', textDecoration: 'none' }}>Forgot password?</Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input type={show ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-styled" placeholder="••••••••" style={{ padding: '12px 48px 12px 16px', fontSize: 15 }} />
                                <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '14px', fontSize: 15, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
                            {loading ? (
                                <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Signing in…</>
                            ) : (
                                <>Sign in <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>or continue with</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>

                    <button onClick={handleGoogle} style={{ width: '100%', padding: '12px', borderRadius: 10, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 14 }}>
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 600 }}>
                        Sign up free <Zap size={12} style={{ display: 'inline' }} />
                    </Link>
                </p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 32, height: 32, border: '3px solid rgba(37,99,235,0.3)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
