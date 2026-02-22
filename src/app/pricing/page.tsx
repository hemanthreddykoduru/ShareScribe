'use client';
import Link from 'next/link';
import { Check, X, Zap, ArrowRight } from 'lucide-react';

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        subtitle: 'Perfect for individuals getting started',
        cta: 'Get started free',
        href: '/signup',
        featured: false,
        features: [
            { text: '5 PDF uploads', included: true },
            { text: '100 MB storage', included: true },
            { text: 'Basic QR codes', included: true },
            { text: 'Shareable links', included: true },
            { text: 'Basic analytics (7 days)', included: true },
            { text: 'Password protection', included: false },
            { text: 'Expiry links', included: false },
            { text: 'Custom QR styling', included: false },
            { text: 'Advanced analytics', included: false },
            { text: 'Priority support', included: false },
        ],
    },
    {
        name: 'Pro',
        price: '$9',
        period: '/month',
        subtitle: 'For professionals and growing teams',
        cta: 'Upgrade to Pro',
        href: '/signup?plan=pro',
        featured: true,
        features: [
            { text: 'Unlimited PDF uploads', included: true },
            { text: '10 GB storage', included: true },
            { text: 'Custom QR styling', included: true },
            { text: 'Shareable links', included: true },
            { text: 'Advanced analytics (90 days)', included: true },
            { text: 'Password protection', included: true },
            { text: 'Expiry links', included: true },
            { text: 'Logo in QR code', included: true },
            { text: 'Folder organization', included: true },
            { text: 'Priority support', included: true },
        ],
    },
];

const faqs = [
    { q: 'Can I switch plans at any time?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, American Express) via Stripe.' },
    { q: 'Is there a free trial for Pro?', a: 'Yes, you get a 14-day free trial when you sign up for the Pro plan — no credit card required.' },
    { q: 'What happens to my PDFs if I downgrade?', a: 'Your PDFs remain accessible, but you won\'t be able to upload new ones beyond the free plan limit.' },
];

export default function PricingPage() {
    return (
        <div style={{ paddingTop: 88, minHeight: '100vh' }}>
            <div className="page-wrap" style={{ paddingBottom: 80 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 64, paddingTop: 40 }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)',
                        color: '#93c5fd', borderRadius: 99, padding: '5px 14px', fontSize: 12, fontWeight: 600, marginBottom: 24,
                    }}>
                        <Zap size={11} /> Simple, transparent pricing
                    </span>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 16 }}>
                        Choose your <span className="gradient-text">plan</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
                        Start for free, upgrade when you need more power. Cancel anytime.
                    </p>
                </div>

                {/* Plans */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 800, margin: '0 auto 80px', alignItems: 'start' }}>
                    {plans.map(plan => (
                        <div key={plan.name} style={{ position: 'relative' }}>
                            {plan.featured && (
                                <div style={{
                                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                                    background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                                    color: 'white', padding: '4px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                                    whiteSpace: 'nowrap', zIndex: 2,
                                }}>
                                    ✨ Most Popular
                                </div>
                            )}
                            <div className="glass-card" style={{
                                padding: 32,
                                border: plan.featured ? '1px solid rgba(37,99,235,0.5)' : '1px solid var(--border)',
                                background: plan.featured ? 'rgba(37,99,235,0.06)' : 'var(--bg-card)',
                                boxShadow: plan.featured ? '0 20px 60px rgba(37,99,235,0.15)' : 'none',
                            }}>
                                <div style={{ marginBottom: 24 }}>
                                    <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{plan.name}</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>{plan.subtitle}</p>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                        <span style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-2px' }} className={plan.featured ? 'gradient-text' : ''}>{plan.price}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{plan.period}</span>
                                    </div>
                                </div>

                                <Link href={plan.href} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    padding: '13px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15,
                                    marginBottom: 28,
                                    ...(plan.featured
                                        ? { background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: 'white' }
                                        : { border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)' }),
                                }}>
                                    {plan.cta} <ArrowRight size={15} />
                                </Link>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {plan.features.map(f => (
                                        <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            {f.included ? (
                                                <Check size={15} style={{ color: '#22c55e', flexShrink: 0 }} />
                                            ) : (
                                                <X size={15} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
                                            )}
                                            <span style={{ fontSize: 14, color: f.included ? 'var(--text)' : 'var(--text-faint)' }}>{f.text}</span>
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
                            <details key={faq.q} style={{ cursor: 'pointer' }}>
                                <summary className="glass-card" style={{
                                    padding: '18px 22px', listStyle: 'none', display: 'flex',
                                    justifyContent: 'space-between', alignItems: 'center',
                                    fontWeight: 600, fontSize: 15,
                                }}>
                                    {faq.q}
                                    <span style={{ color: '#93c5fd', fontSize: 20, flexShrink: 0 }}>+</span>
                                </summary>
                                <div style={{ padding: '16px 22px', color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
            <style>{`@media(max-width:640px){.plans-grid{grid-template-columns:1fr!important;}}`}</style>
        </div>
    );
}
