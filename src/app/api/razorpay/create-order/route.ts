import { createServerSupabaseClient, supabaseAdmin } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const planType = body.planType === 'yearly' ? 'yearly' : 'monthly';

    // Only block monthly re-purchase if already Pro (yearly is always allowed as an upgrade)
    if (planType === 'monthly') {
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('is_pro')
            .eq('id', user.id)
            .single();
        if (profile?.is_pro) {
            return NextResponse.json({ error: 'Already a Pro member' }, { status: 400 });
        }
    }
    const amount = planType === 'yearly' ? 70000 : 10000; // paise: ₹700 or ₹100

    const order = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: `rcpt_${user.id.slice(-8)}_${Date.now().toString().slice(-8)}`,
        notes: { user_id: user.id, email: user.email ?? '', plan: planType },
    });

    return NextResponse.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        planType,
    });
}
