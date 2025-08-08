
CREATE TABLE IF NOT EXISTS public.wishlist_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text UNIQUE NOT NULL,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.wishlist_sessions(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, product_id)
);

ALTER TABLE public.wishlist_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_session_token() 
RETURNS text 
LANGUAGE sql 
STABLE 
AS $$
  SELECT nullif(current_setting('request.headers', true)::jsonb->>'x-session-token', '')::text;
$$;

CREATE POLICY "Anyone can create sessions" 
ON public.wishlist_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can read own sessions" 
ON public.wishlist_sessions 
FOR SELECT 
USING (session_token = get_session_token());

CREATE POLICY "Users can read own wishlist items" 
ON public.wishlist_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.wishlist_sessions s
    WHERE s.id = wishlist_items.session_id
    AND s.session_token = get_session_token()
  )
);

CREATE POLICY "Users can insert own wishlist items" 
ON public.wishlist_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wishlist_sessions s
    WHERE s.id = wishlist_items.session_id
    AND s.session_token = get_session_token()
  )
);

CREATE POLICY "Users can delete own wishlist items" 
ON public.wishlist_items 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.wishlist_sessions s
    WHERE s.id = wishlist_items.session_id
    AND s.session_token = get_session_token()
  )
);
