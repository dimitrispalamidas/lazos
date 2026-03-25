-- Αφαίρεση στήλης αν είχε προστεθεί από προηγούμενο τοπικό migration (αλλάξαμε σε useState-only για το PDF)
alter table public.project_income drop column if exists include_in_pdf;
