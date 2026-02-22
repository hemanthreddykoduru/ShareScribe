'use client';
import { useState, useEffect } from 'react';
import { User, Lock, Bell, Trash2, Save, Eye, EyeOff, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { User as SupaUser } from '@supabase/supabase-js';

const TABS = [
    { id: 'profile', label: 'Profile', icon: <User size={15} /> },
    { id: 'security', label: 'Security', icon: <Lock size={15} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
    { id: 'danger', label: 'Danger Zone', icon: <Trash2 size={15} /> },
];

export default function SettingsPage() {
    const router = useRouter();
    const [tab, setTab] = useState('profile');
    const [user, setUser] = useState<SupaUser | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');

    const [profile, setProfile] = useState({ full_name: '', email: '' });
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [notifications, setNotifications] = useState({
        email_views: true, email_downloads: false, email_weekly: true,
    });

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user: u } }) => {
            if (!u) { router.push('/login'); return; }
            setUser(u);
            setProfile({
                full_name: u.user_metadata?.full_name ?? '',
                email: u.email ?? '',
            });
        });
    }, [router]);

    const saveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setError('');
        const { error: err } = await supabase.auth.updateUser({
            data: { full_name: profile.full_name },
        });
        setSaving(false);
        if (err) { setError(err.message); return; }
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const savePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (passwords.new !== passwords.confirm) { setError('Passwords do not match.'); return; }
        if (passwords.new.length < 8) { setError('Password must be at least 8 characters.'); return; }
        setSaving(true);
        const { error: err } = await supabase.auth.updateUser({ password: passwords.new });
        setSaving(false);
        if (err) { setError(err.message); return; }
        setPasswords({ current: '', new: '', confirm: '' });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const deleteAccount = async () => {
        if (!confirm('Are you absolutely sure? This will permanently delete your account and all your PDFs. This cannot be undone.')) return;
        await supabase.auth.signOut();
        router.push('/');
    };

    const inputStyle = { padding: '11px 14px', fontSize: 14 };
    const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#4a7ca5', marginBottom: 6, display: 'block' };

    if (!user) return (
        <div style={{ paddingTop: 88, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #dbeafe', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div style={{ paddingTop: 88, minHeight: '100vh' }}>
            <div className="page-wrap" style={{ maxWidth: 860, paddingBottom: 60 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>Settings</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 32 }}>Manage your account preferences.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>
                    {/* Sidebar tabs */}
                    <div className="glass-card" style={{ padding: 8 }}>
                        {TABS.map(t => (
                            <button key={t.id} onClick={() => { setTab(t.id); setError(''); setSaved(false); }} style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                                borderRadius: 9, border: 'none', cursor: 'pointer', textAlign: 'left',
                                background: tab === t.id ? '#dbeafe' : 'transparent',
                                color: tab === t.id ? '#2563eb' : 'var(--text-muted)',
                                fontWeight: tab === t.id ? 700 : 500, fontSize: 14, transition: 'all 0.15s',
                            }}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="glass-card" style={{ padding: 28 }}>
                        {/* ── Profile ── */}
                        {tab === 'profile' && (
                            <form onSubmit={saveProfile}>
                                <h2 style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Profile</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Update your public name and email.</p>

                                {/* Avatar */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, padding: '18px 20px', background: '#f0f6ff', borderRadius: 12, border: '1px solid #dbeafe' }}>
                                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                                        {profile.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : user.email?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: 15 }}>{profile.full_name || 'No name set'}</p>
                                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user.email}</p>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', background: '#dbeafe', padding: '2px 8px', borderRadius: 99, marginTop: 4, display: 'inline-block' }}>Free Plan</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                    <div>
                                        <label style={labelStyle}>Full Name</label>
                                        <input className="input-styled" value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} placeholder="Your full name" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Email Address</label>
                                        <input className="input-styled" value={profile.email} disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
                                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Email cannot be changed here. Contact support for help.</p>
                                    </div>
                                </div>

                                {error && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 16 }}>{error}</p>}
                                <button type="submit" disabled={saving} className="btn-primary" style={{ marginTop: 24, padding: '12px', borderRadius: 10, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, maxWidth: 180 }}>
                                    {saved ? <><Check size={15} /> Saved!</> : saving ? 'Saving…' : <><Save size={15} /> Save Changes</>}
                                </button>
                            </form>
                        )}

                        {/* ── Security ── */}
                        {tab === 'security' && (
                            <form onSubmit={savePassword}>
                                <h2 style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Security</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Update your password.</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                    {[
                                        { key: 'new', label: 'New Password' },
                                        { key: 'confirm', label: 'Confirm New Password' },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label style={labelStyle}>{f.label}</label>
                                            <div style={{ position: 'relative' }}>
                                                <input type={showPw ? 'text' : 'password'} className="input-styled" value={passwords[f.key as 'new' | 'confirm']} onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }} />
                                                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {error && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 16 }}>{error}</p>}
                                <button type="submit" disabled={saving || !passwords.new} className="btn-primary" style={{ marginTop: 24, padding: '12px', borderRadius: 10, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, maxWidth: 200, opacity: !passwords.new ? 0.5 : 1 }}>
                                    {saved ? <><Check size={15} /> Updated!</> : saving ? 'Updating…' : <><Lock size={15} /> Update Password</>}
                                </button>
                            </form>
                        )}

                        {/* ── Notifications ── */}
                        {tab === 'notifications' && (
                            <div>
                                <h2 style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Notifications</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Choose what emails you receive.</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {[
                                        { key: 'email_views', label: 'View notifications', desc: 'Email me when someone views my PDF' },
                                        { key: 'email_downloads', label: 'Download notifications', desc: 'Email me when someone downloads my PDF' },
                                        { key: 'email_weekly', label: 'Weekly digest', desc: 'A weekly summary of your PDF analytics' },
                                    ].map(n => (
                                        <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #dbeafe' }}>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{n.label}</p>
                                                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{n.desc}</p>
                                            </div>
                                            <button onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof prev] }))} style={{
                                                width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
                                                background: notifications[n.key as keyof typeof notifications] ? '#2563eb' : '#dbeafe',
                                                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                                            }}>
                                                <span style={{
                                                    position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: 'white',
                                                    transition: 'left 0.2s', left: notifications[n.key as keyof typeof notifications] ? 23 : 3,
                                                    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                                                }} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>Notification preferences are saved locally. Email sending requires additional setup.</p>
                            </div>
                        )}

                        {/* ── Danger Zone ── */}
                        {tab === 'danger' && (
                            <div>
                                <h2 style={{ fontWeight: 700, fontSize: 17, marginBottom: 4, color: '#ef4444' }}>Danger Zone</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Irreversible and destructive actions.</p>

                                <div style={{ border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 22, background: 'rgba(239,68,68,0.03)' }}>
                                    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Delete Account</p>
                                    <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 18 }}>
                                        Once you delete your account, all your PDFs, QR codes, and analytics data will be permanently removed. This action cannot be undone.
                                    </p>
                                    <button onClick={deleteAccount} style={{
                                        padding: '11px 22px', borderRadius: 9, border: '1px solid rgba(239,68,68,0.4)',
                                        background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer',
                                        fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
                                    }}>
                                        <Trash2 size={14} /> Delete My Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
