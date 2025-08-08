
DROP POLICY IF EXISTS "Allow all operations on wishlist_sessions" ON public.wishlist_sessions;

DROP POLICY IF EXISTS "Allow all operations on wishlist_items" ON public.wishlist_items;

CREATE POLICY "Anyone can view wishlist sessions" ON public.wishlist_sessions 
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Anyone can insert wishlist sessions" ON public.wishlist_sessions 
  FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Anyone can update wishlist sessions" ON public.wishlist_sessions 
  FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete wishlist sessions" ON public.wishlist_sessions 
  FOR DELETE TO authenticated, anon USING (true);

CREATE POLICY "Anyone can view wishlist items" ON public.wishlist_items 
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Anyone can insert wishlist items" ON public.wishlist_items 
  FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "Anyone can update wishlist items" ON public.wishlist_items 
  FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete wishlist items" ON public.wishlist_items 
  FOR DELETE TO authenticated, anon USING (true);
