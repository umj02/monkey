insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'custom-category-assets',
  'custom-category-assets',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists custom_category_assets_select_public on storage.objects;
create policy custom_category_assets_select_public
on storage.objects for select
using (bucket_id = 'custom-category-assets');

drop policy if exists custom_category_assets_insert_own on storage.objects;
create policy custom_category_assets_insert_own
on storage.objects for insert
with check (
  bucket_id = 'custom-category-assets'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists custom_category_assets_update_own on storage.objects;
create policy custom_category_assets_update_own
on storage.objects for update
using (
  bucket_id = 'custom-category-assets'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'custom-category-assets'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists custom_category_assets_delete_own on storage.objects;
create policy custom_category_assets_delete_own
on storage.objects for delete
using (
  bucket_id = 'custom-category-assets'
  and auth.uid()::text = (storage.foldername(name))[1]
);
