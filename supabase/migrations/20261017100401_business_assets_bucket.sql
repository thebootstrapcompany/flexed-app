insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'business-assets',
    'business-assets',
    true,
    10485760,
    array['image/webp']::text[]
)
on conflict (id)
do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "business_assets_insert_owner" on storage.objects;
create policy "business_assets_insert_owner"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'business-assets'
    and array_length(storage.foldername(name), 1) = 2
    and (storage.foldername(name))[2] in ('logo', 'background')
    and lower(storage.extension(name)) = 'webp'
    and exists (
        select 1
        from public.businesses as b
          where b.user_id = (select auth.uid())
    )
);