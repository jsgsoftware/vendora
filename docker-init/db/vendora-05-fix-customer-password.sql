UPDATE vendora_users
SET data = jsonb_set(
  data::jsonb,
  '{password}',
  '"$2b$12$RjGWsO8cVut/zBC/hwa2YOl.cxrXcE0KjXRLspDlz/.4cWzfMX/76"'::jsonb
)
WHERE id = 'user_customer';
