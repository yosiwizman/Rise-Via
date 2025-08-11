
interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_FLOWISE_URL: string
  readonly VITE_FLOWISE_API_KEY: string
  readonly VITE_APP_ENV: string
  readonly VITE_APP_URL: string
  readonly VITE_GA_TRACKING_ID: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
