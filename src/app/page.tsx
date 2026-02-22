'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  FileText, QrCode, Shield, BarChart3, Zap, CheckCircle,
  ArrowRight, Upload, Globe, Clock, Star
} from 'lucide-react';

const features = [
  { icon: <Upload size={22} />, title: 'PDF Upload & Hosting', desc: 'Upload any PDF and get a shareable link instantly. Organize with folders and tags.' },
  { icon: <QrCode size={22} />, title: 'QR Code Generator', desc: 'Auto-generate beautiful, customizable QR codes for every PDF you upload.' },
  { icon: <Shield size={22} />, title: 'Password Protection', desc: 'Protect sensitive documents with a password. Only authorized viewers can access.' },
  { icon: <Clock size={22} />, title: 'Expiry Links', desc: 'Set expiration dates on your shared links. Documents auto-expire when you want them to.' },
  { icon: <BarChart3 size={22} />, title: 'Built-in Analytics', desc: 'Track views, downloads, and QR scans with beautiful charts and real-time data.' },
  { icon: <Globe size={22} />, title: 'Public PDF Viewer', desc: 'Your recipients see a beautiful, branded PDF viewer — no signup required.' },
];

const stats = [
  { num: '50K+', label: 'PDFs Hosted' },
  { num: '250K+', label: 'QR Codes Generated' },
  { num: '99.9%', label: 'Uptime' },
  { num: '4.9★', label: 'User Rating' },
];

const steps = [
  { n: '01', title: 'Upload Your PDF', desc: 'Drag & drop or browse to upload your PDF file. Add a title, description, and tags.' },
  { n: '02', title: 'Get Your Link & QR', desc: 'Instantly receive a unique shareable URL and a beautiful downloadable QR code.' },
  { n: '03', title: 'Track & Manage', desc: 'Monitor views and downloads in real-time with our powerful analytics dashboard.' },
];

export default function LandingPage() {
  const [dots, setDots] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const d = Array.from({ length: 12 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setDots(d);
  }, []);

  return (
    <div style={{ paddingTop: 64 }}>
      {/* Hero */}
      <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Floating dots */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {dots.map((d, i) => (
            <div key={i} style={{
              position: 'absolute', left: `${d.x}%`, top: `${d.y}%`,
              width: 4, height: 4, borderRadius: '50%',
              background: i % 2 === 0 ? '#2563eb' : '#3b82f6',
              opacity: 0.3,
              animation: `float ${3 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }} />
          ))}
        </div>

        <div className="page-wrap" style={{ width: '100%', textAlign: 'center', padding: '80px 20px' }}>
          {/* Badge */}
          <div className="animate-fade-in" style={{ animationDelay: '0s' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)',
              color: '#93c5fd', borderRadius: 99, padding: '6px 16px', fontSize: 13, fontWeight: 600,
              marginBottom: 24,
            }}>
              <Zap size={12} /> New: Custom QR branding now live
            </span>
          </div>

          <h1 className="animate-fade-in" style={{
            fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 900, lineHeight: 1.08,
            letterSpacing: '-2px', marginBottom: 24, animationDelay: '0.1s',
          }}>
            Share PDFs with{' '}
            <span className="gradient-text">Beautiful QR Codes</span>
          </h1>

          <p className="animate-fade-in" style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'var(--text-muted)',
            maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7, animationDelay: '0.2s',
          }}>
            Upload PDFs, generate shareable links and downloadable QR codes,
            protect with passwords, and track every view — all in one platform.
          </p>

          <div className="animate-fade-in" style={{
            display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.3s',
          }}>
            <Link href="/signup" className="btn-primary" style={{
              padding: '14px 32px', borderRadius: 12, textDecoration: 'none',
              fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link href="/upload" style={{
              padding: '14px 32px', borderRadius: 12, textDecoration: 'none',
              fontSize: 16, fontWeight: 600, border: '1px solid var(--border)',
              color: 'var(--text)', background: 'var(--bg-card)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
            }}>
              <Upload size={16} /> Upload a PDF
            </Link>
          </div>

          {/* Hero Card Mock */}
          <div className="animate-fade-in animate-float" style={{
            marginTop: 64, maxWidth: 700, margin: '64px auto 0',
            animationDelay: '0.4s',
          }}>
            <div className="glass-card" style={{
              padding: 24, display: 'flex', gap: 20, alignItems: 'center',
              textAlign: 'left', boxShadow: '0 32px 80px rgba(37,99,235,0.15)',
            }}>
              <div style={{
                width: 64, height: 80, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(59,130,246,0.2))',
                border: '1px solid rgba(37,99,235,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileText size={28} style={{ color: '#93c5fd' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, marginBottom: 6 }}>Annual_Report_2025.pdf</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                  sharescribe.app/p/annual-report-2025 · 1.2K views
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>
                    <CheckCircle size={10} /> Public
                  </span>
                  <span className="badge" style={{ background: 'rgba(37,99,235,0.12)', color: '#93c5fd' }}>
                    QR Ready
                  </span>
                  <span className="badge" style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24' }}>
                    Pro
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 8,
                  background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 8, boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
                }}>
                  <QrCode size={36} color="white" />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Scan QR</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ padding: '40px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="page-wrap">
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 24 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div className="stat-number">{s.num}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features">
        <div className="page-wrap">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>
              Everything you need to <span className="gradient-text">share smarter</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
              A complete PDF management platform built for teams and individuals.
            </p>
          </div>
          <div className="grid-3">
            {features.map((f) => (
              <div key={f.title} className="glass-card" style={{ padding: 28 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, marginBottom: 18,
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(59,130,246,0.15))',
                  border: '1px solid rgba(37,99,235,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#93c5fd',
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" style={{ background: 'linear-gradient(180deg, transparent, rgba(37,99,235,0.04), transparent)' }}>
        <div className="page-wrap">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>
              Up and running in <span className="gradient-text">3 steps</span>
            </h2>
          </div>
          <div className="grid-3">
            {steps.map((s, i) => (
              <div key={s.n} style={{ textAlign: 'center', position: 'relative' }}>
                {i < steps.length - 1 && (
                  <div style={{
                    position: 'absolute', top: 28, left: '60%', width: '80%', height: 1,
                    background: 'linear-gradient(90deg, var(--border), transparent)',
                    display: 'none',
                  }} className="step-line" />
                )}
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800, color: 'white',
                  boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
                }}>
                  {s.n}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 260, margin: '0 auto' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="page-wrap" style={{ textAlign: 'center' }}>
          <div className="glass-card gradient-border" style={{
            padding: '64px 40px', maxWidth: 700, margin: '0 auto',
            boxShadow: '0 32px 80px rgba(37,99,235,0.15)',
          }}>
            <Star size={32} style={{ color: '#fbbf24', marginBottom: 20 }} />
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>
              Start sharing PDFs <span className="gradient-text">like a pro</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 32 }}>
              Free plan includes 5 PDFs, basic QR codes, and link analytics.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" className="btn-primary" style={{
                padding: '14px 32px', borderRadius: 12, textDecoration: 'none',
                fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link href="/pricing" style={{
                padding: '14px 32px', borderRadius: 12, textDecoration: 'none',
                fontSize: 16, border: '1px solid var(--border)', color: 'var(--text)',
              }}>
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 0' }}>
        <div className="page-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText size={14} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 15 }} className="gradient-text">ShareScribe</span>
          </div>
          <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>
            © 2025 ShareScribe. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'Support'].map((l) => (
              <Link key={l} href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13 }}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
