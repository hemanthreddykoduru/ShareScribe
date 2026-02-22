import { createServerSupabaseClient, supabaseAdmin } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabaseAdmin
        .from('pdfs')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    if (data.visibility === 'private' && data.user_id !== user?.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ pdf: data });
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    // Verify ownership first
    const { data: existing } = await supabaseAdmin.from('pdfs').select('user_id').eq('id', id).single();
    if (existing?.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data, error } = await supabaseAdmin
        .from('pdfs')
        .update(body)
        .eq('id', id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ pdf: data });
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify ownership and get file path
    const { data: pdf } = await supabaseAdmin
        .from('pdfs')
        .select('file_path, user_id')
        .eq('id', id)
        .single();

    if (!pdf || pdf.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (pdf.file_path) {
        await supabaseAdmin.storage.from('pdfs').remove([pdf.file_path]);
    }

    const { error } = await supabaseAdmin.from('pdfs').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
