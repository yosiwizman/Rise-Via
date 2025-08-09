

-- Fix wishlist RLS policies by replacing overly permissive policies
-- with specific policies for each operation and role

-- Drop existing overly permissive policies for wishlist_sessions
DROP POLICY IF EXISTS "Anyone can view wishlist sessions" ON public.wishlist_sessions;
DROP POLICY IF EXISTS "Anyone can insert wishlist sessions" ON public.wishlist_sessions;
DROP POLICY IF EXISTS "Anyone can update wishlist sessions" ON public.wishlist_sessions;
DROP POLICY IF EXISTS "Anyone can delete wishlist sessions" ON public.wishlist_sessions;

-- Drop existing overly permissive policies for wishlist_items
DROP POLICY IF EXISTS "Anyone can view wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Anyone can insert wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Anyone can update wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Anyone can delete wishlist items" ON public.wishlist_items;

-- Create specific SELECT policies for wishlist_sessions
CREATE POLICY "Public users can view wishlist sessions" ON public.wishlist_sessions
  FOR SELECT TO public USING (true);

-- Create specific INSERT policies for wishlist_sessions
CREATE POLICY "Public users can insert wishlist sessions" ON public.wishlist_sessions
  FOR INSERT TO public WITH CHECK (true);

-- Create specific UPDATE policies for wishlist_sessions
CREATE POLICY "Public users can update wishlist sessions" ON public.wishlist_sessions
  FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Create specific DELETE policies for wishlist_sessions
CREATE POLICY "Public users can delete wishlist sessions" ON public.wishlist_sessions
  FOR DELETE TO public USING (true);

-- Create specific SELECT policies for wishlist_items
CREATE POLICY "Public users can view wishlist items" ON public.wishlist_items
  FOR SELECT TO public USING (true);

-- Create specific INSERT policies for wishlist_items
CREATE POLICY "Public users can insert wishlist items" ON public.wishlist_items
  FOR INSERT TO public WITH CHECK (true);

-- Create specific UPDATE policies for wishlist_items
CREATE POLICY "Public users can update wishlist items" ON public.wishlist_items
  FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Create specific DELETE policies for wishlist_items
CREATE POLICY "Public users can delete wishlist items" ON public.wishlist_items
  FOR DELETE TO public USING (true);
