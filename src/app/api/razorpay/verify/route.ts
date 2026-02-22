import { createServerSupabaseClient, supabaseAdmin } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Mark user as Pro in profiles
    const { error } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: user.id,
            is_pro: true,
            razorpay_payment_id,
            updated_at: new Date().toISOString(),
        });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}
