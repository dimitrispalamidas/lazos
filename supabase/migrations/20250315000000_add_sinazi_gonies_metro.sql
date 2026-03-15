-- Add Μετρα columns (τιμή × μετρα = σύνολο): Μετρο row + Σιναζι + Γωνίες
alter table public.projects add column if not exists price_metra numeric default 0;
alter table public.projects add column if not exists sinazi_metro numeric default 0;
alter table public.projects add column if not exists gonies_metro numeric default 0;
