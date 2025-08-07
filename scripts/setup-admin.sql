-- SQL script for å opprette første admin bruker
-- Kjør dette etter at du har registrert en bruker via webgrensesnittet

-- Erstatt 'admin@example.com' med din faktiske email adresse
UPDATE users 
SET role = 'ADMIN', is_approved = true 
WHERE email = 'admin@example.com';

-- Verifiser at oppdateringen fungerte
SELECT id, name, email, role, is_approved 
FROM users 
WHERE role = 'ADMIN';