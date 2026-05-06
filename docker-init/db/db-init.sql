-- PostgreSQL init (from InsForge deploy/docker-init/db/db-init.sql)
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE project_admin NOLOGIN;

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO project_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO project_admin;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, project_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, project_admin;

CREATE OR REPLACE FUNCTION public.create_default_policies()
RETURNS event_trigger AS $$
DECLARE
  obj record;
  table_schema text;
  table_name text;
  has_rls boolean;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands() WHERE command_tag = 'CREATE TABLE'
  LOOP
    SELECT INTO table_schema, table_name
      split_part(obj.object_identity, '.', 1),
      trim(both '"' from split_part(obj.object_identity, '.', 2));
    SELECT INTO has_rls
      rowsecurity
    FROM pg_tables
    WHERE schemaname = table_schema
      AND tablename = table_name;
    IF has_rls THEN
      EXECUTE format('CREATE POLICY "project_admin_policy" ON %s FOR ALL TO project_admin USING (true) WITH CHECK (true)', obj.object_identity);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE EVENT TRIGGER create_policies_on_table_create
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE')
  EXECUTE FUNCTION public.create_default_policies();

CREATE OR REPLACE FUNCTION public.create_policies_after_rls()
RETURNS event_trigger AS $$
DECLARE
  obj record;
  table_schema text;
  table_name text;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands() WHERE command_tag = 'ALTER TABLE'
  LOOP
    SELECT INTO table_schema, table_name
      split_part(obj.object_identity, '.', 1),
      trim(both '"' from split_part(obj.object_identity, '.', 2));
    IF EXISTS (
      SELECT 1 FROM pg_tables
      WHERE schemaname = table_schema
        AND tablename = table_name
        AND rowsecurity = true
    ) AND NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = table_schema
        AND tablename = table_name
    ) THEN
      EXECUTE format('CREATE POLICY "project_admin_policy" ON %s FOR ALL TO project_admin USING (true) WITH CHECK (true)', obj.object_identity);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE EVENT TRIGGER create_policies_on_rls_enable
  ON ddl_command_end
  WHEN TAG IN ('ALTER TABLE')
  EXECUTE FUNCTION public.create_policies_after_rls();
