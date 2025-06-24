-- Create buckets
insert into storage.buckets (id, name, public, avif_autodetection)
values
  ('public', 'public', true, false),
  ('private', 'private', false, false);

-- Set up security policies
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'public' );

create policy "Individual User Access"
  on storage.objects for select
  using ( bucket_id = 'private' AND auth.uid() = owner );

create policy "Auth Users Can Upload"
  on storage.objects for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users Can Update Own Files"
  on storage.objects for update
  using ( auth.uid() = owner );

create policy "Users Can Delete Own Files"
  on storage.objects for delete
  using ( auth.uid() = owner ); 