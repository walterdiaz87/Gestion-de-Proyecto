import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase browser client with safety guards for build-time pre-rendering.
 * During build (prerendering), environment variables might be missing.
 * This function provides placeholders to prevent @supabase/ssr from throwing validation errors.
 */
export const getSupabaseBrowserClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Build safety check
    if (!supabaseUrl || !supabaseAnonKey) {
        return createBrowserClient(
            'https://placeholder-base-url-for-build.supabase.co',
            'placeholder-anon-key-for-build'
        );
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
};
