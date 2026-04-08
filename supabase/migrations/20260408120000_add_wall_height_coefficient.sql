-- Ύψος μάντρας + συντελεστής για γραμμή «Μέτρο» (τιμολόγηση ανά ύψος)
alter table public.projects add column if not exists wall_height numeric not null default 1;
alter table public.projects add column if not exists height_coefficient numeric not null default 10;
