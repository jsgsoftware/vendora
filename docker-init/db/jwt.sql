-- =============================================================
-- JWT DB config — ejecutado por PostgreSQL en docker-entrypoint-initdb.d
-- Este SQL puro fija app.settings.jwt_secret con un DO $$ block.
-- =============================================================
DO $$
DECLARE
  v_jwt_secret TEXT := current_setting('app.settings.jwt_secret', true);
BEGIN
  IF v_jwt_secret IS NULL OR v_jwt_secret = '' THEN
    v_jwt_secret := 'dev-secret-vendora-change-in-production';
  END IF;

  EXECUTE format(
    'ALTER DATABASE %I SET "app.settings.jwt_secret" TO %L',
    current_database(),
    v_jwt_secret
  );

  EXECUTE format(
    'ALTER DATABASE %I SET "app.settings.jwt_exp" TO %L',
    current_database(),
    '3600'
  );
END $$;
