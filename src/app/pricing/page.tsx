'use client';
import { useState, useEffect } from 'react';
import { Check, X, Zap, ArrowRight, Loader } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Razorpay: any;
    }
}

const plans = [
    {
        name: 'Free',
        price: '₹0',
        period: 'forever',
        subtitle: 'Perfect for individuals getting started',
        cta: 'Get started free',
        featured: false,
        badge: null,
        planType: null,
        features: [
            { text: '5 PDF uploads', included: true },
            { text: '100 MB storage', included: true },
            { text: 'Basic QR codes', included: true },
            { text: 'Shareable links', included: true },
            { text: 'Basic analytics (7 days)', included: true },
            { text: 'Password protection', included: false },
            { text: 'Custom QR styling', included: false },
            { text: 'Advanced analytics', included: false },
            { text: 'Priority support', included: false },
        ],
    },
    {
        name: 'Pro',
        price: '₹100',
        period: '/month',
        subtitle: 'Full power, billed monthly',
        cta: 'Upgrade to Pro',
        featured: false,
        badge: null,
        planType: 'monthly',
        features: [
            { text: 'Unlimited PDF uploads', included: true },
            { text: '10 GB storage', included: true },
            { text: 'Custom QR styling', included: true },
            { text: 'Shareable links', included: true },
            { text: 'Advanced analytics (90 days)', included: true },
            { text: 'Password protection', included: true },
            { text: 'Expiry links', included: true },
            { text: 'Logo in QR code', included: true },
            { text: 'Priority support', included: true },
        ],
    },
    {
        name: 'Pro Yearly',
        price: '₹700',
        period: '/year',
        subtitle: 'Best value — save ₹500 vs monthly',
        cta: 'Get Pro Yearly',
        featured: true,
        badge: '🏆 Best Value',
        planType: 'yearly',
        features: [
            { text: 'Unlimited PDF uploads', included: true },
            { text: '10 GB storage', included: true },
            { text: 'Custom QR styling', included: true },
            { text: 'Shareable links', included: true },
            { text: 'Advanced analytics (90 days)', included: true },
            { text: 'Password protection', included: true },
            { text: 'Expiry links', included: true },
            { text: 'Logo in QR code', included: true },
            { text: 'Priority support', included: true },
        ],
    },
];

const faqs = [
    { q: 'Can I switch plans at any time?', a: 'Yes, you can upgrade or downgrade your plan at any time.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, Net Banking, and wallets via Razorpay.' },
    { q: 'How much do I save with the yearly plan?', a: 'The yearly plan costs ₹700 vs ₹1,200 (₹100 × 12) — you save ₹500 per year.' },
    { q: 'What happens to my PDFs if I downgrade?', a: 'Your PDFs stay accessible, but new uploads are limited to the free plan quota.' },
];

export default function PricingPage() {
    const [user, setUser] = useState<User | null>(null);
    const [isPro, setIsPro] = useState(false);
    const [paying, setPaying] = useState<string | null>(null); // planType being paid
    const [paymentDone, setPaymentDone] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        supabase.auth.getUser().then(async ({ data: { user: u } }) => {
            setUser(u);
            if (u) {
                const { data } = await supabase.from('profiles').select('is_pro').eq('id', u.id).single();
                setIsPro(data?.is_pro ?? false);
            }
        });
        return () => { document.body.removeChild(script); };
    }, []);

    const handleUpgrade = async (planType: string, label: string) => {
        if (!user) { window.location.href = '/login?redirect=/pricing'; return; }
        // Monthly re-purchase blocked by API; yearly always proceeds

        setPaying(planType);
        try {
            const res = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planType }),
            });
            const order = await res.json();
            if (!res.ok) throw new Error(order.error);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'ShareScribe',
                description: `Pro Plan — ${label}`,
                order_id: order.orderId,
                prefill: { name: user.user_metadata?.full_name ?? '', email: user.email ?? '' },
                theme: { color: '#2563eb' },
                handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
                    const verify = await fetch('/api/razorpay/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(response),
                    });
                    if (verify.ok) { setIsPro(true); setPaymentDone(true); }
                },
                modal: { ondismiss: () => setPaying(null) },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', () => setPaying(null));
            rzp.open();
        } catch {
            setPaying(null);
        }
    };

    if (paymentDone) return (
        <div style={{ paddingTop: 88, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{ maxWidth: 440, width: '100%', padding: 48, textAlign: 'center', margin: '0 20px' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Check size={36} style={{ color: '#2563eb' }} />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>You are now Pro! ⚡</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Your account has been upgraded. Enjoy unlimited PDFs, custom QR codes, and advanced analytics.</p>
                <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 10, background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
                    Go to Dashboard <ArrowRight size={15} />
                </a>
            </div>
        </div>
    );

    return (
        <div style={{ paddingTop: 88, minHeight: '100vh' }}>
            <div className="page-wrap" style={{ paddingBottom: 80 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 56, paddingTop: 40 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dbeafe', border: '1px solid #bfdbfe', color: '#2563eb', borderRadius: 99, padding: '5px 14px', fontSize: 12, fontWeight: 600, marginBottom: 24 }}>
                        <Zap size={11} /> Simple, transparent pricing
                    </span>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 16 }}>
                        Choose your <span className="gradient-text">plan</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
                        Start for free, upgrade when you need more power.
                    </p>
                </div>

                {/* Plans — 3 columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 980, margin: '0 auto 80px', alignItems: 'start' }}>
                    {plans.map(plan => (
                        <div key={plan.name} style={{ position: 'relative' }}>
                            {plan.badge && (
                                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: 'white', padding: '4px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', zIndex: 2 }}>
                                    {plan.badge}
                                </div>
                            )}
                            <div className="glass-card" style={{
                                padding: 28,
                                border: plan.featured ? '2px solid #2563eb' : '1px solid var(--border)',
                                background: plan.featured ? '#f0f6ff' : 'var(--bg-card)',
                                boxShadow: plan.featured ? '0 20px 60px rgba(37,99,235,0.12)' : 'none',
                            }}>
                                <div style={{ marginBottom: 20 }}>
                                    <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{plan.name}</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 14 }}>{plan.subtitle}</p>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                        <span style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-2px', color: plan.featured ? '#2563eb' : 'var(--text)' }}>{plan.price}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{plan.period}</span>
                                    </div>
                                    {plan.planType === 'yearly' && (
                                        <p style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, marginTop: 4 }}>Save ₹500 vs monthly</p>
                                    )}
                                </div>

                                {plan.planType ? (
                                    isPro && plan.planType === 'monthly' ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 10, background: '#dbeafe', color: '#2563eb', fontWeight: 700, fontSize: 14, marginBottom: 24 }}>
                                            <Check size={14} /> You are on Pro ⚡
                                        </div>
                                    ) : (
                                        <button onClick={() => handleUpgrade(plan.planType!, `${plan.price}${plan.period}`)} disabled={paying !== null} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                            padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 14,
                                            background: plan.featured ? 'linear-gradient(135deg, #1d4ed8, #2563eb)' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                            color: 'white', border: 'none', cursor: paying ? 'not-allowed' : 'pointer',
                                            width: '100%', marginBottom: 24, opacity: paying ? 0.7 : 1,
                                            boxShadow: plan.featured ? '0 4px 16px rgba(37,99,235,0.3)' : 'none',
                                        }}>
                                            {paying === plan.planType ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</> : <>{plan.cta} <ArrowRight size={14} /></>}
                                        </button>
                                    )
                                ) : (
                                    <a href={user ? '/upload' : '/signup'} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        padding: '12px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14,
                                        border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', marginBottom: 24,
                                    }}>
                                        {plan.cta} <ArrowRight size={14} />
                                    </a>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {plan.features.map(f => (
                                        <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {f.included ? <Check size={14} style={{ color: '#22c55e', flexShrink: 0 }} /> : <X size={14} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />}
                                            <span style={{ fontSize: 13, color: f.included ? 'var(--text)' : 'var(--text-faint)' }}>{f.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ */}
                <div style={{ maxWidth: 680, margin: '0 auto' }}>
                    <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', textAlign: 'center', marginBottom: 40 }}>
                        Frequently asked <span className="gradient-text">questions</span>
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {faqs.map(faq => (
                            <details key={faq.q}>
                                <summary className="glass-card" style={{ padding: '18px 22px', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                                    {faq.q}
                                    <span style={{ color: '#2563eb', fontSize: 20, flexShrink: 0 }}>+</span>
                                </summary>
                                <div style={{ padding: '16px 22px', color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>{faq.a}</div>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:760px){.plans-grid{grid-template-columns:1fr!important;}}`}</style>
        </div>
    );
}
