'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FileText, Sun, Moon, Menu, X, LayoutDashboard, Upload, FolderOpen, QrCode, BarChart2, Settings, LogOut, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

const NAV_LINKS = [
    { href: '/#features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/qr-generator', label: 'QR Generator' },
];

const USER_MENU = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
    { href: '/upload', label: 'Upload PDF', icon: <Upload size={14} /> },
    { href: '/my-pdfs', label: 'My PDFs', icon: <FolderOpen size={14} /> },
    { href: '/qr-generator', label: 'QR Generator', icon: <QrCode size={14} /> },
    { href: '/analytics', label: 'Analytics', icon: <BarChart2 size={14} /> },
    { href: '/settings', label: 'Settings', icon: <Settings size={14} /> },
];

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [dark, setDark] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get auth state
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);

    // Scroll shadow
    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    }, [dark]);

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') setDark(true);
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setDropdownOpen(false);
        router.push('/');
        router.refresh();
    };

    const initials = user?.user_metadata?.full_name
        ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.slice(0, 2).toUpperCase() ?? '?';

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            background: scrolled ? 'rgba(255,255,255,0.9)' : 'transparent',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            borderBottom: scrolled ? '1px solid #dbeafe' : 'none',
            transition: 'all 0.3s',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Logo */}
                <Link href={user ? '/dashboard' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.35)' }}>
                        <FileText size={17} color="white" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 18, color: '#1d4ed8' }}>ShareScribe</span>
                </Link>

                {/* Desktop nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
                    {(!user || pathname === '/') && NAV_LINKS.map(l => (
                        <Link key={l.href} href={l.href} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#93c5fd')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >{l.label}</Link>
                    ))}
                    {user && pathname !== '/' && USER_MENU.slice(0, 4).map(l => (
                        <Link key={l.href} href={l.href} style={{
                            color: pathname === l.href ? '#93c5fd' : 'var(--text-muted)',
                            textDecoration: 'none', fontSize: 14, fontWeight: pathname === l.href ? 600 : 400,
                            display: 'flex', alignItems: 'center', gap: 5,
                        }}>{l.label}</Link>
                    ))}
                </div>

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Theme toggle */}
                    <button onClick={() => setDark(!dark)} style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {dark ? <Sun size={15} /> : <Moon size={15} />}
                    </button>

                    {user ? (
                        /* User avatar dropdown */
                        <div ref={dropdownRef} style={{ position: 'relative' }}>
                            <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{
                                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 6px',
                                borderRadius: 99, border: '1px solid var(--border)', background: 'var(--bg-card)',
                                cursor: 'pointer', transition: 'all 0.15s',
                            }}>
                                {/* Avatar circle */}
                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>
                                    {initials}
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user.user_metadata?.full_name?.split(' ')[0] ?? user.email?.split('@')[0]}
                                </span>
                                <ChevronDown size={13} style={{ color: 'var(--text-muted)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>

                            {/* Dropdown menu */}
                            {dropdownOpen && (
                                <div style={{
                                    position: 'absolute', right: 0, top: 'calc(100% + 10px)', minWidth: 230,
                                    background: '#ffffff',
                                    border: '1px solid #dbeafe',
                                    borderRadius: 14, padding: 8, zIndex: 9999,
                                    boxShadow: '0 12px 48px rgba(37,99,235,0.15)',
                                }} className="animate-fade-in">
                                    {/* User info header */}
                                    <div style={{ padding: '10px 14px 14px', borderBottom: '1px solid #dbeafe', marginBottom: 6 }}>
                                        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 3, color: '#0f172a' }}>{user.user_metadata?.full_name ?? 'User'}</p>
                                        <p style={{ fontSize: 12, color: '#4a7ca5', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                                        <span style={{ display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 700, color: '#2563eb', background: '#dbeafe', padding: '3px 8px', borderRadius: 99 }}>
                                            Free Plan
                                        </span>
                                    </div>

                                    {/* Menu links */}
                                    {USER_MENU.map(item => (
                                        <Link key={item.href} href={item.href} onClick={() => setDropdownOpen(false)} style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '10px 14px', borderRadius: 9, textDecoration: 'none',
                                            color: pathname === item.href ? '#2563eb' : '#0f172a',
                                            background: pathname === item.href ? '#dbeafe' : 'transparent',
                                            fontSize: 14, fontWeight: pathname === item.href ? 600 : 400,
                                            transition: 'background 0.15s',
                                        }}
                                            onMouseEnter={e => { if (pathname !== item.href) e.currentTarget.style.background = '#f0f6ff'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = pathname === item.href ? '#dbeafe' : 'transparent'; }}
                                        >
                                            <span style={{ color: '#2563eb' }}>{item.icon}</span>
                                            {item.label}
                                        </Link>
                                    ))}

                                    {/* Upgrade banner */}
                                    <div style={{ margin: '8px 8px 6px', padding: '12px 14px', borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                                        <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: '#1d4ed8' }}>⚡ Upgrade to Pro</p>
                                        <p style={{ fontSize: 11, color: '#4a7ca5', marginBottom: 8 }}>Unlimited PDFs, custom QR, advanced analytics</p>
                                        <Link href="/pricing" onClick={() => setDropdownOpen(false)} style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>View plans →</Link>
                                    </div>

                                    {/* Sign out */}
                                    <button onClick={handleSignOut} style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '10px 14px', borderRadius: 9, border: 'none', background: 'transparent',
                                        color: '#f87171', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                                        transition: 'background 0.15s',
                                    }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <LogOut size={14} /> Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Auth buttons for guests */
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Link href="/login" style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', textDecoration: 'none', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                                Log in
                            </Link>
                            <Link href="/signup" style={{ padding: '8px 18px', borderRadius: 9, background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                ⚡ Get Started
                            </Link>
                        </div>
                    )}

                    {/* Mobile hamburger */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'none', width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} className="mobile-menu-btn">
                        {mobileOpen ? <X size={16} /> : <Menu size={16} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {(user ? USER_MENU : NAV_LINKS).map(l => (
                        <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{ padding: '12px 0', color: 'var(--text)', textDecoration: 'none', fontSize: 15, borderBottom: '1px solid var(--border)' }}>
                            {l.label}
                        </Link>
                    ))}
                    {user ? (
                        <button onClick={handleSignOut} style={{ padding: '12px 0', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, textAlign: 'left' }}>Sign out</button>
                    ) : (
                        <Link href="/signup" style={{ marginTop: 8, textAlign: 'center', padding: '12px', borderRadius: 9, background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: 'white', textDecoration: 'none', fontWeight: 700 }}>Get Started Free</Link>
                    )}
                </div>
            )}

            <style>{`
        @media(max-width:768px){
          .desktop-nav{display:none!important;}
          .mobile-menu-btn{display:flex!important;}
        }
      `}</style>
        </nav>
    );
}
