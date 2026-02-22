import { createServerSupabaseClient, supabaseAdmin } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { generateSlug } from '@/lib/utils';

export async function GET() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabaseAdmin
        .from('pdfs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ pdfs: data });
}

export async function POST(request: Request) {
    // 1. Verify user identity via SSR session cookies
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const tags = (formData.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean);
    const visibility = (formData.get('visibility') as string) || 'public';
    const password = formData.get('password') as string;
    const expiry = formData.get('expiry') as string;

    if (!file || !title) return NextResponse.json({ error: 'File and title are required' }, { status: 400 });
    if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: 'File too large. Max 50 MB.' }, { status: 400 });

    // 2. Upload to Supabase Storage using admin client (bypasses storage RLS)
    const slug = `${generateSlug(title)}-${Date.now()}`;
    const filePath = `${user.id}/${slug}.pdf`;

    const { error: uploadError } = await supabaseAdmin.storage
        .from('pdfs')
        .upload(filePath, file, { contentType: 'application/pdf', upsert: false });

    if (uploadError) return NextResponse.json({ error: `Storage error: ${uploadError.message}` }, { status: 500 });

    const { data: { publicUrl } } = supabaseAdmin.storage.from('pdfs').getPublicUrl(filePath);

    // 3. Insert PDF record using admin client (bypasses RLS — user already verified above)
    const { data: pdf, error: dbError } = await supabaseAdmin
        .from('pdfs')
        .insert({
            user_id: user.id,
            title,
            description: description || null,
            tags,
            slug,
            file_url: publicUrl,
            file_path: filePath,
            visibility: visibility as 'public' | 'private',
            password_hash: password || null,
            expires_at: expiry || null,
            size_bytes: file.size,
        })
        .select()
        .single();

    if (dbError) {
        // Cleanup uploaded file if DB insert fails
        await supabaseAdmin.storage.from('pdfs').remove([filePath]);
        return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 4. Update storage_used on user's profile
    await supabaseAdmin.rpc('increment_storage_used', {
        user_id_arg: user.id,
        bytes_arg: file.size,
    }).maybeSingle();

    return NextResponse.json({
        pdf,
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/p/${slug}`,
    });
}
