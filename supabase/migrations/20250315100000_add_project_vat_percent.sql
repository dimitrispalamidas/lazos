-- Add optional VAT % at project level (for meriko/geniko total with VAT)
alter table public.projects
  add column if not exists vat_percent numeric default null;
