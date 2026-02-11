-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Projects Table (每个用户可以有多个项目)
create table public.seo_projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  domain text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Keywords Table (每个项目下的关键词)
create table public.seo_keywords (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.seo_projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade not null, -- 冗余字段方便查询
  keyword text not null,
  volume int default 0,
  rank int,
  prev_rank int,
  velocity int default 0, -- 排名变化速度
  difficulty text, -- 'High', 'Medium', 'Low'
  ai_mention boolean default false, -- 是否在 AI 搜索中被提及
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. GEO Analysis Results (AI 分析历史)
create table public.geo_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  keyword text not null,
  brand text not null,
  visibility_score int, -- 0-100
  sentiment text, -- 'Positive', 'Neutral', 'Negative'
  result_json jsonb, -- 存储完整的 AI返回结果
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (安全策略：只允许用户访问自己的数据)

-- Projects
alter table public.seo_projects enable row level security;
create policy "Users can view their own projects" on public.seo_projects
  for select using (auth.uid() = user_id);
create policy "Users can insert their own projects" on public.seo_projects
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own projects" on public.seo_projects
  for update using (auth.uid() = user_id);
create policy "Users can delete their own projects" on public.seo_projects
  for delete using (auth.uid() = user_id);

-- Keywords
alter table public.seo_keywords enable row level security;
create policy "Users can view their own keywords" on public.seo_keywords
  for select using (auth.uid() = user_id);
create policy "Users can insert their own keywords" on public.seo_keywords
  for insert with check (auth.uid() = user_id);
create policy "Users can delete their own keywords" on public.seo_keywords
  for delete using (auth.uid() = user_id);

-- GEO Analyses
alter table public.geo_analyses enable row level security;
create policy "Users can view their own analyses" on public.geo_analyses
  for select using (auth.uid() = user_id);
create policy "Users can insert their own analyses" on public.geo_analyses
  for insert with check (auth.uid() = user_id);
