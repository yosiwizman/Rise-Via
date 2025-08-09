
interface ImportMetaEnv {
  readonly VITE_NEON_DATABASE_URL: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
