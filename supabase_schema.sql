-- Copy everything below this line and paste it into Supabase SQL Editor

-- 1. Create Profile Table (Syncs with Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- 2. Create Threads Table (Search Sessions)
create table public.threads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Messages Table (Chat History)
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid references public.threads on delete cascade not null,
  role text check (role in ('user', 'assistant')),
  content text,
  sources jsonb, -- To store search results
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Setup Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.threads enable row level security;
alter table public.messages enable row level security;

-- 5. Policies
create policy "Users can see own profiles" on profiles for select using (auth.uid() = id);
create policy "Users can insert own profiles" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can see own threads" on threads for select using (auth.uid() = user_id);
create policy "Users can insert own threads" on threads for insert with check (auth.uid() = user_id);
create policy "Users can delete own threads" on threads for delete using (auth.uid() = user_id);

create policy "Users can see own messages" on messages for select using (
  exists (select 1 from threads where id = messages.thread_id and user_id = auth.uid())
);
create policy "Users can insert own messages" on messages for insert with check (
  exists (select 1 from threads where id = messages.thread_id and user_id = auth.uid())
);

-- 6. Trigger for New User Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
