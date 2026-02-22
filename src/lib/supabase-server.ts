import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server-side client — use in Server Components, Route Handlers, Server Actions
export async function createServerSupabaseClient() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // In Server Components, cookies can't be set — middleware handles session refresh
                    }
                },
            },
        }
    );
}

// Admin client with service role — use ONLY in server-side API routes, never in client
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);
