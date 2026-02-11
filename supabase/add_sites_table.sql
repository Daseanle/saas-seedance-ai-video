
-- Create seo_sites table for Matrix Management
create table if not exists public.seo_sites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid default auth.uid(),
  domain text not null,
  repo_path text not null,
  framework text default 'nextjs',
  blog_path text default 'app/blog',
  target_geo text default 'Global',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.seo_sites enable row level security;
create policy "Enable all for authenticated users" on public.seo_sites
  for all using (true) with check (true);
