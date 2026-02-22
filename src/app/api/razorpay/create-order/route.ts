import { createServerSupabaseClient, supabaseAdmin } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check if already Pro
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('is_pro')
        .eq('id', user.id)
        .single();

    if (profile?.is_pro) {
        return NextResponse.json({ error: 'Already a Pro member' }, { status: 400 });
    }

    const order = await razorpay.orders.create({
        amount: 10000, // ₹100 in paise
        currency: 'INR',
        receipt: `order_${user.id}_${Date.now()}`,
        notes: { user_id: user.id, email: user.email ?? '' },
    });

    return NextResponse.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
    });
}
