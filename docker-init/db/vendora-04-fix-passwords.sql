-- Fix password hash for user customer generated from Docker bcrypt
UPDATE vendora_users 
SET data = jsonb_set(
  data, 
  '{password}', 
  '"$2b$12$IMF8S8Q8r5ONY5ukApMoqeE2HIfVpgJlFE.CwNSX462rJJf/4iKye"'::jsonb
)
WHERE id = 'user_customer';
