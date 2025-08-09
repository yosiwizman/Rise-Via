
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_SERVICE_KEY: string
  readonly VITE_NEON_DATABASE_URL: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_FLOWISE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
