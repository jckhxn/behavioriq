--
-- PostgreSQL database dump
--

\restrict bMPuzyxaXsxn6vOvjJ0ucq6UznFlvt9Yh02TxANHMMd91srCSeCWeYq8Epdofh8

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: AssessmentDomain; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssessmentDomain" AS ENUM (
    'ANTISOCIAL',
    'VIOLENCE',
    'ATTENTION',
    'EMOTIONAL',
    'CONDUCT'
);


ALTER TYPE public."AssessmentDomain" OWNER TO postgres;

--
-- Name: AssessmentMode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssessmentMode" AS ENUM (
    'TRIAL',
    'FULL'
);


ALTER TYPE public."AssessmentMode" OWNER TO postgres;

--
-- Name: AssessmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssessmentStatus" AS ENUM (
    'IN_PROGRESS',
    'COMPLETED',
    'ABANDONED'
);


ALTER TYPE public."AssessmentStatus" OWNER TO postgres;

--
-- Name: ChatSessionType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ChatSessionType" AS ENUM (
    'ASSESSMENT',
    'KNOWLEDGE'
);


ALTER TYPE public."ChatSessionType" OWNER TO postgres;

--
-- Name: DocumentCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DocumentCategory" AS ENUM (
    'POLICY',
    'PROCEDURE',
    'GUIDELINE',
    'MANUAL',
    'ASSESSMENT_TOOL',
    'REFERENCE',
    'OTHER'
);


ALTER TYPE public."DocumentCategory" OWNER TO postgres;

--
-- Name: EmailTemplateType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EmailTemplateType" AS ENUM (
    'ASSESSMENT_REPORT',
    'LICENSE_NOTIFICATION',
    'LICENSE_RENEWED',
    'WELCOME',
    'PASSWORD_RESET',
    'MAGIC_LINK',
    'EMAIL_VERIFICATION',
    'EMAIL_CHANGE',
    'AFFILIATE_WELCOME',
    'AFFILIATE_COMMISSION',
    'AFFILIATE_PAYOUT',
    'AFFILIATE_FRAUD_ALERT',
    'SYSTEM_NOTIFICATION',
    'GENERIC'
);


ALTER TYPE public."EmailTemplateType" OWNER TO postgres;

--
-- Name: LicenseStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LicenseStatus" AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'SUSPENDED',
    'CANCELLED'
);


ALTER TYPE public."LicenseStatus" OWNER TO postgres;

--
-- Name: LicenseType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LicenseType" AS ENUM (
    'TRIAL',
    'FREE_TRIAL',
    'FREE',
    'BASIC',
    'MONTHLY_LITE',
    'CORE',
    'ANNUAL_CORE',
    'DISCOUNTED_CORE',
    'FAMILY',
    'ANNUAL_FAMILY',
    'DISCOUNTED_FAMILY',
    'DISTRICT_PILOT',
    'DISTRICT_STANDARD',
    'DISTRICT_PROFESSIONAL',
    'DISTRICT_ENTERPRISE',
    'PROFESSIONAL',
    'ENTERPRISE'
);


ALTER TYPE public."LicenseType" OWNER TO postgres;

--
-- Name: MessageRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MessageRole" AS ENUM (
    'USER',
    'ASSISTANT',
    'SYSTEM'
);


ALTER TYPE public."MessageRole" OWNER TO postgres;

--
-- Name: RiskLevel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RiskLevel" AS ENUM (
    'LOW',
    'MODERATE',
    'HIGH',
    'VERY_HIGH'
);


ALTER TYPE public."RiskLevel" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN',
    'DISTRICT_ADMIN',
    'TEACHER',
    'SUB_ACCOUNT',
    'SUPER_ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: ShareLinkPrivacy; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ShareLinkPrivacy" AS ENUM (
    'PUBLIC',
    'PRIVATE',
    'PASSWORD_PROTECTED'
);


ALTER TYPE public."ShareLinkPrivacy" OWNER TO postgres;

--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'ACTIVE',
    'PAST_DUE',
    'CANCELLED',
    'INCOMPLETE',
    'INCOMPLETE_EXPIRED',
    'TRIALING',
    'UNPAID'
);


ALTER TYPE public."SubscriptionStatus" OWNER TO postgres;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION storage.add_prefixes(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


ALTER FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION storage.delete_prefix(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION storage.delete_prefix_hierarchy_trigger() OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION storage.get_prefix(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION storage.get_prefixes(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- Name: lock_top_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$$;


ALTER FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) OWNER TO supabase_storage_admin;

--
-- Name: objects_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.objects_delete_cleanup() OWNER TO supabase_storage_admin;

--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_insert_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: objects_update_cleanup(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEW−OLD (added paths) and OLD−NEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEW−OLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLD−NEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.objects_update_cleanup() OWNER TO supabase_storage_admin;

--
-- Name: objects_update_level_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_level_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Set the new level
        NEW."level" := "storage"."get_level"(NEW."name");
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_level_trigger() OWNER TO supabase_storage_admin;

--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: prefixes_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.prefixes_delete_cleanup() OWNER TO supabase_storage_admin;

--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.prefixes_insert_trigger() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    sort_col text;
    sort_ord text;
    cursor_op text;
    cursor_expr text;
    sort_expr text;
BEGIN
    -- Validate sort_order
    sort_ord := lower(sort_order);
    IF sort_ord NOT IN ('asc', 'desc') THEN
        sort_ord := 'asc';
    END IF;

    -- Determine cursor comparison operator
    IF sort_ord = 'asc' THEN
        cursor_op := '>';
    ELSE
        cursor_op := '<';
    END IF;
    
    sort_col := lower(sort_column);
    -- Validate sort column  
    IF sort_col IN ('updated_at', 'created_at') THEN
        cursor_expr := format(
            '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
            sort_col, cursor_op
        );
        sort_expr := format(
            'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
            sort_col, sort_ord, sort_ord
        );
    ELSE
        cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
        sort_expr := format('name COLLATE "C" %s', sort_ord);
    END IF;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    NULL::uuid AS id,
                    updated_at,
                    created_at,
                    NULL::timestamptz AS last_accessed_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
            UNION ALL
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    id,
                    updated_at,
                    created_at,
                    last_accessed_at,
                    metadata
                FROM storage.objects
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
        ) obj
        ORDER BY %s
        LIMIT $3
        $sql$,
        cursor_expr,    -- prefixes WHERE
        sort_expr,      -- prefixes ORDER BY
        cursor_expr,    -- objects WHERE
        sort_expr,      -- objects ORDER BY
        sort_expr       -- final ORDER BY
    )
    USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE auth.oauth_client_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: AffiliateAttribution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AffiliateAttribution" (
    id text NOT NULL,
    "refCode" text NOT NULL,
    "prospectUserId" text NOT NULL,
    "clickId" text,
    "deviceId" text,
    ip text,
    utm jsonb,
    model text DEFAULT 'last_non_direct'::text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AffiliateAttribution" OWNER TO postgres;

--
-- Name: AffiliateClick; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AffiliateClick" (
    id text NOT NULL,
    "refCode" text NOT NULL,
    "sessionId" text NOT NULL,
    ip text,
    ua text,
    utm jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AffiliateClick" OWNER TO postgres;

--
-- Name: AffiliateCommission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AffiliateCommission" (
    id text NOT NULL,
    "refCode" text NOT NULL,
    "referrerId" text NOT NULL,
    "referredUserId" text NOT NULL,
    event text NOT NULL,
    "amountCents" integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "voidReason" text,
    "holdUntil" timestamp(3) without time zone,
    "orderId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AffiliateCommission" OWNER TO postgres;

--
-- Name: AffiliateNotificationPreferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AffiliateNotificationPreferences" (
    id text NOT NULL,
    "referrerId" text NOT NULL,
    "emailOnPayout" boolean DEFAULT true NOT NULL,
    "emailOnCommissionEarned" boolean DEFAULT true NOT NULL,
    "emailOnCommissionPayable" boolean DEFAULT true NOT NULL,
    "emailWeeklySummary" boolean DEFAULT false NOT NULL,
    "emailMonthlySummary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AffiliateNotificationPreferences" OWNER TO postgres;

--
-- Name: AffiliatePayout; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AffiliatePayout" (
    id text NOT NULL,
    "referrerId" text NOT NULL,
    "amountCents" integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    provider text DEFAULT 'stripe_connect'::text NOT NULL,
    "transferId" text,
    "failureReason" text,
    "payoutMethod" text DEFAULT 'stripe_connect'::text,
    "estimatedArrivalDate" timestamp(3) without time zone,
    "actualArrivalDate" timestamp(3) without time zone,
    "feesCents" integer DEFAULT 0 NOT NULL,
    "netAmountCents" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AffiliatePayout" OWNER TO postgres;

--
-- Name: AffiliatePayoutPreferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AffiliatePayoutPreferences" (
    id text NOT NULL,
    "referrerId" text NOT NULL,
    "minPayoutThresholdCents" integer DEFAULT 5000 NOT NULL,
    "payoutFrequency" text DEFAULT 'auto'::text NOT NULL,
    "autoPayoutEnabled" boolean DEFAULT true NOT NULL,
    "payoutDayOfMonth" integer,
    "payoutDayOfWeek" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AffiliatePayoutPreferences" OWNER TO postgres;

--
-- Name: AffiliateReferrer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AffiliateReferrer" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "refCode" text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "stripeConnectAccountId" text,
    "lastPayoutDate" timestamp(3) without time zone,
    "lifetimeEarningsCents" integer DEFAULT 0 NOT NULL,
    "lifetimePaidOutCents" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AffiliateReferrer" OWNER TO postgres;

--
-- Name: AuthorizationCode; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuthorizationCode" (
    code text NOT NULL,
    "clientId" text NOT NULL,
    "redirectUri" text NOT NULL,
    scope text NOT NULL,
    nonce text,
    state text NOT NULL,
    "codeChallenge" text,
    "codeChallengeMethod" text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuthorizationCode" OWNER TO postgres;

--
-- Name: BannedDevice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BannedDevice" (
    "deviceId" text NOT NULL,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."BannedDevice" OWNER TO postgres;

--
-- Name: BannedEmail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BannedEmail" (
    email text NOT NULL,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."BannedEmail" OWNER TO postgres;

--
-- Name: BannedUser; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BannedUser" (
    "userId" text NOT NULL,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."BannedUser" OWNER TO postgres;

--
-- Name: ChatGPTAssessmentResult; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChatGPTAssessmentResult" (
    id text NOT NULL,
    "assessmentId" text NOT NULL,
    "overallScore" integer NOT NULL,
    percentile integer NOT NULL,
    scores jsonb NOT NULL,
    "categoryScores" jsonb NOT NULL,
    recommendations jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChatGPTAssessmentResult" OWNER TO postgres;

--
-- Name: CreditTransaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CreditTransaction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    amount integer NOT NULL,
    type text NOT NULL,
    reference text,
    "balanceAfter" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CreditTransaction" OWNER TO postgres;

--
-- Name: EmailTemplate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmailTemplate" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    type public."EmailTemplateType" NOT NULL,
    category text,
    subject text NOT NULL,
    preheader text,
    html text NOT NULL,
    "plainText" text,
    variables jsonb,
    metadata jsonb,
    version integer DEFAULT 1 NOT NULL,
    "parentId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."EmailTemplate" OWNER TO postgres;

--
-- Name: EmailTemplateVersion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmailTemplateVersion" (
    id text NOT NULL,
    "templateId" text NOT NULL,
    version integer NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    preheader text,
    html text NOT NULL,
    "plainText" text,
    variables jsonb,
    metadata jsonb,
    "changeDescription" text,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."EmailTemplateVersion" OWNER TO postgres;

--
-- Name: MagicLinkToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MagicLinkToken" (
    email text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."MagicLinkToken" OWNER TO postgres;

--
-- Name: OAuthToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OAuthToken" (
    id text NOT NULL,
    "clientId" text NOT NULL,
    "accessToken" text NOT NULL,
    "refreshToken" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OAuthToken" OWNER TO postgres;

--
-- Name: PDFStyle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PDFStyle" (
    id text NOT NULL,
    name text NOT NULL,
    css text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PDFStyle" OWNER TO postgres;

--
-- Name: TrialSession; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TrialSession" (
    id text NOT NULL,
    "childAge" integer NOT NULL,
    "relationshipType" text NOT NULL,
    status text DEFAULT 'started'::text NOT NULL,
    questions jsonb NOT NULL,
    answers jsonb NOT NULL,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TrialSession" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: ai_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_reports (
    id text NOT NULL,
    "assessmentId" text NOT NULL,
    content text NOT NULL,
    summary text,
    "riskLevel" public."RiskLevel" NOT NULL,
    "generatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "generatedByUserId" text NOT NULL,
    "reportOptions" jsonb NOT NULL,
    "pdfPath" text,
    "pdfSize" integer,
    "emailsSent" integer DEFAULT 0 NOT NULL,
    "lastAccessedAt" timestamp(3) without time zone,
    "isArchived" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.ai_reports OWNER TO postgres;

--
-- Name: assessment_template_domains; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessment_template_domains (
    id text NOT NULL,
    "assessmentTemplateId" text NOT NULL,
    "domainTemplateId" text NOT NULL,
    "order" integer NOT NULL,
    "isRequired" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.assessment_template_domains OWNER TO postgres;

--
-- Name: assessment_template_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessment_template_versions (
    id text NOT NULL,
    "assessmentTemplateId" text NOT NULL,
    version integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    instructions text,
    "isActive" boolean NOT NULL,
    "domainSnapshot" jsonb NOT NULL,
    "changeDescription" text,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.assessment_template_versions OWNER TO postgres;

--
-- Name: assessment_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessment_templates (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    instructions text,
    "isActive" boolean DEFAULT true NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.assessment_templates OWNER TO postgres;

--
-- Name: assessments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessments (
    id text NOT NULL,
    "userId" text,
    "subjectName" text NOT NULL,
    status public."AssessmentStatus" DEFAULT 'IN_PROGRESS'::public."AssessmentStatus" NOT NULL,
    mode public."AssessmentMode" DEFAULT 'TRIAL'::public."AssessmentMode" NOT NULL,
    "sessionId" text,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "paidAt" timestamp(3) without time zone,
    "currentDomain" public."AssessmentDomain",
    "currentQuestionOrder" integer,
    "shortId" text,
    "assessmentTemplateId" text,
    "isConversational" boolean DEFAULT false NOT NULL,
    "hasEnhancedReport" boolean DEFAULT false NOT NULL,
    "enhancedReportPurchasedAt" timestamp(3) without time zone,
    "aiReportGenerated" boolean DEFAULT false NOT NULL,
    "childResponses" jsonb,
    "enhancedAnalysis" jsonb,
    childprofileid text,
    "affiliateRefCode" text
);


ALTER TABLE public.assessments OWNER TO postgres;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_messages (
    id text NOT NULL,
    "assessmentId" text,
    "sessionId" text,
    role public."MessageRole" NOT NULL,
    content text NOT NULL,
    sources jsonb,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.chat_messages OWNER TO postgres;

--
-- Name: chat_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_sessions (
    id text NOT NULL,
    title text NOT NULL,
    type public."ChatSessionType" NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.chat_sessions OWNER TO postgres;

--
-- Name: child_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.child_profiles (
    id text DEFAULT gen_random_uuid() NOT NULL,
    userid text NOT NULL,
    name text,
    birthdate timestamp(6) without time zone,
    gradeband text,
    createdat timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updatedat timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.child_profiles OWNER TO postgres;

--
-- Name: classrooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.classrooms (
    id text NOT NULL,
    "schoolId" text NOT NULL,
    name text NOT NULL,
    "gradeLevel" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.classrooms OWNER TO postgres;

--
-- Name: conversational_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversational_sessions (
    id text NOT NULL,
    "assessmentId" text NOT NULL,
    "userId" text,
    "currentQuestionIndex" integer DEFAULT 0 NOT NULL,
    responses jsonb NOT NULL,
    messages jsonb NOT NULL,
    "isComplete" boolean DEFAULT false NOT NULL,
    "isTrial" boolean DEFAULT false NOT NULL,
    questions jsonb NOT NULL,
    "totalTokenUsage" jsonb,
    "clarificationAttempts" integer DEFAULT 0 NOT NULL,
    "lastSubmittedAt" timestamp(3) without time zone,
    "submissionCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.conversational_sessions OWNER TO postgres;

--
-- Name: conversational_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversational_submissions (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    "questionId" text NOT NULL,
    "questionIndex" integer NOT NULL,
    "userResponse" text NOT NULL,
    "extractedAnswer" boolean,
    confidence double precision NOT NULL,
    "wasRecorded" boolean DEFAULT false NOT NULL,
    "tokenUsage" jsonb,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.conversational_submissions OWNER TO postgres;

--
-- Name: district_audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.district_audit_logs (
    id text NOT NULL,
    "districtId" text,
    "studentId" text,
    "userId" text NOT NULL,
    action text NOT NULL,
    "resourceId" text,
    metadata jsonb,
    "ipAddress" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.district_audit_logs OWNER TO postgres;

--
-- Name: districts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.districts (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    "organizationId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "ferpaComplianceDate" timestamp(3) without time zone,
    settings jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.districts OWNER TO postgres;

--
-- Name: document_chunks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_chunks (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category public."DocumentCategory" NOT NULL,
    "chunkIndex" integer NOT NULL,
    embedding public.vector,
    "documentId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.document_chunks OWNER TO postgres;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id text NOT NULL,
    title text NOT NULL,
    "fileName" text NOT NULL,
    "fileType" text NOT NULL,
    "fileSize" integer NOT NULL,
    category public."DocumentCategory" DEFAULT 'OTHER'::public."DocumentCategory" NOT NULL,
    content text,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: domain_template_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.domain_template_versions (
    id text NOT NULL,
    "domainTemplateId" text NOT NULL,
    version integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    questions jsonb NOT NULL,
    resources jsonb,
    "scoringConfig" jsonb,
    "changeDescription" text,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.domain_template_versions OWNER TO postgres;

--
-- Name: domain_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.domain_templates (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    questions jsonb NOT NULL,
    resources jsonb,
    "scoringConfig" jsonb NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.domain_templates OWNER TO postgres;

--
-- Name: email_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_logs (
    id text NOT NULL,
    "userId" text,
    "recipientEmail" text NOT NULL,
    "emailType" text NOT NULL,
    subject text NOT NULL,
    status text NOT NULL,
    "messageId" text,
    "errorMessage" text,
    "templateId" text,
    "templateVersion" integer,
    "sentAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.email_logs OWNER TO postgres;

--
-- Name: feature_flags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feature_flags (
    id text NOT NULL,
    key text NOT NULL,
    "displayName" text NOT NULL,
    description text,
    scope text DEFAULT 'global'::text NOT NULL,
    "isEnabled" boolean DEFAULT false NOT NULL,
    "enabledForRoles" text[] DEFAULT ARRAY[]::text[],
    "enabledForOrgs" text[] DEFAULT ARRAY[]::text[],
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.feature_flags OWNER TO postgres;

--
-- Name: licenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.licenses (
    id text NOT NULL,
    "licenseKey" text NOT NULL,
    type public."LicenseType" NOT NULL,
    status public."LicenseStatus" DEFAULT 'ACTIVE'::public."LicenseStatus" NOT NULL,
    "maxUsers" integer DEFAULT 1 NOT NULL,
    "maxAssessments" integer,
    features jsonb,
    "validFrom" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "validUntil" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "organizationId" text,
    "maxConversationalReports" integer,
    "maxConversationalAssessments" integer
);


ALTER TABLE public.licenses OWNER TO postgres;

--
-- Name: login_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_tokens (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.login_tokens OWNER TO postgres;

--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_preferences (
    id text NOT NULL,
    "userId" text NOT NULL,
    "assessmentComplete" boolean DEFAULT true NOT NULL,
    "assessmentShared" boolean DEFAULT true NOT NULL,
    "licenseExpiring" boolean DEFAULT true NOT NULL,
    "licenseRenewed" boolean DEFAULT true NOT NULL,
    "newRecommendation" boolean DEFAULT true NOT NULL,
    "weeklySummary" boolean DEFAULT false NOT NULL,
    "monthlySummary" boolean DEFAULT false NOT NULL,
    "accountUpdate" boolean DEFAULT true NOT NULL,
    "securityAlert" boolean DEFAULT true NOT NULL,
    "productUpdates" boolean DEFAULT false NOT NULL,
    "marketingEmails" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_preferences OWNER TO postgres;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations (
    id text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    "billingEmail" text,
    "taxId" text,
    industry text,
    "employeeCount" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "customDomain" text,
    logo text,
    "primaryColor" text,
    "secondaryColor" text,
    "headerTitle" text,
    "footerText" text
);


ALTER TABLE public.organizations OWNER TO postgres;

--
-- Name: passkey_challenges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.passkey_challenges (
    id text NOT NULL,
    "userId" text NOT NULL,
    challenge text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.passkey_challenges OWNER TO postgres;

--
-- Name: passkeys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.passkeys (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    "credentialId" text NOT NULL,
    "publicKey" text NOT NULL,
    counter bigint NOT NULL,
    transports text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastUsed" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.passkeys OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "userId" text,
    "stripePaymentIntentId" text NOT NULL,
    "stripeCustomerId" text,
    amount integer NOT NULL,
    currency text DEFAULT 'usd'::text NOT NULL,
    status text NOT NULL,
    "planType" text,
    plan text,
    "childName" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: platform_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_settings (
    id text NOT NULL,
    "globalTrialAssessmentId" text,
    "globalRegularAssessmentId" text,
    "maintenanceMode" boolean DEFAULT false NOT NULL,
    "registrationEnabled" boolean DEFAULT true NOT NULL,
    "trialAssessmentsEnabled" boolean DEFAULT true NOT NULL,
    "aiReportsEnabled" boolean DEFAULT true NOT NULL,
    "maxAiReportsPerUser" integer DEFAULT 10 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "updatedBy" text NOT NULL,
    "emailSendingEnabled" boolean DEFAULT true NOT NULL,
    "sesMonthlyBudget" numeric(65,30) DEFAULT 5.00 NOT NULL,
    "maxConversationalSessionsPerUser" integer DEFAULT 10 NOT NULL
);


ALTER TABLE public.platform_settings OWNER TO postgres;

--
-- Name: question_responses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_responses (
    id text NOT NULL,
    "assessmentId" text NOT NULL,
    "questionId" text NOT NULL,
    response text NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.question_responses OWNER TO postgres;

--
-- Name: question_sets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_sets (
    id text NOT NULL,
    domain public."AssessmentDomain" NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "order" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "clinicallySignificantScore" integer,
    "displayName" text,
    "multiPartLogic" jsonb,
    prerequisites jsonb,
    "skipConditions" jsonb,
    "totalPossibleScore" integer
);


ALTER TABLE public.question_sets OWNER TO postgres;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    id text NOT NULL,
    "questionSetId" text NOT NULL,
    text text NOT NULL,
    "order" integer NOT NULL,
    "isGatingQuestion" boolean DEFAULT false NOT NULL,
    weight integer DEFAULT 1 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isTrial" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- Name: recommendations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recommendations (
    id text NOT NULL,
    "assessmentId" text NOT NULL,
    "userId" text,
    title text NOT NULL,
    content text NOT NULL,
    category text,
    priority integer DEFAULT 1 NOT NULL,
    "isBookmarked" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.recommendations OWNER TO postgres;

--
-- Name: resource_library; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_library (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    url text NOT NULL,
    category text NOT NULL,
    tags text[],
    "isActive" boolean DEFAULT true NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.resource_library OWNER TO postgres;

--
-- Name: schools; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schools (
    id text NOT NULL,
    "districtId" text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.schools OWNER TO postgres;

--
-- Name: scores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scores (
    id text NOT NULL,
    "assessmentId" text NOT NULL,
    domain public."AssessmentDomain",
    "domainTemplateId" text,
    "domainName" text,
    "rawScore" double precision NOT NULL,
    "riskLevel" public."RiskLevel" NOT NULL,
    confidence double precision NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "questionsAnswered" integer NOT NULL,
    "totalPossible" integer NOT NULL,
    "wasTerminatedEarly" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.scores OWNER TO postgres;

--
-- Name: ses_monthly_totals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ses_monthly_totals (
    id text NOT NULL,
    month date NOT NULL,
    "totalEmailsSent" integer DEFAULT 0 NOT NULL,
    "totalCost" numeric(10,6) DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.ses_monthly_totals OWNER TO postgres;

--
-- Name: ses_usage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ses_usage (
    id text NOT NULL,
    "emailsSent" integer DEFAULT 1 NOT NULL,
    "estimatedCost" numeric(10,6) NOT NULL,
    recipient text,
    "emailType" text,
    "sentAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ses_usage OWNER TO postgres;

--
-- Name: shareable_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shareable_links (
    id text NOT NULL,
    "shareCode" text NOT NULL,
    "assessmentId" text NOT NULL,
    "createdById" text NOT NULL,
    privacy public."ShareLinkPrivacy" DEFAULT 'PRIVATE'::public."ShareLinkPrivacy" NOT NULL,
    password text,
    "expiresAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.shareable_links OWNER TO postgres;

--
-- Name: snapshot_full_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.snapshot_full_reports (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "reportJson" jsonb NOT NULL,
    "pdfUrl" text,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.snapshot_full_reports OWNER TO postgres;

--
-- Name: snapshot_leads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.snapshot_leads (
    id text NOT NULL,
    email text NOT NULL,
    "consentMarketing" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "sessionId" text NOT NULL
);


ALTER TABLE public.snapshot_leads OWNER TO postgres;

--
-- Name: snapshot_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.snapshot_orders (
    id text NOT NULL,
    "leadId" text,
    "sessionId" text,
    amount integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "stripePaymentIntent" text NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.snapshot_orders OWNER TO postgres;

--
-- Name: snapshot_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.snapshot_sessions (
    id text NOT NULL,
    anonymous boolean DEFAULT false NOT NULL,
    consented boolean DEFAULT false NOT NULL,
    region text,
    utm jsonb,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.snapshot_sessions OWNER TO postgres;

--
-- Name: snapshot_trials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.snapshot_trials (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    "childFirstName" text,
    "ageBand" text,
    "gradeBand" text,
    region text,
    responses jsonb,
    "scoreSnapshot" jsonb,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.snapshot_trials OWNER TO postgres;

--
-- Name: student_assessments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_assessments (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "assessmentId" text NOT NULL,
    "isTrial" boolean DEFAULT true NOT NULL,
    "trialCompletedAt" timestamp(3) without time zone,
    "fullCompletedAt" timestamp(3) without time zone,
    "pdfUrl" text,
    "shareLinkId" text,
    "reviewedAt" timestamp(3) without time zone,
    "reviewedBy" text,
    "flaggedDomains" text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.student_assessments OWNER TO postgres;

--
-- Name: student_classrooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_classrooms (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "classroomId" text NOT NULL,
    "enrolledAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.student_classrooms OWNER TO postgres;

--
-- Name: student_recommendations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_recommendations (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "assessmentId" text NOT NULL,
    summary text NOT NULL,
    "schoolStrategies" jsonb NOT NULL,
    "classroomAccommodations" jsonb NOT NULL,
    "parentNextSteps" jsonb NOT NULL,
    "referralGuidance" text,
    "generatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "generatedBy" text
);


ALTER TABLE public.student_recommendations OWNER TO postgres;

--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    id text NOT NULL,
    "districtId" text NOT NULL,
    "schoolId" text,
    "anonymousId" text NOT NULL,
    "firstName" text,
    "lastName" text,
    "gradeLevel" text,
    "birthDate" timestamp(3) without time zone,
    "consentGiven" boolean DEFAULT false NOT NULL,
    "consentDate" timestamp(3) without time zone,
    "isAnonymous" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.students OWNER TO postgres;

--
-- Name: sub_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sub_accounts (
    id text NOT NULL,
    "userId" text NOT NULL,
    "managedByUserId" text NOT NULL,
    "organizationId" text NOT NULL,
    "displayName" text NOT NULL,
    description text,
    "maxAssessments" integer,
    "maxUsers" integer DEFAULT 1 NOT NULL,
    settings jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sub_accounts OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "stripeSubscriptionId" text,
    "stripeCustomerId" text,
    status public."SubscriptionStatus" DEFAULT 'TRIALING'::public."SubscriptionStatus" NOT NULL,
    "priceId" text,
    quantity integer DEFAULT 1 NOT NULL,
    "currentPeriodStart" timestamp(3) without time zone,
    "currentPeriodEnd" timestamp(3) without time zone,
    "trialStart" timestamp(3) without time zone,
    "trialEnd" timestamp(3) without time zone,
    "cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
    "cancelAt" timestamp(3) without time zone,
    "canceledAt" timestamp(3) without time zone,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: teacher_classrooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teacher_classrooms (
    id text NOT NULL,
    "teacherId" text NOT NULL,
    "classroomId" text NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.teacher_classrooms OWNER TO postgres;

--
-- Name: teachers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teachers (
    id text NOT NULL,
    "userId" text NOT NULL,
    "districtId" text NOT NULL,
    "employeeId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.teachers OWNER TO postgres;

--
-- Name: telemetry_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.telemetry_events (
    id text DEFAULT gen_random_uuid() NOT NULL,
    user_id text,
    event text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text
);


ALTER TABLE public.telemetry_events OWNER TO postgres;

--
-- Name: termination_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.termination_rules (
    id text NOT NULL,
    "questionSetId" text NOT NULL,
    name text NOT NULL,
    description text,
    "minimumYesToContinue" integer NOT NULL,
    "checkAfterQuestion" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.termination_rules OWNER TO postgres;

--
-- Name: usage_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usage_metrics (
    id text NOT NULL,
    "userId" text NOT NULL,
    date date DEFAULT CURRENT_TIMESTAMP NOT NULL,
    assessments integer DEFAULT 0 NOT NULL,
    "pdfReports" integer DEFAULT 0 NOT NULL,
    "apiCalls" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.usage_metrics OWNER TO postgres;

--
-- Name: user_licenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_licenses (
    id text NOT NULL,
    "userId" text NOT NULL,
    "licenseId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "assignedBy" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "assessmentsAllowed" integer DEFAULT 0 NOT NULL,
    "assessmentsUsed" integer DEFAULT 0 NOT NULL,
    "conversationalReportsAllowed" integer DEFAULT 0 NOT NULL,
    "conversationalReportsUsed" integer DEFAULT 0 NOT NULL,
    "lastCreditsRefreshedAt" timestamp(6) with time zone
);


ALTER TABLE public.user_licenses OWNER TO postgres;

--
-- Name: user_upsell_state; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_upsell_state (
    id text DEFAULT gen_random_uuid() NOT NULL,
    "userId" text NOT NULL,
    "ribbonSnoozedUntil" timestamp(3) without time zone,
    "ribbonSnoozedAt" timestamp(3) without time zone,
    "ribbonSnoozeSource" text,
    "anonymousModeDefault" boolean DEFAULT false NOT NULL,
    "pausedUntil" timestamp(3) without time zone,
    "pausedAt" timestamp(3) without time zone,
    "pauseCount12m" integer DEFAULT 0 NOT NULL,
    "pauseHistory" jsonb,
    "pendingAction" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_upsell_state OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    password text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "firstPaidReportAt" timestamp(3) without time zone,
    "organizationId" text,
    "parentUserId" text,
    "onboardingCompleted" boolean DEFAULT false NOT NULL,
    "onboardingStep" integer DEFAULT 0 NOT NULL,
    "onboardingSkipped" boolean DEFAULT false NOT NULL,
    "stripeCustomerId" character varying,
    "avatarUrl" text,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "emailVerificationToken" text,
    "emailVerificationTokenExpiresAt" timestamp(3) without time zone,
    "pendingEmail" text,
    credits integer DEFAULT 0 NOT NULL,
    "isDeactivated" boolean DEFAULT false NOT NULL,
    "deactivatedAt" timestamp(3) without time zone,
    "deletionRequestedAt" timestamp(3) without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE storage.prefixes OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	dc71b9f0-f8f1-4635-8c4f-8c6b16f5bfad	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@example.com","user_id":"c6f421a2-885a-45fb-9921-c790282b8e93","user_phone":""}}	2025-10-06 19:50:57.008184+00	
00000000-0000-0000-0000-000000000000	546c5868-1f91-4409-a99d-aa6b050bdd14	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"user@example.com","user_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","user_phone":""}}	2025-10-06 19:50:57.744765+00	
00000000-0000-0000-0000-000000000000	80dc0447-0278-4d0c-affb-5d547615ebfc	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-06 19:50:57.951152+00	
00000000-0000-0000-0000-000000000000	699adf26-3465-4441-898b-a116e766546b	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"test@example.com","user_id":"4bfddc9b-9328-49f1-8116-db50d3febc4b","user_phone":""}}	2025-10-06 19:50:58.309233+00	
00000000-0000-0000-0000-000000000000	2ed99243-31cd-4326-83d8-d7940a23b62e	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-06 20:11:33.194808+00	
00000000-0000-0000-0000-000000000000	858dffef-e689-4de0-a460-6065376f7fab	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-06 20:11:41.859187+00	
00000000-0000-0000-0000-000000000000	e8032ddf-dc4d-4c13-82d5-06bdd364e26b	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"recovery"}}	2025-10-06 20:11:42.453586+00	
00000000-0000-0000-0000-000000000000	0cb14aca-3089-4284-a57c-2e8a98305da3	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 00:32:41.937321+00	
00000000-0000-0000-0000-000000000000	a8f27382-e5bd-475f-b4f7-7e64bd0aba62	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 00:32:41.950226+00	
00000000-0000-0000-0000-000000000000	f5040155-fbcc-4d7a-9845-d8c9d41cdedc	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 00:32:45.965381+00	
00000000-0000-0000-0000-000000000000	6152fe6a-8510-483e-ad57-a90a60f8d4f6	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 00:41:56.329797+00	
00000000-0000-0000-0000-000000000000	cdeb35a0-4d95-44f3-912c-308535468147	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 02:15:36.921722+00	
00000000-0000-0000-0000-000000000000	a69f9a83-b1e7-44ef-b2e9-eb18402162c4	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 02:15:36.942465+00	
00000000-0000-0000-0000-000000000000	c5a1487e-b41e-4e74-828e-b694b164bc50	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 02:47:20.917021+00	
00000000-0000-0000-0000-000000000000	c1773676-13ba-42f6-89f0-8fefe678ce97	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 02:47:29.057409+00	
00000000-0000-0000-0000-000000000000	c5e1e4c1-fa18-4ff5-823e-fc8e7d6cfcbb	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-07 02:47:29.622775+00	
00000000-0000-0000-0000-000000000000	23d850fa-988e-4072-b00f-79f8d0c22834	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 16:34:58.770027+00	
00000000-0000-0000-0000-000000000000	25ab1c3a-82e1-441a-b4b3-1451ce335611	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 02:48:44.60142+00	
00000000-0000-0000-0000-000000000000	40f472bb-32d1-496c-bfe2-978dfca72093	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 02:48:53.025614+00	
00000000-0000-0000-0000-000000000000	121d7665-91d8-402b-9b5c-5832aebb26e6	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"recovery"}}	2025-10-07 02:48:53.693096+00	
00000000-0000-0000-0000-000000000000	25be12dc-4471-4691-b7ec-aff34dbe1608	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 03:43:25.93543+00	
00000000-0000-0000-0000-000000000000	933344df-202d-4954-9823-0dbb0407c3d4	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 03:43:35.224319+00	
00000000-0000-0000-0000-000000000000	7c12ec1a-be59-4f16-a61b-37abb77b1dc5	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 03:47:15.842505+00	
00000000-0000-0000-0000-000000000000	eab124b5-f4f7-405e-95ed-730b1a6b0229	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 03:47:23.23841+00	
00000000-0000-0000-0000-000000000000	439ca37b-da8d-432b-a3e6-3af159b3937b	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 03:47:23.392752+00	
00000000-0000-0000-0000-000000000000	c1a2eca8-5f26-432a-84af-5e7e0b5808b8	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 03:47:23.393562+00	
00000000-0000-0000-0000-000000000000	1e55be55-8ad5-44dd-a8b6-8e1749f1a25a	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 03:47:23.915001+00	
00000000-0000-0000-0000-000000000000	eafc4a17-c85d-4291-b93b-ecc7c3700d35	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-07 03:47:23.972334+00	
00000000-0000-0000-0000-000000000000	ab8250f3-1dc7-4b53-a867-7c3825d63f3f	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 03:48:23.902342+00	
00000000-0000-0000-0000-000000000000	313e2ce2-96f9-4378-9c7e-9b58fb0f3c27	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 03:48:30.498805+00	
00000000-0000-0000-0000-000000000000	10d6438f-155f-46a0-8a1f-42b73761f403	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-11 17:19:40.779911+00	
00000000-0000-0000-0000-000000000000	7c0a14f9-bcd3-44e2-a7cb-1a67c783fa53	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"recovery"}}	2025-10-07 03:48:30.978992+00	
00000000-0000-0000-0000-000000000000	c1da7c31-2ae1-4cdb-822e-689f252ce93c	{"action":"user_updated_password","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 03:48:39.5258+00	
00000000-0000-0000-0000-000000000000	d568511a-4597-4560-a1a9-8fb97b93a778	{"action":"user_modified","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 03:48:39.52646+00	
00000000-0000-0000-0000-000000000000	35ae7cc3-97a9-4366-968c-5c27c560396e	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-07 03:49:03.280605+00	
00000000-0000-0000-0000-000000000000	a223f43b-f134-495e-af2e-402a3be647f6	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 16:37:16.76108+00	
00000000-0000-0000-0000-000000000000	f26611c3-56e4-4820-bdc8-442a12506cfe	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-22 17:05:10.343568+00	
00000000-0000-0000-0000-000000000000	35982c00-5450-40f0-b1c3-cf1e12bfd7ff	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 03:51:06.828875+00	
00000000-0000-0000-0000-000000000000	4749b896-5118-47eb-ab52-eb30bf01d5bd	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 03:51:15.158161+00	
00000000-0000-0000-0000-000000000000	6857ef35-d899-470b-9f6b-15f66d41dfcb	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-07 03:51:15.702819+00	
00000000-0000-0000-0000-000000000000	945a1bcc-20ba-401d-85b6-83ffa6c2da47	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 17:05:17.161597+00	
00000000-0000-0000-0000-000000000000	1b126d3c-04da-4acc-bd38-4b20604d97a7	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-22 17:06:10.258315+00	
00000000-0000-0000-0000-000000000000	b16f5029-6302-478d-ab3f-29d4d632950c	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 03:52:07.251142+00	
00000000-0000-0000-0000-000000000000	c83e8579-aa03-448b-b19a-3bd78bf52789	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 03:52:14.140588+00	
00000000-0000-0000-0000-000000000000	6e5b7a09-14c3-496b-9e3e-6f826ec7f38e	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"recovery"}}	2025-10-07 03:52:14.638213+00	
00000000-0000-0000-0000-000000000000	3c3f6945-cf4a-4f0d-a828-bb6ed6b2b2cf	{"action":"user_updated_password","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 03:52:47.507864+00	
00000000-0000-0000-0000-000000000000	e259f9a4-c418-40b5-9da7-2a2f257a2864	{"action":"user_modified","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 03:52:47.524008+00	
00000000-0000-0000-0000-000000000000	a0533e62-d2a0-451b-ac3b-8ca175948b97	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 03:54:39.890284+00	
00000000-0000-0000-0000-000000000000	fa239b3a-7f55-4cc6-8218-7e1f0d4de94b	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 03:54:50.947837+00	
00000000-0000-0000-0000-000000000000	02a5605a-9a92-443c-87b3-afbd193fc9b0	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-07 03:54:51.486459+00	
00000000-0000-0000-0000-000000000000	c3e4cc33-3eea-47db-904d-e05f47d0468a	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 03:59:51.66206+00	
00000000-0000-0000-0000-000000000000	52ca0a9b-e485-4964-8c3f-f88b82c249d9	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 03:59:58.55332+00	
00000000-0000-0000-0000-000000000000	17775191-023a-40df-afb5-e30853201584	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-07 03:59:59.27129+00	
00000000-0000-0000-0000-000000000000	358fb0d6-a411-4778-88b3-645fe54a3fea	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 04:01:53.304944+00	
00000000-0000-0000-0000-000000000000	a429b2cb-3a81-42f3-92c8-fc874ce52914	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 04:02:06.076276+00	
00000000-0000-0000-0000-000000000000	6fd4fbe7-c05c-4a6e-8a07-dfdf666687da	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 14:45:29.189142+00	
00000000-0000-0000-0000-000000000000	375a741c-2ca4-4d03-9f51-a5aa0455813e	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 14:45:29.214988+00	
00000000-0000-0000-0000-000000000000	ed37e0d0-06ee-4bf6-8df1-265e230d688a	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 14:45:31.36155+00	
00000000-0000-0000-0000-000000000000	9d57d4aa-65cc-49f4-be10-0433e219049a	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 14:45:37.546412+00	
00000000-0000-0000-0000-000000000000	b6c4a472-1542-4677-8ef8-de384cbf44ce	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 14:45:45.317512+00	
00000000-0000-0000-0000-000000000000	8929202b-846e-411b-9d4a-ff980b9c5a3a	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 14:45:45.502287+00	
00000000-0000-0000-0000-000000000000	429a4cbb-dadb-4f97-b725-442e9b5b83b3	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-07 14:45:46.315452+00	
00000000-0000-0000-0000-000000000000	61bce9cc-affc-418b-bb85-e330efe9b820	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 14:45:54.02788+00	
00000000-0000-0000-0000-000000000000	acb17bee-c717-490a-b98c-8cee280da4cd	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 14:52:36.465056+00	
00000000-0000-0000-0000-000000000000	be0a21aa-9c8d-4bbc-ab4d-fd02afe035c0	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 14:52:59.321118+00	
00000000-0000-0000-0000-000000000000	d6c4b827-5c93-4f2d-a993-d2fd984814df	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 16:38:54.265585+00	
00000000-0000-0000-0000-000000000000	2c4b75c7-1d56-4c8b-bf6e-bc4199dc202b	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 14:53:07.022861+00	
00000000-0000-0000-0000-000000000000	372231be-be68-4b7e-bf78-0186bfbfc315	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 14:53:07.187046+00	
00000000-0000-0000-0000-000000000000	15023d19-2c14-450f-94ec-d1de1c18687a	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 14:53:16.444664+00	
00000000-0000-0000-0000-000000000000	9ddc0784-b07b-4011-9ba2-8aa40c4ac86a	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 14:53:24.564035+00	
00000000-0000-0000-0000-000000000000	af8c9dd3-f4bc-4eaa-ae1c-e469e28aa8b4	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 14:54:02.775406+00	
00000000-0000-0000-0000-000000000000	5e44c1c3-c35c-4163-b5c7-ec85fd56d6d5	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 14:54:18.059385+00	
00000000-0000-0000-0000-000000000000	98a54ebf-c96b-4e19-a697-67b628e1af00	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 14:54:18.229436+00	
00000000-0000-0000-0000-000000000000	a22f897f-c7e8-4487-97c9-df277f1e46d3	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 14:59:12.057631+00	
00000000-0000-0000-0000-000000000000	58d5234b-ddcf-4329-bb2f-c94826b95de3	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 14:59:20.229714+00	
00000000-0000-0000-0000-000000000000	93ed2675-d0c5-4a1c-bd02-0feb657ea76e	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 14:59:20.40395+00	
00000000-0000-0000-0000-000000000000	62ae250e-0a94-4825-83f5-5351f03a188c	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 14:59:22.404187+00	
00000000-0000-0000-0000-000000000000	081676b3-99f0-4560-a285-2db40ec6f89f	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 14:59:22.581788+00	
00000000-0000-0000-0000-000000000000	b2ab73e3-4363-4ba6-9656-2a17987d54a3	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 14:59:23.190417+00	
00000000-0000-0000-0000-000000000000	15030262-22d7-45a7-921a-cdce3629df84	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 14:59:23.266557+00	
00000000-0000-0000-0000-000000000000	985e3b44-d045-4974-9265-a6011b7c94e3	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 16:12:51.458321+00	
00000000-0000-0000-0000-000000000000	ec80858e-6962-4b44-86de-f0b5418da222	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 16:12:51.484684+00	
00000000-0000-0000-0000-000000000000	9539da65-6c67-4873-a72b-e4518df669eb	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 16:12:59.350384+00	
00000000-0000-0000-0000-000000000000	e8755ff9-92ce-49b2-86f7-daef81fbccaf	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-07 16:12:59.999089+00	
00000000-0000-0000-0000-000000000000	e8f4b4e3-899b-4478-b366-60954e8d2fcc	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-07 16:13:15.353511+00	
00000000-0000-0000-0000-000000000000	3b4fe1ef-a203-408e-bf8c-25505b2d2e20	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-07 16:16:54.49976+00	
00000000-0000-0000-0000-000000000000	35cec5e1-9f48-4214-801c-46ad0e99b465	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-07 16:40:53.971102+00	
00000000-0000-0000-0000-000000000000	786a58de-6a2e-44a8-8a5c-07c27b53b697	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 16:46:11.087902+00	
00000000-0000-0000-0000-000000000000	ce3373ce-2058-4b22-a957-d8b0b6f4e6d4	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 16:46:19.337543+00	
00000000-0000-0000-0000-000000000000	68196f83-52e2-4a52-8a5e-890799ad2e0a	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 16:46:33.66916+00	
00000000-0000-0000-0000-000000000000	62d071e8-cd7d-494c-a5c8-1168d6291c8e	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-07 16:46:34.334755+00	
00000000-0000-0000-0000-000000000000	aea5e377-e9fc-4ded-8709-613e2c3b7679	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 16:46:42.862676+00	
00000000-0000-0000-0000-000000000000	17441977-af43-4e29-ac09-c4627534dcbb	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 16:56:29.646325+00	
00000000-0000-0000-0000-000000000000	1d057677-927f-4906-abff-5b32c495c6a6	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 16:56:38.705555+00	
00000000-0000-0000-0000-000000000000	c1022181-8451-4551-bc0e-2a136c80ec8b	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"recovery"}}	2025-10-07 16:56:39.118592+00	
00000000-0000-0000-0000-000000000000	10a5a476-2588-4593-b71c-03425be364e7	{"action":"user_updated_password","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 16:56:49.876582+00	
00000000-0000-0000-0000-000000000000	0656c396-dc15-48c4-ba3e-b715340a3945	{"action":"user_modified","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 16:56:49.877695+00	
00000000-0000-0000-0000-000000000000	735725ba-9a68-4572-9c53-87509b7ecc48	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-07 16:57:44.661283+00	
00000000-0000-0000-0000-000000000000	6f4c8ff4-afe2-4b17-9ef4-f8a2609c058f	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 16:57:53.963435+00	
00000000-0000-0000-0000-000000000000	dc369850-7a8e-4209-a477-7019691f6bc9	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"admin@example.com","user_id":"c6f421a2-885a-45fb-9921-c790282b8e93","user_phone":""}}	2025-10-07 16:59:18.700948+00	
00000000-0000-0000-0000-000000000000	f468e786-b9d6-4041-9fd7-ee3e68936ec3	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"user@example.com","user_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","user_phone":""}}	2025-10-07 16:59:18.881009+00	
00000000-0000-0000-0000-000000000000	41794841-2cf1-4e96-9cf1-273de636c2c9	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"test@example.com","user_id":"4bfddc9b-9328-49f1-8116-db50d3febc4b","user_phone":""}}	2025-10-07 16:59:19.048604+00	
00000000-0000-0000-0000-000000000000	286eade8-564f-417f-9c3d-eff09ab04540	{"action":"login","actor_id":"4bfddc9b-9328-49f1-8116-db50d3febc4b","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-07 16:59:43.576537+00	
00000000-0000-0000-0000-000000000000	e5385f18-4f03-4eb9-89aa-2aa72dd00296	{"action":"logout","actor_id":"4bfddc9b-9328-49f1-8116-db50d3febc4b","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 17:00:00.38134+00	
00000000-0000-0000-0000-000000000000	6588459f-6c94-4602-afb1-5af3ca34d01f	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-07 17:00:15.444207+00	
00000000-0000-0000-0000-000000000000	ca50a4fc-b7b4-47c3-a0b1-3d018d794302	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 17:01:49.756592+00	
00000000-0000-0000-0000-000000000000	e63db4ae-a98c-4f71-a336-53a466bf0a71	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 17:02:21.859874+00	
00000000-0000-0000-0000-000000000000	2baa9a73-1517-4e09-8edd-fda8c83e00f6	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 17:02:34.108192+00	
00000000-0000-0000-0000-000000000000	8a3b9ae3-2def-448d-8e9e-608514e9e0e5	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"recovery"}}	2025-10-07 17:02:34.675718+00	
00000000-0000-0000-0000-000000000000	a8f11833-4fdf-4a7c-98f6-8e36e3dff4ff	{"action":"user_updated_password","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 17:02:45.64359+00	
00000000-0000-0000-0000-000000000000	f0625fa1-8c0f-4ff0-a605-f7c413718c78	{"action":"user_modified","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-07 17:02:45.644339+00	
00000000-0000-0000-0000-000000000000	3c49dc1e-98b3-4e05-bf31-14992fa0cae7	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 17:04:02.785556+00	
00000000-0000-0000-0000-000000000000	ce9c3897-5826-411e-9add-573bf7e3c9b4	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-07 17:04:07.887438+00	
00000000-0000-0000-0000-000000000000	457cf4e4-155c-4fc5-9588-ed14e99af4c0	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-07 17:32:46.049333+00	
00000000-0000-0000-0000-000000000000	2824ce61-ae18-4bc1-91a6-531fbbd09cd9	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 18:02:22.327388+00	
00000000-0000-0000-0000-000000000000	d79c1217-707f-4a8c-9732-e77fe9eb4363	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 18:02:22.345414+00	
00000000-0000-0000-0000-000000000000	b7707a89-7be9-4c83-935d-47c9bddb633d	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 19:00:47.429255+00	
00000000-0000-0000-0000-000000000000	8142dcee-ffbf-46da-9ad6-f10e24a5fd05	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 19:00:47.448004+00	
00000000-0000-0000-0000-000000000000	98d486c5-9e6b-423f-a18f-cc8f91655f7b	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-07 19:04:20.90972+00	
00000000-0000-0000-0000-000000000000	9bb68273-f079-42c0-8b4e-2738a8a7833c	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 19:19:06.271594+00	
00000000-0000-0000-0000-000000000000	499ca387-2640-454d-9f7e-c166232a764c	{"action":"login","actor_id":"4bfddc9b-9328-49f1-8116-db50d3febc4b","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-07 19:19:16.118054+00	
00000000-0000-0000-0000-000000000000	a160b761-97ec-4590-bfd4-efeddbcab7fd	{"action":"logout","actor_id":"4bfddc9b-9328-49f1-8116-db50d3febc4b","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 19:29:18.441496+00	
00000000-0000-0000-0000-000000000000	d1f2cfce-c710-415f-946f-0deb602a8b5e	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-07 19:29:25.949215+00	
00000000-0000-0000-0000-000000000000	cbe251fa-5f84-48c0-87b3-20be23b12669	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 19:33:12.144441+00	
00000000-0000-0000-0000-000000000000	224fa00d-f977-4f90-a3f6-6eb93978b654	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-07 19:33:19.993949+00	
00000000-0000-0000-0000-000000000000	96f44a5c-4e95-4463-b1db-2cb26c504f0d	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 21:30:38.835603+00	
00000000-0000-0000-0000-000000000000	6187844a-8c99-4635-b9d1-dfed1f1c2163	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 21:30:38.864961+00	
00000000-0000-0000-0000-000000000000	af406b9d-ef17-4cee-a636-6f33e8eaf0c4	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-07 21:32:51.416108+00	
00000000-0000-0000-0000-000000000000	f2c1f00d-9d8b-4ed9-b184-ca0d7d696095	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-07 21:32:57.544934+00	
00000000-0000-0000-0000-000000000000	1b3af827-afca-443a-9a4c-ed7d8a5cc3b1	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 23:14:53.941106+00	
00000000-0000-0000-0000-000000000000	473a1fb5-44ea-46a6-8f92-8aeb74ad2e86	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-07 23:14:53.95711+00	
00000000-0000-0000-0000-000000000000	6d0d35b0-21c9-4756-a229-c7c28915a192	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-08 00:13:31.917029+00	
00000000-0000-0000-0000-000000000000	87ca162d-fc21-40c8-ba3d-6d3e040e565b	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-08 00:13:31.931884+00	
00000000-0000-0000-0000-000000000000	c0e8f5d6-8eb0-4b7f-8fc4-026bad62ab82	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-08 00:13:32.807459+00	
00000000-0000-0000-0000-000000000000	0ee690f2-9499-486f-a37c-cc796683def7	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-08 00:13:32.92058+00	
00000000-0000-0000-0000-000000000000	9b6c9bf9-77f9-421f-9c5c-02283f6a9243	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-08 00:13:33.232325+00	
00000000-0000-0000-0000-000000000000	ec6a2993-63d8-48cb-b264-1b8320c269a4	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-08 00:13:33.32841+00	
00000000-0000-0000-0000-000000000000	6fdfc77e-9962-4b5e-b166-1f71f27039c3	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-08 00:17:52.237612+00	
00000000-0000-0000-0000-000000000000	fc91911e-5802-43ba-852a-e087a59e99f9	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-08 16:25:49.927833+00	
00000000-0000-0000-0000-000000000000	e3712211-b228-44f1-a7ce-12db957446f2	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-08 16:25:49.953298+00	
00000000-0000-0000-0000-000000000000	11cf79c0-ff48-4f1e-b41c-328b4b5c8b95	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-08 16:43:33.935785+00	
00000000-0000-0000-0000-000000000000	db01d983-d385-4301-b928-f54652dd863c	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-08 17:20:30.198573+00	
00000000-0000-0000-0000-000000000000	06a04736-2c87-4fa9-8e97-6a154620e026	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-08 17:20:51.615817+00	
00000000-0000-0000-0000-000000000000	275713e6-fb47-4aa7-bc84-dcede4c8a79a	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-08 18:48:40.8468+00	
00000000-0000-0000-0000-000000000000	cb6e7e67-a991-41c9-a35c-3f955974c264	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-08 18:49:03.064694+00	
00000000-0000-0000-0000-000000000000	bb5b2bd7-9b99-4b8b-b601-976c52abe58c	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-08 18:55:30.486036+00	
00000000-0000-0000-0000-000000000000	0f285cd1-d3df-420f-86c0-2178424e96a4	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-08 19:55:39.03559+00	
00000000-0000-0000-0000-000000000000	4781dedf-49b8-4e13-acfa-b77f7857cd84	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-08 19:55:39.046726+00	
00000000-0000-0000-0000-000000000000	521ea9f6-8fea-4b67-930c-689c5579c1a3	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"bug@example.com","user_id":"aa580b8e-149c-4a4d-bc1f-655cfe067f11","user_phone":""}}	2025-10-08 19:58:54.813321+00	
00000000-0000-0000-0000-000000000000	6baa075e-e370-4378-a83c-fdd065d9e1b4	{"action":"user_recovery_requested","actor_id":"aa580b8e-149c-4a4d-bc1f-655cfe067f11","actor_username":"bug@example.com","actor_via_sso":false,"log_type":"user"}	2025-10-08 19:58:56.960274+00	
00000000-0000-0000-0000-000000000000	09a3a859-3e74-4055-acd1-ca1328b5f7e9	{"action":"login","actor_id":"aa580b8e-149c-4a4d-bc1f-655cfe067f11","actor_username":"bug@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-08 19:58:57.137542+00	
00000000-0000-0000-0000-000000000000	b9a9b0d2-b59b-412b-a0ec-866f21d53cff	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"bug@example.com","user_id":"aa580b8e-149c-4a4d-bc1f-655cfe067f11","user_phone":""}}	2025-10-08 20:08:59.741579+00	
00000000-0000-0000-0000-000000000000	c3826ce2-83a5-4407-be09-cccc92493a0f	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"bug@example.com","user_id":"2764296a-c04f-4942-9700-082c676e0fbf","user_phone":""}}	2025-10-08 20:09:30.272558+00	
00000000-0000-0000-0000-000000000000	865613f6-1ada-45d7-9996-baec493a4250	{"action":"user_recovery_requested","actor_id":"2764296a-c04f-4942-9700-082c676e0fbf","actor_username":"bug@example.com","actor_via_sso":false,"log_type":"user"}	2025-10-08 20:09:32.617422+00	
00000000-0000-0000-0000-000000000000	354ed95a-2398-4c5c-a327-b91adca21015	{"action":"user_recovery_requested","actor_id":"2764296a-c04f-4942-9700-082c676e0fbf","actor_username":"bug@example.com","actor_via_sso":false,"log_type":"user"}	2025-10-08 20:09:33.754101+00	
00000000-0000-0000-0000-000000000000	7e42fd80-22cb-497d-b4b0-04cf9d912cf4	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"bug@example.com","user_id":"2764296a-c04f-4942-9700-082c676e0fbf","user_phone":""}}	2025-10-08 20:10:23.437257+00	
00000000-0000-0000-0000-000000000000	2a4ca716-6e75-43fb-b725-53e3d755dcd8	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-08 20:10:29.488042+00	
00000000-0000-0000-0000-000000000000	0a93eaa8-c077-4e34-9c8c-bc2d84bd562d	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-08 20:10:33.07324+00	
00000000-0000-0000-0000-000000000000	0c9cf5b9-4f7d-4c9b-8e23-a003dd8bf1a7	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-08 20:10:42.336025+00	
00000000-0000-0000-0000-000000000000	48066ee7-09a7-4ddf-a803-edd90eea5221	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-08 20:10:43.408611+00	
00000000-0000-0000-0000-000000000000	d2b091ad-ec2d-4c3c-9f5b-480a033b1d60	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"bug@example.com","user_id":"2df84793-4848-448d-b582-7585faae3aab","user_phone":""}}	2025-10-08 21:39:56.608011+00	
00000000-0000-0000-0000-000000000000	c2b5bcda-208f-449c-978b-891541178ee9	{"action":"user_recovery_requested","actor_id":"2df84793-4848-448d-b582-7585faae3aab","actor_username":"bug@example.com","actor_via_sso":false,"log_type":"user"}	2025-10-08 21:39:58.024481+00	
00000000-0000-0000-0000-000000000000	c404ed38-ec07-44ca-9d23-18594dfb09e9	{"action":"user_recovery_requested","actor_id":"2df84793-4848-448d-b582-7585faae3aab","actor_username":"bug@example.com","actor_via_sso":false,"log_type":"user"}	2025-10-08 21:39:59.056237+00	
00000000-0000-0000-0000-000000000000	f732a311-82d4-4eed-b7f0-9b4dd58b94b7	{"action":"user_recovery_requested","actor_id":"2df84793-4848-448d-b582-7585faae3aab","actor_username":"bug@example.com","actor_via_sso":false,"log_type":"user"}	2025-10-08 21:40:16.255061+00	
00000000-0000-0000-0000-000000000000	415824bb-1747-440e-9043-a4f01cc9fa2a	{"action":"user_recovery_requested","actor_id":"2df84793-4848-448d-b582-7585faae3aab","actor_username":"bug@example.com","actor_via_sso":false,"log_type":"user"}	2025-10-08 21:40:16.667069+00	
00000000-0000-0000-0000-000000000000	3baa788a-7ae3-431e-9535-4e136777d147	{"action":"user_recovery_requested","actor_id":"2df84793-4848-448d-b582-7585faae3aab","actor_username":"bug@example.com","actor_via_sso":false,"log_type":"user"}	2025-10-08 21:40:17.313598+00	
00000000-0000-0000-0000-000000000000	63382d20-d89d-4d2f-a04f-69f88c7a3f13	{"action":"user_recovery_requested","actor_id":"2df84793-4848-448d-b582-7585faae3aab","actor_username":"bug@example.com","actor_via_sso":false,"log_type":"user"}	2025-10-08 21:40:17.653521+00	
00000000-0000-0000-0000-000000000000	e3917be9-5f0e-4f32-87cc-f06c8875a116	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"bug@example.com","user_id":"2df84793-4848-448d-b582-7585faae3aab","user_phone":""}}	2025-10-08 21:47:16.033479+00	
00000000-0000-0000-0000-000000000000	83b40b2b-8c0f-4c03-a336-3742781a6eb8	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"bug@example.com","user_id":"706f6de8-4b9c-4740-8954-236d5d804b23","user_phone":""}}	2025-10-08 21:48:13.82296+00	
00000000-0000-0000-0000-000000000000	fcdeed8f-cc02-454e-8e21-16d8663d2b3b	{"action":"user_recovery_requested","actor_id":"706f6de8-4b9c-4740-8954-236d5d804b23","actor_username":"bug@example.com","actor_via_sso":false,"log_type":"user"}	2025-10-08 21:48:15.792193+00	
00000000-0000-0000-0000-000000000000	804c7657-ca69-4f23-93c2-5c9cc8cc03d2	{"action":"login","actor_id":"706f6de8-4b9c-4740-8954-236d5d804b23","actor_username":"bug@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-08 21:48:15.882551+00	
00000000-0000-0000-0000-000000000000	7a46fa03-e25c-44c9-83f8-ada2544fb67d	{"action":"user_recovery_requested","actor_id":"706f6de8-4b9c-4740-8954-236d5d804b23","actor_username":"bug@example.com","actor_via_sso":false,"log_type":"user"}	2025-10-08 21:49:03.225898+00	
00000000-0000-0000-0000-000000000000	280c711b-4fc2-4aa0-a76c-4b9637b8caa4	{"action":"login","actor_id":"706f6de8-4b9c-4740-8954-236d5d804b23","actor_username":"bug@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-08 21:49:03.331021+00	
00000000-0000-0000-0000-000000000000	15c5bb31-daee-4372-868c-3db7771796d4	{"action":"logout","actor_id":"706f6de8-4b9c-4740-8954-236d5d804b23","actor_username":"bug@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-08 21:50:55.63723+00	
00000000-0000-0000-0000-000000000000	6fbb6f49-f082-4938-8e6a-d23c250c953e	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"bug@example.com","user_id":"706f6de8-4b9c-4740-8954-236d5d804b23","user_phone":""}}	2025-10-08 21:51:11.511188+00	
00000000-0000-0000-0000-000000000000	c8efdbae-55db-41bb-80ac-a8b759ccf4ce	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-08 21:51:19.186685+00	
00000000-0000-0000-0000-000000000000	f3b7a30b-a205-473a-9eca-1e667a52e2e0	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-08 21:51:19.188066+00	
00000000-0000-0000-0000-000000000000	70e27548-fc33-4883-a9a7-4743c34592b1	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-08 21:56:40.185585+00	
00000000-0000-0000-0000-000000000000	d575a9e7-53c6-439a-ad9b-b13f3855460f	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"tjhixon+mock@gmail.com","user_id":"11c3e860-ac30-4370-8ffb-578695aa1edf","user_phone":""}}	2025-10-08 22:01:05.965091+00	
00000000-0000-0000-0000-000000000000	0e4a301b-4ac9-4ecf-976f-79a47231d2d1	{"action":"user_recovery_requested","actor_id":"11c3e860-ac30-4370-8ffb-578695aa1edf","actor_username":"tjhixon+mock@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-08 22:01:08.068843+00	
00000000-0000-0000-0000-000000000000	dec689e6-c197-4756-b240-f4ec1768db37	{"action":"login","actor_id":"11c3e860-ac30-4370-8ffb-578695aa1edf","actor_username":"tjhixon+mock@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-08 22:01:08.168291+00	
00000000-0000-0000-0000-000000000000	eb2e3155-09d7-43f3-bd0e-f9f2a5ef86dd	{"action":"logout","actor_id":"11c3e860-ac30-4370-8ffb-578695aa1edf","actor_username":"tjhixon+mock@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-08 22:04:31.106641+00	
00000000-0000-0000-0000-000000000000	28745e52-b3f7-4b6b-9579-3d7080888abd	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-08 22:04:52.224483+00	
00000000-0000-0000-0000-000000000000	168f34af-3c97-491a-88b4-ad4753ef8422	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-08 22:04:59.912743+00	
00000000-0000-0000-0000-000000000000	5e90ca60-4cc7-4c30-93c8-5fc14dc645da	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-08 22:05:00.69246+00	
00000000-0000-0000-0000-000000000000	bc92dbbf-9151-42fb-853f-5559f32f4d63	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-08 22:10:21.713309+00	
00000000-0000-0000-0000-000000000000	ae2a483d-420f-4dcb-b55c-4f73d81bbaa2	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-08 22:17:14.65226+00	
00000000-0000-0000-0000-000000000000	8703ebad-366b-4c39-a516-3d823a3b3fe4	{"action":"factor_in_progress","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931"}}	2025-10-08 22:48:24.5919+00	68.53.242.179:10909
00000000-0000-0000-0000-000000000000	4098a4f2-1b66-451b-8a71-80db105c84ba	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"unverified"}}	2025-10-08 22:48:52.732045+00	68.53.242.179:35293
00000000-0000-0000-0000-000000000000	6e992951-fb1b-42fc-bd1b-017f30df09b3	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"54bf298a-b031-49a4-9a41-75b41728d103","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-08 22:48:52.847347+00	68.53.242.179:35293
00000000-0000-0000-0000-000000000000	30c6d173-de75-4939-92ea-818db39bb6ec	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-08 22:48:52.867202+00	
00000000-0000-0000-0000-000000000000	81a22807-a109-4b00-9806-3471c5b7899d	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-08 22:49:31.345273+00	
00000000-0000-0000-0000-000000000000	c3a33923-f72f-4ccb-a89e-0dc77a34b739	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-08 22:49:42.454714+00	
00000000-0000-0000-0000-000000000000	a2f6fc32-244b-4787-b9f4-89ad702d0874	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-08 23:47:59.250378+00	
00000000-0000-0000-0000-000000000000	1e1fc237-7c31-46f2-abd9-18ce19528f19	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-08 23:47:59.26485+00	
00000000-0000-0000-0000-000000000000	3454f307-615b-4f2b-980f-b56b01bd8fdb	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-08 23:55:12.787871+00	
00000000-0000-0000-0000-000000000000	9730623d-a67f-4589-a453-2f182ab77034	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-08 23:56:29.144453+00	
00000000-0000-0000-0000-000000000000	64ee9fd8-da01-40ab-a1dc-151013ec0ec3	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-08 23:58:26.111646+00	
00000000-0000-0000-0000-000000000000	717b1616-7118-4ed8-b4c3-e87bed328193	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-09 00:00:50.03324+00	
00000000-0000-0000-0000-000000000000	a49fb87b-e92e-4593-9dfd-b69c24291685	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-09 00:01:03.813929+00	68.53.242.179:35501
00000000-0000-0000-0000-000000000000	ee49a696-8f61-4847-85f9-e4e4b438f8b3	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"b1ded944-9c3c-4b6b-be97-8d8ce5637670","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-09 00:01:03.957088+00	68.53.242.179:35501
00000000-0000-0000-0000-000000000000	619cf832-bafd-4e8e-b926-f0efd39269d2	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-09 00:01:03.962194+00	
00000000-0000-0000-0000-000000000000	fa1b772b-2be0-4a2d-8e90-c809fa770b00	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-09 00:01:09.179817+00	
00000000-0000-0000-0000-000000000000	6d3614c4-9de8-44e6-8fdb-05987f6779ee	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-09 00:13:45.39765+00	
00000000-0000-0000-0000-000000000000	52bc89a7-a971-48d0-b5e3-992314619862	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-09 00:13:45.397663+00	
00000000-0000-0000-0000-000000000000	79969750-de57-4a47-b9bd-97b18e5c6878	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-09 00:18:01.357737+00	
00000000-0000-0000-0000-000000000000	f3923607-503c-42a4-80f3-ddd673cf5559	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-09 00:18:01.366012+00	
00000000-0000-0000-0000-000000000000	35d6cb94-c59e-45ea-aa00-cb0b614369ea	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-09 00:18:01.783874+00	
00000000-0000-0000-0000-000000000000	33319760-b74c-4ebc-b072-981680f87737	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-09 00:18:53.84736+00	
00000000-0000-0000-0000-000000000000	3cf34a95-494a-4978-9911-292db54991b4	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-09 00:20:19.265914+00	
00000000-0000-0000-0000-000000000000	f19370ca-eafa-4e36-ae0f-ff14de827cbd	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-09 00:20:19.271481+00	
00000000-0000-0000-0000-000000000000	a6c68bf5-6b49-4427-8712-ae647161c1d9	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-09 00:20:19.658813+00	
00000000-0000-0000-0000-000000000000	6947d8a1-c644-4d22-b7e6-37a20f2a812c	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-09 00:21:11.453267+00	
00000000-0000-0000-0000-000000000000	b80ee3fe-e506-452d-8b2a-024823e3a436	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-09 00:21:25.148303+00	
00000000-0000-0000-0000-000000000000	5a5c1ca6-2cb7-4a3f-8606-514f81d72c49	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-09 00:21:25.249252+00	
00000000-0000-0000-0000-000000000000	825385c5-e7fd-4ae9-b144-bf8221217ae1	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-09 00:21:25.593743+00	
00000000-0000-0000-0000-000000000000	436c6068-9426-4f24-9314-1b61101c2165	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-09 00:21:52.639172+00	
00000000-0000-0000-0000-000000000000	b0ffdf5a-dab7-440f-945f-8e9aff935d0b	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-09 00:22:11.876416+00	
00000000-0000-0000-0000-000000000000	55300176-6af4-47b4-9e2b-64d6765e29b0	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-09 00:22:12.249488+00	
00000000-0000-0000-0000-000000000000	0aa2494b-3690-4188-9fcf-9a4df37cb8e7	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-09 01:20:16.617128+00	
00000000-0000-0000-0000-000000000000	e6b81ecc-c118-48ca-9e17-2721edd34a99	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-09 01:20:16.637252+00	
00000000-0000-0000-0000-000000000000	e84c91b4-43a9-4343-862c-6c7ad93e5833	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-09 01:29:08.091047+00	
00000000-0000-0000-0000-000000000000	d5f4fcea-9fcf-4560-8014-edb758864488	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-09 01:29:16.760865+00	
00000000-0000-0000-0000-000000000000	83771389-71e4-4ab4-911f-1685651210dc	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-09 16:39:14.719018+00	
00000000-0000-0000-0000-000000000000	14674682-4134-4535-ba81-b22c9341e9f4	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-09 16:39:50.942344+00	
00000000-0000-0000-0000-000000000000	d7d8c0c7-a891-4333-883f-9f46152ac37e	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-09 16:42:40.559859+00	
00000000-0000-0000-0000-000000000000	df1014f9-9451-4304-b515-d6fd2d81dd30	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-09 16:42:40.572218+00	
00000000-0000-0000-0000-000000000000	5c561a4e-6327-4865-8451-2f2054956668	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-09 16:42:41.129135+00	
00000000-0000-0000-0000-000000000000	f21c779e-3b00-4c1d-85a0-cde04d1a72dc	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-09 16:42:41.249047+00	
00000000-0000-0000-0000-000000000000	b70b3bc3-e55d-42f2-bec5-597db4bc4ac9	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-09 16:42:41.521807+00	
00000000-0000-0000-0000-000000000000	76ec3750-601a-4331-a77c-6b4e7fed0dfa	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-09 16:42:41.657627+00	
00000000-0000-0000-0000-000000000000	3c51ecb5-a3b4-47e7-b187-4a766a284c88	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-09 16:57:57.76382+00	
00000000-0000-0000-0000-000000000000	42042aa5-6a19-4a5a-8b11-7d64e99d305b	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-09 16:58:20.560477+00	
00000000-0000-0000-0000-000000000000	71e28019-a49b-4611-8e96-b49582984823	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-09 16:58:26.749151+00	
00000000-0000-0000-0000-000000000000	05bf8bf6-497f-4cb4-9b6c-e39ea54150e1	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"recovery"}}	2025-10-09 16:58:27.362793+00	
00000000-0000-0000-0000-000000000000	9ae7c764-7707-4c6f-8809-50dcd4f7e850	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-09 16:59:57.408853+00	
00000000-0000-0000-0000-000000000000	0e4365c6-d78b-4e80-9d4d-4d4f20860612	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-09 17:02:05.652882+00	
00000000-0000-0000-0000-000000000000	12cd6023-4793-4004-bfa5-3a2c4b6a13b5	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-09 17:03:33.957657+00	
00000000-0000-0000-0000-000000000000	9ab97989-587f-461b-a46b-8401d8a695a2	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-09 17:03:44.001794+00	
00000000-0000-0000-0000-000000000000	3ba42546-1226-4167-8de9-b2ef49bd663a	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"recovery"}}	2025-10-09 17:03:44.657518+00	
00000000-0000-0000-0000-000000000000	1b59d4f6-7775-4818-b3fc-ab0486d1ca77	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-09 17:04:10.723946+00	68.53.242.179:9891
00000000-0000-0000-0000-000000000000	b4932879-00bf-4e14-bdfc-052b12c9a4b7	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"90153fdd-22e2-4793-9420-7fa02e1d388f","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-09 17:04:10.833132+00	68.53.242.179:53023
00000000-0000-0000-0000-000000000000	a9206a61-0862-4050-8ed5-fb6595681687	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-09 17:04:10.837864+00	
00000000-0000-0000-0000-000000000000	735cd379-704f-4543-a20b-d97d59eed0f5	{"action":"user_updated_password","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-09 17:04:11.087896+00	
00000000-0000-0000-0000-000000000000	a4187b17-f2f4-4576-9c1b-1331ecce3aa6	{"action":"user_modified","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-09 17:04:11.090513+00	
00000000-0000-0000-0000-000000000000	70e5f0f9-bb90-44bc-b143-0b785515d1ec	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-09 17:05:00.365501+00	
00000000-0000-0000-0000-000000000000	536eb599-be6e-4d14-92df-f1312c560476	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-09 17:05:18.116762+00	68.53.242.179:27849
00000000-0000-0000-0000-000000000000	3aabbaf8-bce1-4507-b7bf-341a11b21f77	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"c77ed76f-9c27-47ff-a51e-4bf25110f18d","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-09 17:05:18.235237+00	68.53.242.179:53023
00000000-0000-0000-0000-000000000000	353eece6-2d99-48d4-a73c-8465bfe36ec7	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-09 17:05:18.239578+00	
00000000-0000-0000-0000-000000000000	7a49b4ae-a62e-4871-a166-5f71003457e1	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-09 17:06:16.970045+00	
00000000-0000-0000-0000-000000000000	025424a4-896c-4a5e-ada3-7fc2fb0062aa	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-09 17:07:35.783699+00	
00000000-0000-0000-0000-000000000000	806689d7-db59-4dc5-878e-32723e660b3b	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-09 17:07:36.366362+00	
00000000-0000-0000-0000-000000000000	7ad686e1-9a38-4f99-a29d-cf100b783a79	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-09 17:08:40.466994+00	
00000000-0000-0000-0000-000000000000	802acd0c-5b78-4df0-981f-f2e571069c70	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-09 17:08:40.936385+00	
00000000-0000-0000-0000-000000000000	88788b64-51ba-43b1-b9eb-eb1179439f01	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-10 00:12:14.240038+00	
00000000-0000-0000-0000-000000000000	7e903519-a4d1-4b11-b924-1022100cb7f5	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-10 00:12:14.85301+00	
00000000-0000-0000-0000-000000000000	5f516b40-a991-403c-8522-73a4fe863ed0	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-10 01:11:59.331255+00	
00000000-0000-0000-0000-000000000000	8f185fb2-f950-4417-a9f7-2357136a21f5	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-10 01:11:59.34328+00	
00000000-0000-0000-0000-000000000000	9db5a980-ffd7-4ba7-9e4e-8edb441e61b4	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-10 11:44:35.37734+00	
00000000-0000-0000-0000-000000000000	92a84639-49fd-4b9c-886a-1c5fc6773441	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-10 11:44:35.408041+00	
00000000-0000-0000-0000-000000000000	f834d25b-23bb-4fbe-8ffa-9b38c5144362	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-10 12:57:34.251438+00	
00000000-0000-0000-0000-000000000000	2448a2e8-dff3-4448-9597-1cbb88751586	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-10 12:57:34.271923+00	
00000000-0000-0000-0000-000000000000	5e83bb43-03e7-467b-ab81-f0be6483a2dc	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-10 14:08:24.135953+00	
00000000-0000-0000-0000-000000000000	64f50264-9c42-4d13-9717-f4e03b6e51e8	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-10 14:08:24.166677+00	
00000000-0000-0000-0000-000000000000	fa78ba9d-4c11-4114-8db3-7523e268d1c6	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-10 14:19:21.262237+00	
00000000-0000-0000-0000-000000000000	0df754c0-1437-40c6-8d93-ef9d4441621a	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-10 15:19:47.763452+00	
00000000-0000-0000-0000-000000000000	dd346c9b-759f-4032-8a03-125df8fdc7e2	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-10 15:19:47.774859+00	
00000000-0000-0000-0000-000000000000	fc16785f-3eb5-4e25-a693-de9f07f86853	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-10 17:42:09.397328+00	
00000000-0000-0000-0000-000000000000	4e077dfc-a95e-4c16-af0f-4237b5254af2	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-10 17:42:09.417311+00	
00000000-0000-0000-0000-000000000000	12625fd4-3674-429a-b225-aafa24e9dac7	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-10 18:32:28.807728+00	
00000000-0000-0000-0000-000000000000	94346c2d-f145-4501-b461-3d360dd6ee36	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-10 18:32:45.171797+00	
00000000-0000-0000-0000-000000000000	54e801e6-8ee5-482c-9cd5-6dd579fe6d18	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-10 18:43:32.893279+00	
00000000-0000-0000-0000-000000000000	a10001b8-35e4-4845-82ac-49f6c38c6b2a	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-10 18:43:44.684849+00	
00000000-0000-0000-0000-000000000000	9bc1a732-67dc-42d4-914c-a9e4c8becd4a	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-11 00:42:32.440048+00	
00000000-0000-0000-0000-000000000000	8ba43c18-e398-4b2b-8c9c-32ecba84a6bd	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-11 00:42:32.470209+00	
00000000-0000-0000-0000-000000000000	b4c64889-5f05-4b3f-bca2-051590bdb4cc	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-11 02:49:42.165434+00	
00000000-0000-0000-0000-000000000000	cdc41aa6-3cda-4d0e-bdbf-108117512c2b	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-11 02:49:42.187133+00	
00000000-0000-0000-0000-000000000000	4dfdd78f-cc13-4745-9643-06ee226a751e	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-11 12:29:27.116779+00	
00000000-0000-0000-0000-000000000000	ab1bcac0-1ec1-4058-8bc8-8cc01ceabb19	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-11 12:29:27.139535+00	
00000000-0000-0000-0000-000000000000	b33cff64-f7ff-4a41-b5b3-77e05b73da82	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-11 17:15:28.885189+00	
00000000-0000-0000-0000-000000000000	a43076e0-15e7-460a-af5d-50bf1e3f13f7	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-11 17:15:54.551724+00	
00000000-0000-0000-0000-000000000000	0a8950aa-729f-4f6a-91d3-ad0481c1dfd3	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-11 17:19:13.953361+00	
00000000-0000-0000-0000-000000000000	64585583-3919-485c-b6bd-ea3f415ef62f	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-11 17:28:53.349649+00	
00000000-0000-0000-0000-000000000000	a64fa696-f56a-4b1a-a5c9-cb05d76c9e36	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-11 17:28:53.370186+00	
00000000-0000-0000-0000-000000000000	813155da-eb78-4dcd-b2df-39c97e46fbc1	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-11 17:28:53.766971+00	
00000000-0000-0000-0000-000000000000	ddaa2a98-8cd7-4ca4-b2b1-164000c004ae	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-11 17:29:00.458336+00	
00000000-0000-0000-0000-000000000000	a6c08f63-d670-4815-ac85-ec8a9df9ddbd	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-11 17:29:00.739192+00	
00000000-0000-0000-0000-000000000000	9454a554-1bfb-489e-8b7e-e703e7e58ed6	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-11 17:29:08.853802+00	
00000000-0000-0000-0000-000000000000	c790bec4-dc60-4bd0-92b2-fb12e7d5f8ff	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-11 17:29:09.167478+00	
00000000-0000-0000-0000-000000000000	2deef350-835c-4cc9-ba87-947523dbbfa6	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-11 23:12:54.540452+00	
00000000-0000-0000-0000-000000000000	1b0aa076-b470-4197-9e19-91fdd36d6d1e	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-12 00:11:29.562903+00	
00000000-0000-0000-0000-000000000000	a104bf25-43e3-41fb-969b-54f4ca44a30f	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-12 00:11:29.574123+00	
00000000-0000-0000-0000-000000000000	34d257ad-5dd4-41b0-94ef-09264ec5f492	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-12 01:14:05.59098+00	
00000000-0000-0000-0000-000000000000	489c1147-052b-4ba0-8b92-44f5ff238fcf	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-12 01:14:05.617956+00	
00000000-0000-0000-0000-000000000000	6437ca74-2678-4012-8699-d660d40d512f	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-12 01:14:06.905517+00	
00000000-0000-0000-0000-000000000000	5df76195-1f21-41c0-abb2-bb4dd2856e25	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-12 01:14:07.065973+00	
00000000-0000-0000-0000-000000000000	244c96a1-7c48-4cfa-8c2e-f029ec13b18c	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-12 01:14:07.331401+00	
00000000-0000-0000-0000-000000000000	ea8a10da-bd77-4951-a758-37aa4e9a616e	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-12 01:14:07.45985+00	
00000000-0000-0000-0000-000000000000	90f9a74f-1f87-4640-8754-7ec669300711	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-12 02:47:00.397901+00	
00000000-0000-0000-0000-000000000000	bfa6275c-a535-4c37-86d7-e4854fcf5cf2	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-12 02:47:00.422041+00	
00000000-0000-0000-0000-000000000000	8dd29872-bfa1-42a1-9e1d-8dbd07022250	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-12 03:10:10.411001+00	
00000000-0000-0000-0000-000000000000	e24b3737-28f9-49aa-896d-4085b369b3ce	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-12 13:52:35.93394+00	
00000000-0000-0000-0000-000000000000	9d9f7b3a-7e50-4c4a-ac17-2b5bf6b2301e	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-12 13:52:35.96525+00	
00000000-0000-0000-0000-000000000000	9f3d3465-55ea-485f-9e09-c008665a9c15	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-12 15:00:07.76095+00	
00000000-0000-0000-0000-000000000000	5a8ef22e-406d-41a0-b296-292dff2c2255	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-12 15:00:07.782539+00	
00000000-0000-0000-0000-000000000000	5d505fec-dbfa-496e-8a4e-e40ef30ab883	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-12 17:27:37.151933+00	
00000000-0000-0000-0000-000000000000	e6b03b68-7f7a-4ab9-82a9-ea4c67f95815	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-12 17:27:37.182899+00	
00000000-0000-0000-0000-000000000000	4b970b6f-d970-4ca4-b50c-8e0f5b978a4c	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 00:17:53.3727+00	
00000000-0000-0000-0000-000000000000	1a843c9f-5060-4a74-a206-40322327fbd8	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 00:17:53.401708+00	
00000000-0000-0000-0000-000000000000	516671b5-e7f1-483e-9a0c-217b34c9bcca	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 10:43:11.044682+00	
00000000-0000-0000-0000-000000000000	ac6e1644-f13d-469e-9ffe-f9f0e91edf12	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 10:43:11.080119+00	
00000000-0000-0000-0000-000000000000	8b41264d-f5f4-4c18-a7d9-24eadeb02abe	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 12:07:10.94895+00	
00000000-0000-0000-0000-000000000000	ba92a46c-653c-452e-a130-219c60510c69	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 12:07:10.955934+00	
00000000-0000-0000-0000-000000000000	38db6daa-3bf4-4fd9-9ddf-87a49406f93b	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 12:07:11.342825+00	
00000000-0000-0000-0000-000000000000	46271323-08b5-4e41-ad8d-ce1bbb805876	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 14:20:21.811341+00	
00000000-0000-0000-0000-000000000000	cea1b6d9-53a6-4a3b-bd61-52a8e41ff9e0	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 16:40:29.384131+00	
00000000-0000-0000-0000-000000000000	a6efd35a-3be5-46bb-9da3-f416ce9a8999	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 16:41:14.432762+00	
00000000-0000-0000-0000-000000000000	e8f9ab40-202b-47ca-9738-b052de20b2d6	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-22 16:41:32.106374+00	
00000000-0000-0000-0000-000000000000	deb20912-2a26-4227-a96c-0c2b1748222a	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-22 16:41:38.181185+00	
00000000-0000-0000-0000-000000000000	443a804f-ed81-43d9-8290-cdfccda10c6a	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-22 16:41:38.952928+00	
00000000-0000-0000-0000-000000000000	73523d45-a12e-474c-9d81-fca7cd04e9d3	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-13 15:20:55.137629+00	
00000000-0000-0000-0000-000000000000	3694f139-6337-4aee-94da-523d15d0ac18	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 15:21:19.115037+00	
00000000-0000-0000-0000-000000000000	eaf380bf-6b6e-435c-bac0-9e301036d43c	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 15:21:19.115665+00	
00000000-0000-0000-0000-000000000000	54768f58-dd18-4b0a-989e-3714393494d6	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 16:21:17.726444+00	
00000000-0000-0000-0000-000000000000	ff5c7b5d-395d-41ff-adc5-2d06f36a0ec9	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 16:21:17.752869+00	
00000000-0000-0000-0000-000000000000	0df47a0a-eb6f-43fc-b84d-408f39ad4eb5	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 17:19:44.228309+00	
00000000-0000-0000-0000-000000000000	3ae68bb9-462c-4059-9a16-7f12ed1dd9a4	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 17:19:44.244081+00	
00000000-0000-0000-0000-000000000000	37044634-e7a4-491d-a0e0-4ea4cab1703f	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 23:53:21.777575+00	
00000000-0000-0000-0000-000000000000	3d4956e9-2bd2-4226-accd-08f4205497e7	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 23:53:21.804687+00	
00000000-0000-0000-0000-000000000000	5a6d1910-cd25-40d5-bee6-e0f34caa3600	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 23:53:25.318448+00	
00000000-0000-0000-0000-000000000000	8c8a4cce-ebb8-463c-95ef-9450104c218a	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 23:53:25.475257+00	
00000000-0000-0000-0000-000000000000	ea7463c6-829b-4f7e-957d-1f60d4ce0045	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 23:53:25.985184+00	
00000000-0000-0000-0000-000000000000	713c2689-cf3b-4906-992f-c2734a828e04	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-13 23:53:26.084132+00	
00000000-0000-0000-0000-000000000000	5e7ad333-886c-4d74-b689-964ed52117a1	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-14 00:52:22.488805+00	
00000000-0000-0000-0000-000000000000	b5d8e07b-394b-4776-b7ce-bbc8762b6d82	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-14 00:52:22.508566+00	
00000000-0000-0000-0000-000000000000	63ae7a11-003f-4541-b8cc-33e88bed028e	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-14 00:52:22.96855+00	
00000000-0000-0000-0000-000000000000	f891fe6d-0ad4-4afa-8280-96afda8262fd	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-14 14:14:51.09846+00	
00000000-0000-0000-0000-000000000000	b7206b08-7af8-4c37-8275-10580013b91e	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-14 14:14:51.12548+00	
00000000-0000-0000-0000-000000000000	a1795c1c-ebc5-4696-906e-306745d6d5f4	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-14 15:24:52.003722+00	
00000000-0000-0000-0000-000000000000	62cb45f0-c006-483c-b1c1-f1a7072bb1ee	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-14 15:24:52.032797+00	
00000000-0000-0000-0000-000000000000	0d86d58c-e40b-4ee6-8a56-1c1ef3e2d42f	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-14 17:20:14.498699+00	
00000000-0000-0000-0000-000000000000	1030c520-4bff-4b28-8caa-e6d889006cde	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-14 17:20:14.513692+00	
00000000-0000-0000-0000-000000000000	17445667-2132-49db-b7f9-5858b00e9df0	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-14 18:23:24.991629+00	
00000000-0000-0000-0000-000000000000	3dd76366-0728-4275-ab8e-7b815f300773	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-14 18:23:25.012641+00	
00000000-0000-0000-0000-000000000000	1560ca16-c68e-439f-948c-566a37a313fd	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-14 21:22:21.7371+00	
00000000-0000-0000-0000-000000000000	76528c83-4c4e-4c51-9e53-13276a5f5cdf	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-14 21:22:21.761241+00	
00000000-0000-0000-0000-000000000000	0bc76884-a313-40e2-91a0-db2856bff1b3	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-14 22:21:07.855859+00	
00000000-0000-0000-0000-000000000000	569359c7-2848-4f36-99a1-d7d68651c81e	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-14 22:21:07.881793+00	
00000000-0000-0000-0000-000000000000	60d8aad7-2385-4a96-83f0-5f87a3f56c72	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-14 22:21:08.359768+00	
00000000-0000-0000-0000-000000000000	c46b8f50-ee8c-488c-9131-4b10663fba80	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-14 23:25:51.767372+00	
00000000-0000-0000-0000-000000000000	bf9422a5-b745-4710-8ffe-594943d535d4	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-14 23:25:51.790544+00	
00000000-0000-0000-0000-000000000000	54a4a24b-5d49-495e-9d2d-27696ef03e0d	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 00:24:19.169682+00	
00000000-0000-0000-0000-000000000000	659d0fd7-37d9-419f-a7b1-c7ee3d99b286	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 00:24:19.190978+00	
00000000-0000-0000-0000-000000000000	c770ec74-467a-44b1-8939-c957c949fb27	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 01:24:18.795121+00	
00000000-0000-0000-0000-000000000000	1006e483-0b08-4ecf-851a-f11bc2637fc2	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 01:24:18.81974+00	
00000000-0000-0000-0000-000000000000	7f5f7619-6d19-4af8-b1b4-19c84ec511a3	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 03:04:43.489731+00	
00000000-0000-0000-0000-000000000000	0a0197e3-a886-455d-9194-7ecdffaaa317	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 03:04:49.959457+00	
00000000-0000-0000-0000-000000000000	829fc260-2c56-4ff4-ae22-d470ab1a095d	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 03:04:53.127094+00	
00000000-0000-0000-0000-000000000000	971042b1-5b9e-430f-92a7-c6b049582bde	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 13:10:39.20663+00	
00000000-0000-0000-0000-000000000000	ed42494f-b725-4cb9-841c-fe2cbd387689	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 13:10:39.227867+00	
00000000-0000-0000-0000-000000000000	f65122c6-3eba-4f98-a095-2cdefe69b732	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 15:28:35.477756+00	
00000000-0000-0000-0000-000000000000	06bdb4c1-31d2-42fd-a4ae-9cdd631fd638	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 15:28:37.565848+00	
00000000-0000-0000-0000-000000000000	31109931-5ab4-4098-a090-706c12617f5f	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 15:28:37.749543+00	
00000000-0000-0000-0000-000000000000	17c08bb7-8514-41ea-9bf4-a260be0d3fb6	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 15:28:38.269879+00	
00000000-0000-0000-0000-000000000000	60ab5581-4755-4d74-8230-b2a6e744e986	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 15:28:38.283579+00	
00000000-0000-0000-0000-000000000000	8992e5ad-359d-46ee-8ba5-5d87d8954f69	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 15:28:39.085687+00	
00000000-0000-0000-0000-000000000000	66f54598-83a3-405f-9cc0-232d49f52780	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 16:27:31.651947+00	
00000000-0000-0000-0000-000000000000	7d9c7044-3e23-46c8-b6df-92c9dcebf3d7	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 16:27:31.664597+00	
00000000-0000-0000-0000-000000000000	58444a42-88c0-42cf-8eba-de884b26f587	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 18:08:20.591736+00	
00000000-0000-0000-0000-000000000000	fbcbf0d7-c86a-440c-9986-efe52508c876	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 18:08:20.61801+00	
00000000-0000-0000-0000-000000000000	9e14b791-96c8-48d5-a8ad-3d33c6c28328	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 18:08:25.283799+00	
00000000-0000-0000-0000-000000000000	cd271ddd-0cdb-49a8-9486-ba3486e53117	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 18:08:25.302868+00	
00000000-0000-0000-0000-000000000000	d4696416-df91-4947-b23b-9aeaa6de1309	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 18:08:26.141396+00	
00000000-0000-0000-0000-000000000000	4e5af232-e2ef-4a63-b573-428d7c5f572f	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 18:08:26.174289+00	
00000000-0000-0000-0000-000000000000	6e2e4ed4-72f0-41e7-b9ae-4a01e044861c	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"dev@dev.com","user_id":"2874145f-e401-448d-92de-48f48ab53c99","user_phone":""}}	2025-10-15 20:48:24.29161+00	
00000000-0000-0000-0000-000000000000	2686e749-4124-4b07-ae3d-72cf0ea5d74e	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"stage@example.com","user_id":"20c034f6-9a53-46ba-bb8c-62f09b838280","user_phone":""}}	2025-10-15 21:58:53.379021+00	
00000000-0000-0000-0000-000000000000	11b2a8cd-d523-44bc-9e7c-2f85f07a2753	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"stage@example.com","user_id":"20c034f6-9a53-46ba-bb8c-62f09b838280","user_phone":""}}	2025-10-15 22:03:20.872605+00	
00000000-0000-0000-0000-000000000000	f302e0b0-0cb4-4c10-8687-8206f04fb759	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"dev@dev.com","user_id":"2874145f-e401-448d-92de-48f48ab53c99","user_phone":""}}	2025-10-15 22:03:20.874542+00	
00000000-0000-0000-0000-000000000000	097fce3b-71dd-4349-876a-67abdf2990ca	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"stage@example.com","user_id":"14b8d1bc-5226-4e84-abd6-98b3239c39d3","user_phone":""}}	2025-10-15 22:06:13.860437+00	
00000000-0000-0000-0000-000000000000	df02b899-1010-472c-9f1e-ec3820ccc3ee	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"stage@example.com","user_id":"14b8d1bc-5226-4e84-abd6-98b3239c39d3","user_phone":""}}	2025-10-15 22:11:00.100239+00	
00000000-0000-0000-0000-000000000000	5cb9aea9-165d-4dc3-8c6b-d5e3b16be814	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"stage@example.com","user_id":"402e4eef-133a-43b2-8a2c-98040accb299","user_phone":""}}	2025-10-15 22:11:38.074386+00	
00000000-0000-0000-0000-000000000000	dfaa4afd-f612-430f-9588-26dcb6ba962a	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"stage@example.com","user_id":"402e4eef-133a-43b2-8a2c-98040accb299","user_phone":""}}	2025-10-15 22:13:29.268883+00	
00000000-0000-0000-0000-000000000000	d599a77a-c44b-46c9-bae3-6ed3175ca521	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"stage@example.com","user_id":"e9a89cf7-3cb8-4f55-af94-841a93936450","user_phone":""}}	2025-10-15 22:15:02.234063+00	
00000000-0000-0000-0000-000000000000	543ab115-0856-4f36-862e-67bc27f2cd71	{"action":"user_recovery_requested","actor_id":"e9a89cf7-3cb8-4f55-af94-841a93936450","actor_username":"stage@example.com","actor_via_sso":false,"log_type":"user"}	2025-10-15 22:15:04.911982+00	
00000000-0000-0000-0000-000000000000	f798a42e-0c4b-49c5-86a3-7c005fc41666	{"action":"login","actor_id":"e9a89cf7-3cb8-4f55-af94-841a93936450","actor_username":"stage@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-15 22:15:04.999375+00	
00000000-0000-0000-0000-000000000000	283621cc-8eba-4516-a9ee-7185908dedf2	{"action":"logout","actor_id":"e9a89cf7-3cb8-4f55-af94-841a93936450","actor_username":"stage@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-15 22:16:22.73415+00	
00000000-0000-0000-0000-000000000000	8205a4c8-d31a-463f-9063-b492b363ac15	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-15 22:16:34.962635+00	
00000000-0000-0000-0000-000000000000	8e3729c4-22e5-4f34-8b2d-ed2926622242	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-15 22:17:39.663991+00	
00000000-0000-0000-0000-000000000000	0dd173f6-3003-461a-b3ee-301fe585306e	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-15 22:17:51.25321+00	
00000000-0000-0000-0000-000000000000	99bd7e80-6730-4df3-a63b-51a9b1f0ebbf	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 16:43:33.009774+00	
00000000-0000-0000-0000-000000000000	5a96eab9-6b44-4eeb-b50a-c54828a67139	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-15 22:21:46.860812+00	
00000000-0000-0000-0000-000000000000	f08c2d00-702e-49ae-ad66-af5f633c7f58	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-15 22:22:15.744022+00	
00000000-0000-0000-0000-000000000000	38242611-7991-4791-bde3-26b9bed80813	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-15 22:23:22.290376+00	
00000000-0000-0000-0000-000000000000	d704f7f7-dbd5-4d0d-8c85-ceb3be824a03	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-15 22:23:35.907359+00	
00000000-0000-0000-0000-000000000000	35f27d10-ee0d-4434-89d0-d22d032c4e40	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"recovery"}}	2025-10-15 22:23:36.803348+00	
00000000-0000-0000-0000-000000000000	1623cc8a-155d-4e7a-aaa7-9c3b8825178d	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-15 22:24:03.928415+00	68.53.242.179:14893
00000000-0000-0000-0000-000000000000	216930df-91ac-4c9c-be9f-d9f4ffaf72ef	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-15 22:24:11.94668+00	68.53.242.179:14893
00000000-0000-0000-0000-000000000000	4f40ee18-70b1-44ff-a6a1-acdeb0cb7d1b	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"2b6adfab-d44f-467d-b84d-190f48856408","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-15 22:24:12.017194+00	68.53.242.179:14893
00000000-0000-0000-0000-000000000000	4ae340a8-40ac-41b1-aea1-e0408fabd1e0	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-15 22:24:12.021438+00	
00000000-0000-0000-0000-000000000000	eeed4486-75f3-4cad-970f-58776eb893a7	{"action":"user_updated_password","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-15 22:24:12.3896+00	
00000000-0000-0000-0000-000000000000	1012cf79-1d11-44b9-99b9-7158d6280696	{"action":"user_modified","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-15 22:24:12.390369+00	
00000000-0000-0000-0000-000000000000	6dc5f1ec-45e5-49a4-a224-4b6421da040b	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-15 22:24:54.446711+00	
00000000-0000-0000-0000-000000000000	c704896c-0bf7-4ac6-b353-d91ec9a2289e	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-15 22:25:05.228033+00	
00000000-0000-0000-0000-000000000000	a7168824-b369-4781-adf9-799e03457def	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-15 22:25:13.620289+00	
00000000-0000-0000-0000-000000000000	94554fce-2487-4868-a9ab-dc89724d5baf	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-15 22:25:14.132359+00	
00000000-0000-0000-0000-000000000000	de284910-4e00-4e77-8435-4411d68a55de	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-15 22:25:55.445498+00	
00000000-0000-0000-0000-000000000000	aa0e4c17-f296-4f8e-84ff-13ba7165f1a7	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-15 22:25:55.836346+00	
00000000-0000-0000-0000-000000000000	3d46f75f-be9f-46eb-ba4b-7a86e2b0e635	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 16:47:39.193975+00	
00000000-0000-0000-0000-000000000000	ab0c1726-d84a-4f4d-a99f-cbd366518631	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 17:25:13.336356+00	
00000000-0000-0000-0000-000000000000	abd0a4d4-b3ab-4a39-828f-e3cf3c4adb58	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-22 17:25:42.917684+00	68.53.242.179:28793
00000000-0000-0000-0000-000000000000	28d67244-bdba-4aeb-bbab-2f99125fae31	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"6a9b7554-2a47-42bf-9d55-4bf711964e6c","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-22 17:25:43.063387+00	68.53.242.179:16941
00000000-0000-0000-0000-000000000000	369cb36c-d982-47b0-ba02-30eae7eac35a	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 17:25:43.073944+00	
00000000-0000-0000-0000-000000000000	82e31da4-1f88-4050-a39c-20723cb84e6d	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-22 18:50:31.783059+00	
00000000-0000-0000-0000-000000000000	679b6e09-da0c-43d4-abf1-0e664f7bf6a3	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 18:50:41.016314+00	
00000000-0000-0000-0000-000000000000	e7a9987c-161b-4253-aa33-40d22e993363	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 21:48:03.765395+00	
00000000-0000-0000-0000-000000000000	bb69c574-e205-445c-b838-109ae5cdba4b	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 00:00:36.218756+00	
00000000-0000-0000-0000-000000000000	e965af3b-1aa4-4bb0-9ac8-2b037430197d	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-24 14:01:09.500196+00	
00000000-0000-0000-0000-000000000000	efa74056-f6d8-4104-bf85-9bd3943277fa	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-24 14:01:09.529257+00	
00000000-0000-0000-0000-000000000000	1ebb5914-acac-402b-ae5d-c9349a874c4e	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-24 19:14:12.358577+00	
00000000-0000-0000-0000-000000000000	3b018c67-23ba-4d50-a8be-da1a60623b9c	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-24 19:14:12.375595+00	
00000000-0000-0000-0000-000000000000	4bfa29a1-fe0c-473c-aa95-1d9ffb6f4a2c	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-24 19:14:22.005166+00	
00000000-0000-0000-0000-000000000000	70045f77-e795-47cd-9134-3bdac3ca2f2b	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-24 21:57:26.885876+00	
00000000-0000-0000-0000-000000000000	f9b12ee8-69ad-4ced-93c1-6beb0e4c432d	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-24 23:15:44.175207+00	
00000000-0000-0000-0000-000000000000	2cabd7d1-693f-4b62-968e-6926781d57c9	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-24 23:16:02.53004+00	
00000000-0000-0000-0000-000000000000	7d9cbdc5-35d1-4071-8dcb-bd41e4a25264	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-24 23:44:58.371111+00	
00000000-0000-0000-0000-000000000000	ed9f1c25-caeb-4eef-bc6c-7bef9643259c	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-24 23:45:08.18824+00	
00000000-0000-0000-0000-000000000000	bc96d9dc-aeb8-4bfa-a878-5361631deb8d	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-24 23:49:41.58182+00	
00000000-0000-0000-0000-000000000000	07384be7-b527-498d-889c-7fb80be8b38f	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-24 23:49:49.452756+00	
00000000-0000-0000-0000-000000000000	476ace29-6a1b-42c9-96b9-f940091dada4	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-25 03:29:44.921394+00	
00000000-0000-0000-0000-000000000000	1ecb4406-0c21-43f4-b7ef-01fa8bebe42f	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 03:30:06.868484+00	
00000000-0000-0000-0000-000000000000	27882e2f-702f-47e1-b922-810c113e9277	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 03:30:24.410507+00	68.53.242.179:12037
00000000-0000-0000-0000-000000000000	c256773c-88b3-43d1-929f-014ead74d7fe	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"cabc8a46-2aea-49cb-9c42-24dfa1e14cf0","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-25 03:30:24.534435+00	68.53.242.179:12037
00000000-0000-0000-0000-000000000000	624acab6-82da-4a16-90a7-d97c24073b5d	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 03:30:24.54855+00	
00000000-0000-0000-0000-000000000000	ff19164a-5dd9-4b64-88fc-1e2740b01de0	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 03:30:38.753553+00	
00000000-0000-0000-0000-000000000000	00846843-446d-4c7b-a334-eb8b9f087bec	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-25 04:10:02.125785+00	
00000000-0000-0000-0000-000000000000	9c83a416-83bc-4fcd-ab4f-4d4f0716e05e	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-15 22:26:14.450124+00	
00000000-0000-0000-0000-000000000000	31947fff-f5ef-41ba-886d-6e1e76945791	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-15 22:26:29.49677+00	
00000000-0000-0000-0000-000000000000	db7097d3-bdb4-4a07-825a-772da433b7ea	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-15 22:26:29.903414+00	
00000000-0000-0000-0000-000000000000	e09a3450-8d47-4a7f-a6e3-6bcaecf12400	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-15 22:27:46.405849+00	
00000000-0000-0000-0000-000000000000	7de1cb30-3543-408b-93f1-cceedd69f1e5	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-15 22:27:58.939141+00	
00000000-0000-0000-0000-000000000000	ffa1611e-86c0-48dd-a31f-ad2259ff82c5	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-15 22:27:59.346386+00	
00000000-0000-0000-0000-000000000000	8874d19e-55c8-4196-8943-8fb8ae3f754c	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-15 22:28:29.204981+00	
00000000-0000-0000-0000-000000000000	435748ce-da9d-42f6-b0ea-19bd111f0785	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-15 22:28:51.59693+00	
00000000-0000-0000-0000-000000000000	2635e269-7f5a-4bff-97a9-1c220009e258	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-15 22:28:52.006812+00	
00000000-0000-0000-0000-000000000000	be43ba98-e722-450e-9203-c2db2f78ae4b	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-15 22:31:37.373697+00	
00000000-0000-0000-0000-000000000000	e2f73f26-76e8-40f4-9ad2-2799a475ce95	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-15 22:31:51.346252+00	
00000000-0000-0000-0000-000000000000	8de6e7b5-9295-42dd-ac73-13c76eb91ef8	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-15 22:31:51.665071+00	
00000000-0000-0000-0000-000000000000	1c99db38-86b1-42ce-80cb-675bb9bd5b3f	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-15 22:34:12.509718+00	
00000000-0000-0000-0000-000000000000	d7a48bf9-5d54-4601-88d6-6a029672fa76	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-15 22:34:12.947371+00	
00000000-0000-0000-0000-000000000000	a7d7650d-42b1-4c0d-a6f9-49d902f8e6a9	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-15 22:52:51.27733+00	
00000000-0000-0000-0000-000000000000	f3de9f62-5437-453a-9e4e-86c55e5e201d	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-15 22:52:51.747499+00	
00000000-0000-0000-0000-000000000000	c72b4d82-cc22-46c5-867a-b4ab40b1dd0e	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-15 22:55:41.822361+00	
00000000-0000-0000-0000-000000000000	e5a85388-9bfb-4d84-bd36-c0ed99a048f4	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-16 22:16:57.151304+00	
00000000-0000-0000-0000-000000000000	c4ac60b4-35fc-4daa-95be-7d7d2fdcd235	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-16 22:19:21.598512+00	
00000000-0000-0000-0000-000000000000	b25d2aa0-04ef-4d5d-966e-1317df02c0d8	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-16 23:17:53.06547+00	
00000000-0000-0000-0000-000000000000	a494f719-c669-4f07-8059-11c3bff3b843	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-16 23:19:51.300432+00	
00000000-0000-0000-0000-000000000000	57d16314-843b-4a83-8338-e54f1969c74f	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-16 23:20:31.358643+00	
00000000-0000-0000-0000-000000000000	57e566c9-2782-4a75-ba7f-f5857bdc0626	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-16 23:20:41.587222+00	
00000000-0000-0000-0000-000000000000	614638d2-b88c-40ce-b428-af55a4a51f48	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-16 23:21:00.27393+00	
00000000-0000-0000-0000-000000000000	16f76417-020b-4634-9805-603febbd8cad	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-16 23:21:00.606956+00	
00000000-0000-0000-0000-000000000000	ff836bb7-cb4c-48f3-aae6-17b20bced2d6	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-16 23:21:25.660018+00	
00000000-0000-0000-0000-000000000000	3dbae3e0-4e9f-4505-a087-b76f6cd182f5	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-16 23:21:33.789943+00	
00000000-0000-0000-0000-000000000000	a81e2a2d-cef4-471c-a818-eec7345f72a5	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-16 23:43:54.918385+00	
00000000-0000-0000-0000-000000000000	f00f8d4c-7851-43c4-8dff-91395f67de5c	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-16 23:44:16.099696+00	
00000000-0000-0000-0000-000000000000	9cc7fa42-62e6-4f9f-b9ca-5f552effa9b1	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-16 23:44:16.462497+00	
00000000-0000-0000-0000-000000000000	823f05ed-ef20-4e97-90c4-fb8153247852	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-16 23:45:08.686419+00	
00000000-0000-0000-0000-000000000000	5fc55163-677a-4756-801d-26a30e43cb31	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-16 23:47:22.057475+00	
00000000-0000-0000-0000-000000000000	d7f19dff-c072-4664-8f68-91064eaf862e	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-17 14:48:28.724605+00	
00000000-0000-0000-0000-000000000000	37aa01dd-1bff-40f2-84f1-8efe811abea1	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-17 14:48:29.097947+00	
00000000-0000-0000-0000-000000000000	26b1fd1e-0115-4bac-8922-c4ab29d739d6	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-17 14:50:57.047481+00	
00000000-0000-0000-0000-000000000000	b23289e3-846f-4c5a-94f7-dc2db366bcea	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-17 15:25:37.78628+00	
00000000-0000-0000-0000-000000000000	37c48894-222d-42b3-9332-40f4c520e3df	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-17 20:51:21.118694+00	
00000000-0000-0000-0000-000000000000	675f569e-c8b4-4d10-b05c-5e67c675392f	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-17 20:51:21.488379+00	
00000000-0000-0000-0000-000000000000	da73ea2e-0772-4c8d-ab94-ae263c679296	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-18 01:19:37.271949+00	
00000000-0000-0000-0000-000000000000	22751844-7b07-4e40-83ec-54deec0d4912	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-18 01:19:37.304075+00	
00000000-0000-0000-0000-000000000000	0798957e-fded-42dd-84a7-e55a89bdbe49	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-18 15:06:45.920579+00	
00000000-0000-0000-0000-000000000000	e12e9063-dcbb-4311-b1d4-04215c1b5dd7	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-18 15:06:45.942193+00	
00000000-0000-0000-0000-000000000000	96ba8952-368f-41ac-a0cc-8170cd6a550b	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-18 16:43:32.050201+00	
00000000-0000-0000-0000-000000000000	82b9ba3c-b8e7-418e-8ea1-56fb76878ef0	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-18 16:43:32.068634+00	
00000000-0000-0000-0000-000000000000	9f693843-1267-4b6d-8d5f-c10b8fda83eb	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-18 18:03:49.950597+00	
00000000-0000-0000-0000-000000000000	46b0a2ec-022c-4eb6-834e-566af47818bb	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-18 18:03:49.977802+00	
00000000-0000-0000-0000-000000000000	00f2eb73-4d92-4c8a-b521-309d02b14f21	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-18 18:36:50.106705+00	
00000000-0000-0000-0000-000000000000	c64946dc-7ce8-4b05-a52e-a2d5d62dd6d9	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-18 18:37:40.050395+00	
00000000-0000-0000-0000-000000000000	3d6408f6-43e5-40dc-9bf2-5171c8d60dab	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-18 19:36:45.372986+00	
00000000-0000-0000-0000-000000000000	a88b73a9-094e-4da9-a6ab-135227514e49	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-18 19:36:45.383785+00	
00000000-0000-0000-0000-000000000000	488e477f-6320-4cff-8cbd-1c06490ce456	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-19 13:48:14.351687+00	
00000000-0000-0000-0000-000000000000	3c9b4886-1c93-427d-8fb7-e369cfc8f211	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-19 13:48:14.381455+00	
00000000-0000-0000-0000-000000000000	74c1cf0f-8e7d-4f05-91c6-a0643dff46aa	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-19 22:03:32.613209+00	
00000000-0000-0000-0000-000000000000	102ea90c-adb3-42ea-a625-d17862b7186c	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-19 22:03:32.644687+00	
00000000-0000-0000-0000-000000000000	8b2b1894-02ab-4290-bc95-684386ca462d	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-20 14:28:39.66698+00	
00000000-0000-0000-0000-000000000000	4f062784-be26-4f5f-9fb3-60e78dc10e54	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-20 17:34:28.197341+00	
00000000-0000-0000-0000-000000000000	81878b86-f82c-422c-8359-adbb95f87541	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-20 17:34:28.222974+00	
00000000-0000-0000-0000-000000000000	2a664a6b-bdc4-4414-8efe-d01b812fef6d	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-20 17:46:31.35186+00	
00000000-0000-0000-0000-000000000000	325eb735-69b3-4633-88ec-0a567206e5c2	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"single@example.com","user_id":"52b07d2f-7543-43bd-8faa-883e351ec372","user_phone":""}}	2025-10-20 17:55:28.117422+00	
00000000-0000-0000-0000-000000000000	649d6117-71e7-437a-b4f2-b1b16b412390	{"action":"user_recovery_requested","actor_id":"52b07d2f-7543-43bd-8faa-883e351ec372","actor_username":"single@example.com","actor_via_sso":false,"log_type":"user"}	2025-10-20 17:55:32.944856+00	
00000000-0000-0000-0000-000000000000	6f149d24-1414-48d7-8c64-02530e35bd26	{"action":"login","actor_id":"52b07d2f-7543-43bd-8faa-883e351ec372","actor_username":"single@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-20 17:55:33.070804+00	
00000000-0000-0000-0000-000000000000	a41c0b24-2623-4445-9db3-e4cef502dc74	{"action":"user_recovery_requested","actor_id":"52b07d2f-7543-43bd-8faa-883e351ec372","actor_username":"single@example.com","actor_via_sso":false,"log_type":"user"}	2025-10-20 17:57:26.857898+00	
00000000-0000-0000-0000-000000000000	1eef600a-cf3e-44b1-800a-5f7d7a2873fd	{"action":"login","actor_id":"52b07d2f-7543-43bd-8faa-883e351ec372","actor_username":"single@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-20 17:57:26.956212+00	
00000000-0000-0000-0000-000000000000	df6d5bff-1ee6-4796-8045-655de3ac0cf4	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-20 18:35:14.891886+00	
00000000-0000-0000-0000-000000000000	b58edc10-8a1e-4a74-a690-7c7f26ffb576	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-20 18:35:15.373209+00	
00000000-0000-0000-0000-000000000000	5b3b1ced-a345-4359-b000-66dae7adffa6	{"action":"logout","actor_id":"52b07d2f-7543-43bd-8faa-883e351ec372","actor_username":"single@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-20 18:40:13.989616+00	
00000000-0000-0000-0000-000000000000	59484ed9-089a-4dcb-acb7-3129c5e1121a	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-20 18:46:10.18671+00	
00000000-0000-0000-0000-000000000000	2993580a-0536-41e1-91e3-b415900aaf27	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-20 18:46:10.641136+00	
00000000-0000-0000-0000-000000000000	24572826-5c9b-49eb-8e01-f2484b116bb0	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-20 18:49:18.176912+00	
00000000-0000-0000-0000-000000000000	88ac56d6-a754-4aa3-beb4-f4a0024ae875	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-20 22:47:48.76027+00	
00000000-0000-0000-0000-000000000000	67bef033-66a4-450a-9cb2-83bc908051a8	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-20 23:07:21.190069+00	
00000000-0000-0000-0000-000000000000	b0facb49-ba14-4f7b-8d12-9e252a43128c	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-20 23:15:05.237916+00	
00000000-0000-0000-0000-000000000000	3c0bc9e1-31f5-41a6-b015-b12b0582ac46	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-20 23:19:26.128219+00	
00000000-0000-0000-0000-000000000000	c1e42d01-aafe-44d8-ab82-a4503b732def	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 00:47:07.370263+00	
00000000-0000-0000-0000-000000000000	d2d86041-04aa-4ed9-a09d-747ae1c46716	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 00:47:07.392969+00	
00000000-0000-0000-0000-000000000000	ee671f49-cf95-45b0-a4b2-4fe4211044b3	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 01:46:10.226026+00	
00000000-0000-0000-0000-000000000000	c89b99bc-a726-4005-af28-75a30f62c58b	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 01:46:10.242297+00	
00000000-0000-0000-0000-000000000000	e8121e88-0795-4824-b85e-d8219c511324	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 16:54:17.710131+00	
00000000-0000-0000-0000-000000000000	6f128833-4140-4856-8ff0-8c7b65199795	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 16:54:17.744377+00	
00000000-0000-0000-0000-000000000000	44a781fe-2b88-4af7-b37d-a947b28a1ad7	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 16:54:17.857346+00	
00000000-0000-0000-0000-000000000000	be4ebdf8-a307-43fe-9a62-7b8ccc7c484c	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 17:52:49.118465+00	
00000000-0000-0000-0000-000000000000	3d8c75c5-3e32-4673-a9b5-563697564a98	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 17:52:49.136981+00	
00000000-0000-0000-0000-000000000000	80ad3ad5-dc87-4e7e-93e6-91dd45d59081	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 17:52:49.289614+00	
00000000-0000-0000-0000-000000000000	0377dc68-721c-44db-865b-f56f2f925ac1	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 17:52:49.302814+00	
00000000-0000-0000-0000-000000000000	440cd406-54fe-4459-8fff-cac98b517d8c	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 18:59:45.256947+00	
00000000-0000-0000-0000-000000000000	8c4e7ebc-eb40-48e9-882e-ab19c872efec	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 18:59:45.268246+00	
00000000-0000-0000-0000-000000000000	ab391f5a-fcd1-45da-bfaa-d9827bd30772	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"tjhixon@gmail.com","user_id":"7a79e16b-242f-4a34-b660-45d76273807a","user_phone":""}}	2025-10-21 19:04:59.95989+00	
00000000-0000-0000-0000-000000000000	58e85d1e-6c4e-48c9-9696-10c671f94943	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-21 19:05:00.619215+00	
00000000-0000-0000-0000-000000000000	baaaab9e-c1d8-461f-a78a-a9654b254fd6	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 19:58:20.969457+00	
00000000-0000-0000-0000-000000000000	851c7050-0c6e-40c5-ad2b-028aca050dd8	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 19:58:20.983181+00	
00000000-0000-0000-0000-000000000000	11898f43-49aa-4e04-a53d-3a10877cae2c	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 23:13:11.999443+00	
00000000-0000-0000-0000-000000000000	2c91fc49-1386-41b4-b185-7cbafe5f6375	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 23:13:12.023848+00	
00000000-0000-0000-0000-000000000000	f3b15aac-6574-47ae-9159-08d4f588d37c	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 01:08:10.396759+00	
00000000-0000-0000-0000-000000000000	e7860fe6-a52d-476b-a99c-51ea90d81762	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 01:08:10.424128+00	
00000000-0000-0000-0000-000000000000	d7a847b4-8edd-4d60-9873-7c33057ff731	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 01:14:03.833045+00	
00000000-0000-0000-0000-000000000000	4b0d292e-98d6-4978-8fe4-e8e94844c30d	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 01:14:39.376002+00	
00000000-0000-0000-0000-000000000000	266a9e00-14c8-4875-b077-4d7d0f8bf8b3	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 01:17:58.592241+00	
00000000-0000-0000-0000-000000000000	b2f62f36-791f-459c-b645-24eee2d9612c	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 01:19:30.439978+00	
00000000-0000-0000-0000-000000000000	b38bfb00-96b5-444d-9981-12b100c24514	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 01:22:40.230196+00	
00000000-0000-0000-0000-000000000000	ef9c4493-b606-4b54-8091-ae59b7710c5b	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 01:23:43.066011+00	
00000000-0000-0000-0000-000000000000	bdc9f618-98e9-4b4c-8b21-d6f9e734fa73	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 01:25:14.729361+00	
00000000-0000-0000-0000-000000000000	c95a6ef9-cca2-473f-9aa0-2633c85b85d2	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 01:26:55.276141+00	
00000000-0000-0000-0000-000000000000	73379765-0d37-47d9-8697-e1c6e18d6123	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 01:29:14.131247+00	
00000000-0000-0000-0000-000000000000	866231dd-c948-4589-8e90-7864b2638199	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 01:31:00.149344+00	
00000000-0000-0000-0000-000000000000	e662de9c-cb64-4161-967c-d72b9297f3cb	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 01:33:15.170968+00	
00000000-0000-0000-0000-000000000000	de6922b8-14eb-4d33-a2f1-15614ce78895	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 01:37:08.236813+00	
00000000-0000-0000-0000-000000000000	c3a45f8c-c4cf-4a90-8feb-4db70d670009	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 01:38:37.522423+00	
00000000-0000-0000-0000-000000000000	594cf204-d99e-4eea-8302-c7547c086099	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 01:39:17.167406+00	
00000000-0000-0000-0000-000000000000	91116e98-8917-42da-a6a4-234a098a7793	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 01:40:03.335142+00	
00000000-0000-0000-0000-000000000000	61255f8d-a3b5-4425-b3e4-e683fafe9115	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 01:41:08.177711+00	
00000000-0000-0000-0000-000000000000	697497e7-67bb-4cf6-9beb-cab17cbcc9f0	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 14:42:27.097693+00	
00000000-0000-0000-0000-000000000000	b011d0bb-345c-461e-ad6c-72808d0c1835	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 14:42:27.342336+00	
00000000-0000-0000-0000-000000000000	0f76d562-94c8-48c9-aa95-38d76f76bba1	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 14:47:17.511+00	
00000000-0000-0000-0000-000000000000	577d986c-d0d9-4a2c-a7b0-d8ef1d868428	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 15:06:11.773585+00	
00000000-0000-0000-0000-000000000000	dd964234-223e-4f78-8369-3cf39981c61b	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 15:07:07.707801+00	
00000000-0000-0000-0000-000000000000	9a125a2f-ba79-4617-96c9-ae0a536b0efe	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 15:13:09.349657+00	
00000000-0000-0000-0000-000000000000	1c86f4e5-4d27-4e52-94a8-c42bd3451c2d	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 15:22:30.492284+00	
00000000-0000-0000-0000-000000000000	5eb65c87-cc3f-43fc-904c-ca33f72625f2	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 15:26:47.875225+00	
00000000-0000-0000-0000-000000000000	d92fa9c7-f06a-4371-ba77-96accdd6b130	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-22 15:56:05.181867+00	
00000000-0000-0000-0000-000000000000	548b6ef1-328e-46f1-b3be-1f6e3b41ff96	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-22 15:56:14.156744+00	
00000000-0000-0000-0000-000000000000	6f3ba27b-be0c-4401-ba02-1c5f321b77ef	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-22 15:56:14.927126+00	
00000000-0000-0000-0000-000000000000	e9172a19-8043-4ab6-b0c9-6c7a8cd7c6de	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"single@example.com","user_id":"52b07d2f-7543-43bd-8faa-883e351ec372","user_phone":""}}	2025-10-22 15:56:46.010629+00	
00000000-0000-0000-0000-000000000000	3b5b6f6c-0a72-4b2c-92da-614e9e7bd64d	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"test@example.com","user_id":"4bfddc9b-9328-49f1-8116-db50d3febc4b","user_phone":""}}	2025-10-22 15:56:46.024133+00	
00000000-0000-0000-0000-000000000000	aa3a27bf-fa30-4708-bb88-e638c5986bf4	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"stage@example.com","user_id":"e9a89cf7-3cb8-4f55-af94-841a93936450","user_phone":""}}	2025-10-22 15:56:46.027329+00	
00000000-0000-0000-0000-000000000000	4cf05455-9454-4505-80e5-d6b74a5f3579	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@example.com","user_id":"c6f421a2-885a-45fb-9921-c790282b8e93","user_phone":""}}	2025-10-22 15:56:46.038011+00	
00000000-0000-0000-0000-000000000000	a0701949-2fc0-4f8f-9fdd-e4c8ed01b380	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 16:55:08.28578+00	
00000000-0000-0000-0000-000000000000	bdbb9502-4d17-407d-bb94-40c824b7be8b	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 18:46:38.80427+00	
00000000-0000-0000-0000-000000000000	c722952b-21b1-45f6-86c2-4bf70858f124	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 18:46:38.835023+00	
00000000-0000-0000-0000-000000000000	1be6768d-6df0-4fa9-9e48-b687a80baf66	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-22 19:11:58.487735+00	
00000000-0000-0000-0000-000000000000	0233eace-8f06-48f6-a5ec-bb7cfd8497e5	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-22 19:12:03.77358+00	
00000000-0000-0000-0000-000000000000	eb99ef77-b129-465d-a613-c768717cbf40	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-22 19:12:12.803821+00	
00000000-0000-0000-0000-000000000000	10faa5d6-636c-45ac-a04d-94f5efcfcc71	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-22 19:12:14.127827+00	
00000000-0000-0000-0000-000000000000	ca757d8a-9d23-4293-b798-e5f3db425d8b	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 22:14:24.189382+00	
00000000-0000-0000-0000-000000000000	8bac871e-5f89-4f0c-bc38-df67afd68698	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 22:14:40.958138+00	
00000000-0000-0000-0000-000000000000	d8c19a46-d02f-499e-a188-61fd1113fa66	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 00:28:12.992559+00	
00000000-0000-0000-0000-000000000000	45240f35-fef3-46e7-a53b-84963b56600e	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 00:28:13.02488+00	
00000000-0000-0000-0000-000000000000	b5642b22-813e-4ad0-8181-5ea02cbfdf23	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-24 15:22:54.619646+00	
00000000-0000-0000-0000-000000000000	75a46ed3-3c64-4599-89ad-745895e2cb6b	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-24 15:22:54.643786+00	
00000000-0000-0000-0000-000000000000	6d096886-050e-44c4-ac6e-91cdbd170d07	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-24 21:55:47.087733+00	
00000000-0000-0000-0000-000000000000	ee40c193-7957-4039-b375-10a221c400f3	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-24 21:57:56.318629+00	
00000000-0000-0000-0000-000000000000	cab92e87-fb98-4ee3-a926-5aaea5ecf08e	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-24 21:58:04.878114+00	
00000000-0000-0000-0000-000000000000	3cc7dadf-0896-46b6-835f-e2cc84c729d5	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-24 23:44:28.962058+00	
00000000-0000-0000-0000-000000000000	79cd36db-e4fb-49ea-94fa-0d7951cdca3c	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-24 23:46:42.973903+00	68.53.242.179:7755
00000000-0000-0000-0000-000000000000	ea07929b-c3c7-41ad-8024-8111f75f2cff	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"cfa33a7d-be40-4008-8491-101b35b6dfc2","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-24 23:46:43.188791+00	68.53.242.179:46819
00000000-0000-0000-0000-000000000000	9d6396dd-2220-444a-9c98-27c377a183c5	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-24 23:46:43.196317+00	
00000000-0000-0000-0000-000000000000	c9d6bfdd-94ae-4fb1-a5a8-9d070c6e9e0d	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-24 23:46:50.370028+00	
00000000-0000-0000-0000-000000000000	194c1b58-605a-41f3-a629-cbf358e8a84e	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-24 23:46:57.142099+00	68.53.242.179:46819
00000000-0000-0000-0000-000000000000	4f798495-9404-4e81-8fd1-6026a72412f6	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"28d75b47-aed2-447b-be15-2d23c2e69ba4","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-24 23:46:57.293921+00	68.53.242.179:7755
00000000-0000-0000-0000-000000000000	874e512c-97b7-406b-92ff-2ff69fd10ff2	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-24 23:46:57.297375+00	
00000000-0000-0000-0000-000000000000	63282f4b-70f0-4cfc-83e8-6673f4063635	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 03:29:37.073283+00	
00000000-0000-0000-0000-000000000000	18858eac-731d-4b33-b2e9-4757709f91f6	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 03:29:37.101602+00	
00000000-0000-0000-0000-000000000000	ff623371-bcc6-45ed-852b-e8d2fba5417c	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 03:29:37.17802+00	
00000000-0000-0000-0000-000000000000	c7f8272d-86c2-4bc1-a91b-f6ad3e3f66f0	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"tjhixon+mock@gmail.com","user_id":"11c3e860-ac30-4370-8ffb-578695aa1edf","user_phone":""}}	2025-10-22 15:56:46.037029+00	
00000000-0000-0000-0000-000000000000	2da3ce33-e7b6-4394-84a5-872ae8475c2d	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 15:59:45.999418+00	
00000000-0000-0000-0000-000000000000	b15548af-0746-4060-af7c-f1b85bb2329f	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-22 16:00:34.729364+00	
00000000-0000-0000-0000-000000000000	a1d611f3-1d5f-4a13-819c-602e6db8dc8e	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-22 16:00:41.156738+00	
00000000-0000-0000-0000-000000000000	2ffdb303-8664-4bc9-8a73-04bc7c08c54e	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-22 16:00:41.635903+00	
00000000-0000-0000-0000-000000000000	24ecb729-f4a7-4a6e-8884-658bc3fec484	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-22 16:57:00.131793+00	
00000000-0000-0000-0000-000000000000	c6408dda-e350-4292-a9cf-0a4ffc7f8192	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-22 16:57:08.281007+00	
00000000-0000-0000-0000-000000000000	089d66fc-d9ec-4877-8ba4-45bed167b198	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-22 16:57:41.96022+00	
00000000-0000-0000-0000-000000000000	26658354-1806-4602-bdc2-a9b7378a0e2b	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-22 16:57:42.777348+00	
00000000-0000-0000-0000-000000000000	b78d8546-5b8f-4536-a3f3-56b4f741d832	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 16:58:50.013379+00	
00000000-0000-0000-0000-000000000000	cd714001-f935-4a9d-a898-672b4ad3b63c	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 18:46:38.906068+00	
00000000-0000-0000-0000-000000000000	f9f5c92e-7387-4c46-829b-a1651eb426e7	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-22 19:29:37.342425+00	
00000000-0000-0000-0000-000000000000	0b62b63a-0a4b-4fa1-9d82-e7839a645d84	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 00:00:36.10598+00	
00000000-0000-0000-0000-000000000000	7b4df3e0-46cd-49cc-8d31-da0f1b1c66d5	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 00:00:36.139681+00	
00000000-0000-0000-0000-000000000000	3812fb84-42e0-4f6a-8078-90e5c0aef269	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 03:55:22.922141+00	
00000000-0000-0000-0000-000000000000	fb509797-b7fb-488d-8ead-32e0b36ca614	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 03:55:22.953791+00	
00000000-0000-0000-0000-000000000000	1b64e42a-451e-4bb0-a944-b6d475c7b799	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-24 18:05:34.266198+00	
00000000-0000-0000-0000-000000000000	04d25efa-a519-4dbf-bce9-b38ca92b1510	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-24 18:05:34.280283+00	
00000000-0000-0000-0000-000000000000	011e8d3f-567a-4543-95fc-428fcc201337	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-24 21:56:18.200741+00	
00000000-0000-0000-0000-000000000000	ac901e86-9493-4ab1-b6dd-811d60734769	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-24 21:56:25.710262+00	
00000000-0000-0000-0000-000000000000	57dc92d9-5ff3-4d6b-b2ec-b5b460025aae	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-24 21:56:54.46426+00	68.53.242.179:61009
00000000-0000-0000-0000-000000000000	140da34e-b5af-44c6-90f3-3ca995ad3ec3	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"29a87657-1d79-4817-bf14-f51ef328279a","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-24 21:56:54.600745+00	68.53.242.179:61009
00000000-0000-0000-0000-000000000000	e762c4b6-43c6-4d54-900b-ce42dcfa808c	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-24 21:56:54.604929+00	
00000000-0000-0000-0000-000000000000	d8380e47-4abe-4889-84d7-02a1b4f9868f	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-24 21:57:01.92729+00	
00000000-0000-0000-0000-000000000000	eab231b9-5b31-45b8-9b66-371874768046	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-24 21:57:08.484198+00	68.53.242.179:61009
00000000-0000-0000-0000-000000000000	7345a2f0-a6eb-4111-8607-efd83542d170	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"a5da6e9a-3084-44e9-a7cd-55a6f797764f","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-24 21:57:08.592447+00	68.53.242.179:61009
00000000-0000-0000-0000-000000000000	72662b17-1b73-4f39-9005-85a19ec971c3	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-24 21:57:08.595883+00	
00000000-0000-0000-0000-000000000000	e4c33733-a946-41d8-a569-66913d156189	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-24 21:57:20.250594+00	
00000000-0000-0000-0000-000000000000	40a747f5-c8b8-4504-9aac-1cf9fd0719e7	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-24 21:57:26.086541+00	
00000000-0000-0000-0000-000000000000	4d7b7353-7239-4838-ac53-3a62f80fce2b	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 03:30:46.974639+00	68.53.242.179:12053
00000000-0000-0000-0000-000000000000	f2a194a3-2d34-4b38-8c90-e2e3a3cbc4a9	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 03:30:58.131024+00	68.53.242.179:12037
00000000-0000-0000-0000-000000000000	cff85483-42b4-4685-ba17-85d6a470636c	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"cc11449b-465b-4d3d-ac7b-0972ce136618","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-25 03:30:58.217948+00	68.53.242.179:12053
00000000-0000-0000-0000-000000000000	6d377283-ba29-4b68-9e98-e8dd2d32852b	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 03:30:58.224654+00	
00000000-0000-0000-0000-000000000000	30f92250-ff3f-4ac1-acf0-8902e19b010e	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-25 04:01:16.998319+00	
00000000-0000-0000-0000-000000000000	6dd8caf6-79a7-40b9-bafa-4add8d09c7d6	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 04:01:24.12729+00	
00000000-0000-0000-0000-000000000000	8a87e833-5d98-401c-b3c7-5487dccbce45	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 04:08:37.660055+00	
00000000-0000-0000-0000-000000000000	69b5faea-a343-4d98-bdee-59f8bac7537c	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 04:10:09.314421+00	
00000000-0000-0000-0000-000000000000	70cc34fe-0a77-4d81-8fe5-73eecf952c33	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 04:10:24.437835+00	68.53.242.179:44163
00000000-0000-0000-0000-000000000000	292b3b12-b857-4953-a663-c1c54ef665f5	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"c3b32b88-bdf0-49f6-927f-255aff1a2683","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-25 04:10:24.60186+00	68.53.242.179:44163
00000000-0000-0000-0000-000000000000	868d3280-942f-47a1-9901-5d7285ae8731	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 04:10:24.665621+00	
00000000-0000-0000-0000-000000000000	590cce80-4180-4205-8ceb-d4cc002dd5e1	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 04:10:34.282975+00	
00000000-0000-0000-0000-000000000000	9f1f1be9-3062-4a3a-82ea-43a8de796f53	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 04:10:42.15348+00	68.53.242.179:44163
00000000-0000-0000-0000-000000000000	91f88aaf-fb2a-453b-b2d1-8fe523003174	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"11600b46-a65a-46be-a805-cccd3d6a1df4","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-25 04:10:42.247353+00	68.53.242.179:44163
00000000-0000-0000-0000-000000000000	547e9afb-a7a9-4392-a3d6-20827caf8eae	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 04:10:42.451798+00	
00000000-0000-0000-0000-000000000000	645f50fc-d78e-4de6-a677-7d6cf9da7c7c	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 04:13:47.25522+00	
00000000-0000-0000-0000-000000000000	8b57959d-5ab0-4a6c-8350-3003200c6cff	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 04:14:02.278592+00	68.53.242.179:44163
00000000-0000-0000-0000-000000000000	eb863c33-327e-4103-8781-ef08dd6c61cd	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 04:14:08.50013+00	68.53.242.179:44163
00000000-0000-0000-0000-000000000000	30218cda-6b56-45bb-b526-f7c65d9c484b	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"86b543cb-067b-44fd-a06a-29ec7c815502","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-25 04:14:08.592047+00	68.53.242.179:12053
00000000-0000-0000-0000-000000000000	8b3d920f-743f-4f42-80a2-bc659e883575	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 04:14:08.602588+00	
00000000-0000-0000-0000-000000000000	4d712e01-fec6-40d1-8d77-fdb74438f6ca	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 04:30:57.856302+00	
00000000-0000-0000-0000-000000000000	379d61ec-f206-4d76-87d0-f92ac2b8dd8b	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:16:58.862545+00	
00000000-0000-0000-0000-000000000000	3047b7a0-5104-426c-9bfa-8edd867fbf63	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:16:58.889691+00	
00000000-0000-0000-0000-000000000000	aefd6bf4-44d5-43d0-ba7a-546780451637	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:16:58.962836+00	
00000000-0000-0000-0000-000000000000	39b58b7b-92de-4097-b67e-c7a47d8cc633	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:17:00.447253+00	
00000000-0000-0000-0000-000000000000	1df57373-5c5a-42cc-a38c-b7100da9f78e	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:18:05.049762+00	
00000000-0000-0000-0000-000000000000	fb95e71f-36d1-463d-879d-79f3c5cc695a	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-25 14:21:51.189416+00	
00000000-0000-0000-0000-000000000000	ed698be7-1599-4188-86ea-dc1dd2c3ed51	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:22:00.447963+00	
00000000-0000-0000-0000-000000000000	828c0fb0-d9f0-46dc-92df-2ae75c280390	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 14:22:15.283251+00	68.53.242.179:41325
00000000-0000-0000-0000-000000000000	151b7ee5-3961-4572-a9bd-7367a4d619f5	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"57d7806e-65fb-4db8-9397-a7ea78a47d45","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-25 14:22:15.442945+00	68.53.242.179:32945
00000000-0000-0000-0000-000000000000	0f48ed5b-75bc-4677-89ec-8c8aeffd172a	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:22:15.45688+00	
00000000-0000-0000-0000-000000000000	2b2e7900-0725-4634-ac6b-36afa229df1b	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-25 14:23:03.436921+00	
00000000-0000-0000-0000-000000000000	2a935240-1a43-4cf2-90e4-2d46c556b3c8	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:23:13.673326+00	
00000000-0000-0000-0000-000000000000	93f88623-e6e9-49bb-9956-8f0038cdaadc	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 14:23:23.442005+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	c2d452ea-cb62-4472-933c-f6743dc247e4	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:31:25.172872+00	
00000000-0000-0000-0000-000000000000	744eee21-7bbe-42d6-9e51-0719bee76e96	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"05bc17f3-262c-4a05-87b7-5c4852b26c21","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-25 14:23:23.516417+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	56ab7a5a-9557-497a-b7ca-00e79fdd2ee7	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:23:23.523731+00	
00000000-0000-0000-0000-000000000000	f432ec56-ccff-445a-86f8-82e2e4b3e93a	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-25 14:23:31.004558+00	
00000000-0000-0000-0000-000000000000	15259c5c-b13e-4d60-87f0-1150d33812d4	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:23:53.265915+00	
00000000-0000-0000-0000-000000000000	19a02ef7-5ecc-4d18-abcc-3b35c2e590d0	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 14:24:05.105724+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	d3bd1c45-8204-45e7-a1eb-80660c2b5fbd	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"e09a1b74-caa4-4b12-89ee-4f9db3931c50","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-25 14:24:05.227812+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	ad91f1ed-259d-49c3-a135-0a44e5d55abd	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:24:05.231281+00	
00000000-0000-0000-0000-000000000000	6864a20e-38e7-43d9-80fb-4d1790e05598	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:24:18.348207+00	
00000000-0000-0000-0000-000000000000	c345ccc8-88cb-4ecb-84f8-d57552db789c	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 14:24:27.077089+00	68.53.242.179:32945
00000000-0000-0000-0000-000000000000	9544e2eb-77cb-4a90-a812-6c30697e9b58	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"4d3bd06a-8848-4d44-9ca8-fb8a6d4f9314","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-25 14:24:27.171915+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	f69f0252-858e-4a08-90e9-69489b1c27fa	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:24:27.175448+00	
00000000-0000-0000-0000-000000000000	0abdd13e-6fb6-4fb1-b882-9b8ca7bdac81	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:24:47.201936+00	
00000000-0000-0000-0000-000000000000	09efeccc-4510-41fe-87f1-8a6443aaaf65	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 14:24:53.054165+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	88edc3c0-ab66-4c93-85ef-4e8aa9394d80	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 14:25:03.26942+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	252333bb-a680-4ab8-825d-5a57ef352b5e	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"3ad531ef-eb21-4029-acf2-49998772cbf0","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-25 14:25:03.350178+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	3cc2116d-42b1-44a4-86b0-f94b99f8d67d	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:25:03.353711+00	
00000000-0000-0000-0000-000000000000	9894b5ae-1cb1-4c18-bf51-416f123f685d	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-25 14:29:20.16899+00	
00000000-0000-0000-0000-000000000000	27e69c35-3cdb-4941-99cd-9b609daa333f	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:30:01.9908+00	
00000000-0000-0000-0000-000000000000	a29268e3-b516-4e3d-b33d-cafd8a6c9a7d	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 14:30:11.839045+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	bf535aca-c283-484a-a469-c15186862879	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 14:30:21.479224+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	8586f1f9-09a8-4286-9e06-53f76bfd1844	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"c027ab55-6696-4d50-82d4-d20c067955f1","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-25 14:30:21.550662+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	a2cabb1a-7633-4cd2-a4b7-f1e367523036	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:30:21.555781+00	
00000000-0000-0000-0000-000000000000	1ce528fe-fd06-4c1e-a71b-412a45b9c578	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-25 14:30:38.347546+00	
00000000-0000-0000-0000-000000000000	f6c96ca3-93a3-4642-9360-dce272ac83b3	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:31:15.787983+00	
00000000-0000-0000-0000-000000000000	27ea58fe-02a0-4e85-94e9-30c7376538f9	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 14:31:24.978538+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	ae2e5fdb-6827-49bf-9fcb-3320d23e534d	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"c2dc40dd-66b1-47a6-8d7b-b62063de2ccd","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-25 14:31:25.124608+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	35bde19c-740a-490f-9b2f-803618e4fb46	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:32:07.381294+00	
00000000-0000-0000-0000-000000000000	363bea6c-21cb-408e-aa45-cd439cc40094	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 14:32:16.3896+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	89f294b4-cf39-4fe4-b16a-7fedaa4e4dd5	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"7831d9ec-f459-4d83-94d5-b30274221b95","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-25 14:32:16.505019+00	68.53.242.179:32945
00000000-0000-0000-0000-000000000000	a3340490-f465-4a52-9754-3c5be34b3b6a	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:32:16.510842+00	
00000000-0000-0000-0000-000000000000	45d0c8e8-e3dc-474f-8edb-86c0ea9c7e9a	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:32:23.728955+00	
00000000-0000-0000-0000-000000000000	cf418f1c-c121-4c60-9152-79d50833e88d	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 14:32:28.184724+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	a1ae6035-14c6-4da1-b0f4-3bbfa2ab2d60	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 14:32:37.599203+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	02c03138-abe7-4d50-a936-1293728761bd	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"bd95e20f-9af0-4d93-b9bb-a9165da2617d","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-25 14:32:37.674681+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	22de212f-5388-4d0a-b095-7643fb410eea	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:32:37.678228+00	
00000000-0000-0000-0000-000000000000	6be1f971-16a2-4d78-b8dd-926bfc9ef6da	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:33:03.277295+00	
00000000-0000-0000-0000-000000000000	52a2606f-c61c-434e-9f04-e877f0fd2dfa	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:33:14.959507+00	
00000000-0000-0000-0000-000000000000	6ffad8a2-e5d4-4164-a784-0b3361ddc263	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:33:32.651381+00	
00000000-0000-0000-0000-000000000000	7218aaff-0d6b-4da0-b9f1-a5b14ebdb29d	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:38:02.841675+00	
00000000-0000-0000-0000-000000000000	5735a2cf-7424-4460-bdcd-965a024b4d9b	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 14:38:13.143761+00	68.53.242.179:32945
00000000-0000-0000-0000-000000000000	0885d691-1a97-43f3-b2e1-fada2cafb9ad	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"27ad07ff-01db-4236-9b0b-aa90c500ec76","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-25 14:38:13.274151+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	8021f9c1-936d-49ff-a740-b2d142af3eaf	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:38:13.282276+00	
00000000-0000-0000-0000-000000000000	71a922fe-df45-4cfc-979f-c750750c6a4b	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-25 14:38:38.938179+00	
00000000-0000-0000-0000-000000000000	9c657554-40f6-4941-8867-244837d52829	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:38:39.022341+00	
00000000-0000-0000-0000-000000000000	16f50d30-4a8b-4a3a-8ee4-00ded98a5c48	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 14:38:49.757294+00	68.53.242.179:32945
00000000-0000-0000-0000-000000000000	d6fac66f-22d0-4f37-a635-9230047f6183	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"d68e8d93-4945-4b00-9f25-6018ae4adb99","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-25 14:38:49.854089+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	760cbfad-66cd-46eb-818d-ff1f7a2cb213	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:38:49.860774+00	
00000000-0000-0000-0000-000000000000	168f41ba-0993-4951-92b8-b9ec3b123522	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-25 14:38:57.78359+00	
00000000-0000-0000-0000-000000000000	b4207ec1-b58c-4e5d-9911-deba838ee298	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:38:57.957249+00	
00000000-0000-0000-0000-000000000000	037de814-e158-4fd0-81d1-35f5b029089a	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-25 14:39:42.64986+00	
00000000-0000-0000-0000-000000000000	d86710fc-f623-496c-9469-5078c73b40cb	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:39:42.74415+00	
00000000-0000-0000-0000-000000000000	f48e7bef-4319-406d-85d8-e5bef408137f	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 14:39:52.258319+00	68.53.242.179:32945
00000000-0000-0000-0000-000000000000	f5a760e3-4f06-4877-abc5-faa8c84467c2	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"767eb5a0-c8f8-4e44-a0e0-67b6ee6aacd4","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-25 14:39:52.335383+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	491648ee-c145-4795-b65e-c7feec5bea00	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:39:52.339787+00	
00000000-0000-0000-0000-000000000000	8c16cf4e-3d91-4e2d-9a21-ebf87548fc68	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:40:41.687689+00	
00000000-0000-0000-0000-000000000000	94ca69a2-5e58-4e2a-a90d-517f9a26f7d9	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:40:49.714368+00	
00000000-0000-0000-0000-000000000000	a049b4e7-8286-44bc-abef-33b26a02e5cb	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:42:36.957785+00	
00000000-0000-0000-0000-000000000000	d94bf905-b31c-43ae-9492-918e97ba587d	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-25 14:42:50.249913+00	68.53.242.179:32945
00000000-0000-0000-0000-000000000000	0e6a5372-7e43-468f-ba59-d0c370d4a420	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"03abfaa3-0817-4cc0-80dd-671948b76a4d","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-25 14:42:50.329335+00	68.53.242.179:32949
00000000-0000-0000-0000-000000000000	a9e6b2db-48cf-47c2-b62d-71eed634122b	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:42:50.337092+00	
00000000-0000-0000-0000-000000000000	d067cab3-b88c-4db3-9e88-c6c43daa3e11	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 14:43:45.714215+00	
00000000-0000-0000-0000-000000000000	2ba30863-71c0-4fc8-b61c-f4f81772ff84	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 15:02:16.070137+00	
00000000-0000-0000-0000-000000000000	eb422b80-2495-455c-b18d-a6c367e76ba6	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 15:02:27.364031+00	
00000000-0000-0000-0000-000000000000	3e03fb15-faa6-461d-8ddb-e25bb6b0f061	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 15:02:58.884666+00	
00000000-0000-0000-0000-000000000000	0138617a-afa4-4780-8bd3-f80f6c423d73	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 15:09:31.703803+00	
00000000-0000-0000-0000-000000000000	527305e9-ac1a-48ff-8ced-8bcb950407d8	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 15:09:54.176791+00	
00000000-0000-0000-0000-000000000000	892c4b6c-c4b6-4013-b062-c968e893fe59	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 15:10:44.61547+00	
00000000-0000-0000-0000-000000000000	fd09cf8f-0498-46cb-9457-e235bf80f31a	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 15:10:50.380071+00	
00000000-0000-0000-0000-000000000000	7d6bfd0a-5762-4f75-8a06-c13a4bca8298	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 15:10:51.30998+00	
00000000-0000-0000-0000-000000000000	4d32b02e-cfe6-422d-b1ec-b41a156d10a1	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 15:10:52.194009+00	
00000000-0000-0000-0000-000000000000	fa8d33a2-f5e4-4587-b9aa-41df8e1452ae	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 15:11:52.306928+00	
00000000-0000-0000-0000-000000000000	2e657220-b7b6-4c6f-8c93-6a6428281b38	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 15:14:18.409077+00	
00000000-0000-0000-0000-000000000000	73290f76-dc02-41ec-8f21-80932d86423f	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-25 15:14:50.967535+00	
00000000-0000-0000-0000-000000000000	1caba5c6-911a-40ee-9863-bdccefb200a3	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-25 15:15:00.877781+00	
00000000-0000-0000-0000-000000000000	8587675c-c2ab-4fd4-9173-70243e204e40	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-25 15:15:01.645796+00	
00000000-0000-0000-0000-000000000000	2801b622-46ce-416c-ac9d-0983e3f28047	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 15:18:35.833582+00	
00000000-0000-0000-0000-000000000000	ed5da84d-1b88-41c9-afa0-110914541bfc	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-26 13:20:12.5166+00	
00000000-0000-0000-0000-000000000000	2b4d327e-04f8-4f01-86e5-a2ef10bc613e	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-26 13:20:41.321082+00	68.53.242.179:48493
00000000-0000-0000-0000-000000000000	0f4c2ac8-5a41-45d0-9ce5-e72c299269a3	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"10f35f36-d106-40ec-878d-76b25d828f65","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-26 13:20:41.437647+00	68.53.242.179:48493
00000000-0000-0000-0000-000000000000	aa4b4045-1cc8-4096-8b3b-a7b4b8c121b9	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 13:20:41.449637+00	
00000000-0000-0000-0000-000000000000	c37a94ae-a5c6-4213-9fde-6527d2e99f2e	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-26 13:21:44.499975+00	
00000000-0000-0000-0000-000000000000	27fb25ab-b60d-467a-8df3-d3a83c959d15	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-26 13:28:40.597731+00	
00000000-0000-0000-0000-000000000000	c3c01952-0cec-477a-b7f5-76e50bd39774	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-26 13:31:20.776769+00	
00000000-0000-0000-0000-000000000000	2ade7de9-04c5-4a78-bfa9-2c2b7b8bcd95	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-26 13:33:20.511113+00	
00000000-0000-0000-0000-000000000000	9ee3df2c-ff56-432f-b01c-ccc8da10daea	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-26 13:38:58.073709+00	
00000000-0000-0000-0000-000000000000	c89110d1-ba3b-43c0-9af3-d1657555c62d	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-26 13:42:03.088127+00	
00000000-0000-0000-0000-000000000000	ea1c3f75-df65-418f-a0f4-fa5385177718	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-26 13:43:33.608049+00	
00000000-0000-0000-0000-000000000000	fda812cf-625d-40d7-ba3d-8f5671cb3c8b	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-26 13:43:42.178037+00	
00000000-0000-0000-0000-000000000000	1a2450d9-a048-4451-a05a-486f0dc11ef5	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-26 13:43:42.990418+00	
00000000-0000-0000-0000-000000000000	642e3563-3036-4ae2-b02a-08ef9c277bae	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 23:45:24.954362+00	
00000000-0000-0000-0000-000000000000	a10f1607-eaac-47d1-9272-4de31c931f10	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 23:45:24.976405+00	
00000000-0000-0000-0000-000000000000	f67fb390-da46-4615-92d9-3a7738017e82	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 23:45:59.757121+00	
00000000-0000-0000-0000-000000000000	87a04213-4343-4afd-823b-70b62d4032a1	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-26 23:47:44.635821+00	
00000000-0000-0000-0000-000000000000	d6edcc89-c2b9-4d87-a3fa-54df64e2ab09	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-27 00:26:20.116218+00	
00000000-0000-0000-0000-000000000000	2dacbde6-5dbe-4214-89aa-207e3619e2e6	{"action":"token_refreshed","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-27 13:38:51.854186+00	
00000000-0000-0000-0000-000000000000	b33db94c-b003-492d-a865-f78cab579fda	{"action":"token_revoked","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"token"}	2025-10-27 13:38:51.888169+00	
00000000-0000-0000-0000-000000000000	2c130872-1402-442e-b80b-6fe98af10565	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-27 13:39:17.633054+00	
00000000-0000-0000-0000-000000000000	7dbf4e26-cc8f-41ae-983f-05b0739e5c32	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-27 13:42:12.226128+00	
00000000-0000-0000-0000-000000000000	688ab435-3b9b-486c-af7a-23dd2e87541d	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-27 14:38:16.723606+00	
00000000-0000-0000-0000-000000000000	db5d452d-e41a-4e2c-8f08-42cfca4f5f48	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-27 14:45:45.153612+00	
00000000-0000-0000-0000-000000000000	8d4738ad-925d-47ad-a98c-aeab28204e2b	{"action":"login","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-27 14:46:27.135216+00	
00000000-0000-0000-0000-000000000000	4a31bd28-75ee-48dd-b85e-e0f5ed977598	{"action":"logout","actor_id":"995cc14f-3a97-4a00-b1a2-3c4305bb4f4b","actor_username":"user@example.com","actor_via_sso":false,"log_type":"account"}	2025-10-27 14:56:09.127296+00	
00000000-0000-0000-0000-000000000000	021d5faa-d6b0-47a6-9cdb-17eab28fc9d0	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-27 14:56:15.216083+00	
00000000-0000-0000-0000-000000000000	0ab14f8a-95d1-4b02-b5d8-850727baf814	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-27 14:56:37.481989+00	68.53.242.179:15479
00000000-0000-0000-0000-000000000000	bff220ce-d4c6-42f4-ab8b-6fd9c24943b0	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"b2680108-289d-4807-93e3-fd264317814d","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-27 14:56:37.623324+00	68.53.242.179:17435
00000000-0000-0000-0000-000000000000	0d14d374-e13f-49dd-a7d3-fea0e512149d	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-27 14:56:37.630236+00	
00000000-0000-0000-0000-000000000000	4136caa9-6e5a-4e3f-bf6f-c64e443f9696	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-27 14:56:45.096979+00	
00000000-0000-0000-0000-000000000000	5ab9b429-dd53-40fb-9f5d-e0df56a0680f	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-27 15:57:11.002696+00	
00000000-0000-0000-0000-000000000000	2d80caa2-12f1-45e6-9fe2-fc88b94e4df4	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-27 15:57:11.019095+00	
00000000-0000-0000-0000-000000000000	1e749275-bb30-40b5-b328-371eeac10c12	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-28 01:49:30.420546+00	
00000000-0000-0000-0000-000000000000	bf3b936f-ae8a-4382-999d-06abeb38d8d7	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-28 01:49:30.434158+00	
00000000-0000-0000-0000-000000000000	0f242b2c-f5fb-4978-8136-a2a5c457252c	{"action":"user_confirmation_requested","actor_id":"b712b40c-7f2b-4ccb-8d7c-0196bc65d04e","actor_username":"tjhixon+trial@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-10-28 02:16:51.075204+00	
00000000-0000-0000-0000-000000000000	08f8ce17-025c-447c-81f9-4b22b10e432e	{"action":"user_signedup","actor_id":"b712b40c-7f2b-4ccb-8d7c-0196bc65d04e","actor_username":"tjhixon+trial@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-10-28 02:17:47.374292+00	
00000000-0000-0000-0000-000000000000	6a71afcf-d8ad-4060-83ce-0cd80df35cb0	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-28 02:18:11.526841+00	
00000000-0000-0000-0000-000000000000	a0e44bb1-d234-4302-9aa5-d421453d4722	{"action":"login","actor_id":"b712b40c-7f2b-4ccb-8d7c-0196bc65d04e","actor_username":"tjhixon+trial@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-28 02:18:20.171984+00	
00000000-0000-0000-0000-000000000000	1792c4c2-9ece-4189-8472-943f3af49278	{"action":"login","actor_id":"b712b40c-7f2b-4ccb-8d7c-0196bc65d04e","actor_username":"tjhixon+trial@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-28 02:19:10.115276+00	
00000000-0000-0000-0000-000000000000	cc8162dd-3b29-4481-bc99-abbb52f08af9	{"action":"user_repeated_signup","actor_id":"b712b40c-7f2b-4ccb-8d7c-0196bc65d04e","actor_username":"tjhixon+trial@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-10-28 02:20:17.677939+00	
00000000-0000-0000-0000-000000000000	d93cc507-0487-4431-bde6-6b5d48756763	{"action":"user_repeated_signup","actor_id":"b712b40c-7f2b-4ccb-8d7c-0196bc65d04e","actor_username":"tjhixon+trial@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-10-28 02:26:57.232991+00	
00000000-0000-0000-0000-000000000000	8e604ad6-43ad-44f4-b6bf-43d9f11872ab	{"action":"user_confirmation_requested","actor_id":"ca99cee7-2971-490a-b9e4-286bc1076456","actor_username":"tjhixon+testt@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-10-28 02:27:55.780074+00	
00000000-0000-0000-0000-000000000000	c18f3c2c-df85-4c6e-99c7-587f6230d920	{"action":"user_signedup","actor_id":"ca99cee7-2971-490a-b9e4-286bc1076456","actor_username":"tjhixon+testt@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-10-28 02:28:02.988959+00	
00000000-0000-0000-0000-000000000000	25e402ef-e953-460c-b07e-369ffa694b62	{"action":"login","actor_id":"ca99cee7-2971-490a-b9e4-286bc1076456","actor_username":"tjhixon+testt@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-28 02:29:46.828273+00	
00000000-0000-0000-0000-000000000000	9b981c24-c2f4-4e2b-94fb-16bede684205	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"tjhixon+trial@gmail.com","user_id":"b712b40c-7f2b-4ccb-8d7c-0196bc65d04e","user_phone":""}}	2025-10-28 02:30:14.38766+00	
00000000-0000-0000-0000-000000000000	439074f6-eca5-4bea-9dfd-95f1ea4afe85	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"tjhixon+testt@gmail.com","user_id":"ca99cee7-2971-490a-b9e4-286bc1076456","user_phone":""}}	2025-10-28 02:30:14.396432+00	
00000000-0000-0000-0000-000000000000	1e001092-429f-4391-8c77-98ff2a580073	{"action":"user_confirmation_requested","actor_id":"f199a9ff-01f1-484f-9263-8d289c35c664","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-10-28 02:31:06.549587+00	
00000000-0000-0000-0000-000000000000	996fe329-9b03-4547-80bf-9d435c93b5b8	{"action":"user_signedup","actor_id":"f199a9ff-01f1-484f-9263-8d289c35c664","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-10-28 02:31:13.002933+00	
00000000-0000-0000-0000-000000000000	ab1451c3-4097-44ef-bc61-ced5b5e81581	{"action":"login","actor_id":"f199a9ff-01f1-484f-9263-8d289c35c664","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-28 02:32:07.717791+00	
00000000-0000-0000-0000-000000000000	33d2d1d5-e166-4768-a558-b3807528c3f2	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"tjhixon+1@gmail.com","user_id":"f199a9ff-01f1-484f-9263-8d289c35c664","user_phone":""}}	2025-10-28 02:34:01.593868+00	
00000000-0000-0000-0000-000000000000	5ac521a8-e906-4a89-bde9-a7ae81841fbe	{"action":"user_confirmation_requested","actor_id":"d70c716d-0555-41c5-ba66-cdae22ddecd2","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-10-28 14:15:40.269236+00	
00000000-0000-0000-0000-000000000000	9ca9dda6-b427-4760-b4f2-29321d4fc0ad	{"action":"user_signedup","actor_id":"d70c716d-0555-41c5-ba66-cdae22ddecd2","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-10-28 14:15:45.99174+00	
00000000-0000-0000-0000-000000000000	3355aaae-69b3-43df-bd44-4324399d6ba1	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"tjhixon+1@gmail.com","user_id":"d70c716d-0555-41c5-ba66-cdae22ddecd2","user_phone":""}}	2025-10-28 14:18:02.626624+00	
00000000-0000-0000-0000-000000000000	8ab57b3a-fec7-4335-b729-4249d02c0452	{"action":"user_confirmation_requested","actor_id":"e2d35e0f-9979-479b-bcf5-20d3383f3a7e","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-10-28 14:36:30.719844+00	
00000000-0000-0000-0000-000000000000	4ad4f701-b1e3-4941-8b0c-4a8bf4c44aae	{"action":"user_signedup","actor_id":"e2d35e0f-9979-479b-bcf5-20d3383f3a7e","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-10-28 14:36:38.023404+00	
00000000-0000-0000-0000-000000000000	70fe858a-d192-4a2d-855a-dfb108026806	{"action":"login","actor_id":"e2d35e0f-9979-479b-bcf5-20d3383f3a7e","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"email"}}	2025-10-28 14:36:38.61447+00	
00000000-0000-0000-0000-000000000000	8802907b-b7f3-4a20-90bf-3f2dfe86f1a8	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"tjhixon+1@gmail.com","user_id":"e2d35e0f-9979-479b-bcf5-20d3383f3a7e","user_phone":""}}	2025-10-28 14:37:47.640902+00	
00000000-0000-0000-0000-000000000000	a366e68e-3d41-46e9-b19b-3c3e13edcb12	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-28 15:03:10.05595+00	
00000000-0000-0000-0000-000000000000	672b0571-6b2c-4da2-a1e8-3ff3cca036c4	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-28 15:03:28.033898+00	68.53.242.179:11563
00000000-0000-0000-0000-000000000000	7a94b313-5b4c-4b9a-a5e2-304a5bae8d1e	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"af659e4d-84bf-4d31-a860-d19c734d8006","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-28 15:03:28.221493+00	68.53.242.179:41483
00000000-0000-0000-0000-000000000000	3b33419f-d6e2-4f29-afe8-02f888e60d8d	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-28 15:03:28.240321+00	
00000000-0000-0000-0000-000000000000	da30b1c7-a5d6-4179-95bf-7f0bc36024bf	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-28 23:24:21.294071+00	
00000000-0000-0000-0000-000000000000	2811de8e-d222-4f4c-bc2e-d8aab0b79dee	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-28 23:24:21.319433+00	
00000000-0000-0000-0000-000000000000	a348bd18-9c03-4460-aabc-1504668a6727	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-29 14:56:38.604397+00	
00000000-0000-0000-0000-000000000000	760b8355-638a-4354-a34d-87e2f3a14297	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-29 14:56:38.62715+00	
00000000-0000-0000-0000-000000000000	19825594-3e81-4802-8792-57b903f2e61f	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-29 15:03:41.804696+00	
00000000-0000-0000-0000-000000000000	ac05163a-59ce-4551-8332-8c44eaa47d6c	{"action":"user_confirmation_requested","actor_id":"289e96c0-c578-405a-ae7a-cdb27bb1934d","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-10-29 15:05:02.398627+00	
00000000-0000-0000-0000-000000000000	c5e9d4fc-6b27-4947-935b-dec04e4970ef	{"action":"user_signedup","actor_id":"289e96c0-c578-405a-ae7a-cdb27bb1934d","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-10-29 15:05:08.761861+00	
00000000-0000-0000-0000-000000000000	42778768-8cf9-4e44-bf3b-7135e328b449	{"action":"login","actor_id":"289e96c0-c578-405a-ae7a-cdb27bb1934d","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"email"}}	2025-10-29 15:05:09.558264+00	
00000000-0000-0000-0000-000000000000	05d2eb15-24a0-41cd-a1e1-a2122a2ba252	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"tjhixon+1@gmail.com","user_id":"289e96c0-c578-405a-ae7a-cdb27bb1934d","user_phone":""}}	2025-10-29 15:05:32.336969+00	
00000000-0000-0000-0000-000000000000	2979d1b9-9c89-41e4-a23c-4ab975c71bfc	{"action":"user_confirmation_requested","actor_id":"ee317bc9-a004-4e26-b0c1-becda05c95a1","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-10-29 15:36:05.805093+00	
00000000-0000-0000-0000-000000000000	ab08afe4-43a9-4c01-9c7f-862e6012c0e3	{"action":"user_signedup","actor_id":"ee317bc9-a004-4e26-b0c1-becda05c95a1","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-10-29 15:36:13.738937+00	
00000000-0000-0000-0000-000000000000	4eb5c3d5-2365-421c-853f-cf7cbae1b94f	{"action":"login","actor_id":"ee317bc9-a004-4e26-b0c1-becda05c95a1","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"email"}}	2025-10-29 15:36:14.590805+00	
00000000-0000-0000-0000-000000000000	4273b520-efc0-4dd9-8cc8-7dba25054936	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"tjhixon+1@gmail.com","user_id":"ee317bc9-a004-4e26-b0c1-becda05c95a1","user_phone":""}}	2025-10-29 15:37:09.566176+00	
00000000-0000-0000-0000-000000000000	380fb76b-81f7-4347-87f4-0c75b3626372	{"action":"user_confirmation_requested","actor_id":"cd71e69d-385b-479d-8389-667a3b6765ab","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-10-29 15:42:45.380924+00	
00000000-0000-0000-0000-000000000000	f7b37561-073a-4233-b0ea-fc8bdb93038f	{"action":"user_signedup","actor_id":"cd71e69d-385b-479d-8389-667a3b6765ab","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-10-29 15:42:52.154392+00	
00000000-0000-0000-0000-000000000000	8f51e8f2-a420-4bb6-9dc9-a0806eb38d8e	{"action":"login","actor_id":"cd71e69d-385b-479d-8389-667a3b6765ab","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"email"}}	2025-10-29 15:42:52.998592+00	
00000000-0000-0000-0000-000000000000	fc0c9164-1689-4366-994e-7157b36dfbbb	{"action":"user_updated_password","actor_id":"cd71e69d-385b-479d-8389-667a3b6765ab","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-29 15:43:19.424209+00	
00000000-0000-0000-0000-000000000000	2e2bc243-28fd-4305-b2e4-4eb5f25d0862	{"action":"user_modified","actor_id":"cd71e69d-385b-479d-8389-667a3b6765ab","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-29 15:43:19.426916+00	
00000000-0000-0000-0000-000000000000	431dd6a0-66e8-4db4-895b-0159e05f04bc	{"action":"login","actor_id":"cd71e69d-385b-479d-8389-667a3b6765ab","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-29 15:43:50.321981+00	
00000000-0000-0000-0000-000000000000	acba9edf-e75a-46d5-a430-1148973cf75f	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"tjhixon+1@gmail.com","user_id":"cd71e69d-385b-479d-8389-667a3b6765ab","user_phone":""}}	2025-10-29 15:44:58.285417+00	
00000000-0000-0000-0000-000000000000	6cab9e59-d274-4c11-b397-3b13a19ff3c5	{"action":"user_confirmation_requested","actor_id":"2dd5a2c1-38cc-45b3-9f7f-143942a42581","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-10-29 16:23:22.315311+00	
00000000-0000-0000-0000-000000000000	837c833f-9718-4c40-abd6-250d73dd4207	{"action":"user_signedup","actor_id":"2dd5a2c1-38cc-45b3-9f7f-143942a42581","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-10-29 16:23:29.388933+00	
00000000-0000-0000-0000-000000000000	8cd19f0a-cc27-4498-b619-0c9428e5b71d	{"action":"login","actor_id":"2dd5a2c1-38cc-45b3-9f7f-143942a42581","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"email"}}	2025-10-29 16:23:29.974637+00	
00000000-0000-0000-0000-000000000000	055942d8-15fe-43de-a06a-f8e15b3048a5	{"action":"user_updated_password","actor_id":"2dd5a2c1-38cc-45b3-9f7f-143942a42581","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-29 16:23:45.863581+00	
00000000-0000-0000-0000-000000000000	d834a1d2-8651-40b3-a305-304a2e631f5e	{"action":"user_modified","actor_id":"2dd5a2c1-38cc-45b3-9f7f-143942a42581","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-29 16:23:45.865835+00	
00000000-0000-0000-0000-000000000000	608dd0e8-ae6a-483c-9c1d-2b407281ddef	{"action":"token_refreshed","actor_id":"2dd5a2c1-38cc-45b3-9f7f-143942a42581","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-29 20:35:19.483971+00	
00000000-0000-0000-0000-000000000000	41f1e1d3-526b-4a32-a0e1-91b272bccc6d	{"action":"token_revoked","actor_id":"2dd5a2c1-38cc-45b3-9f7f-143942a42581","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-29 20:35:19.495175+00	
00000000-0000-0000-0000-000000000000	0e40f0f1-abdd-4e26-938d-2c40ad0115d6	{"action":"logout","actor_id":"2dd5a2c1-38cc-45b3-9f7f-143942a42581","actor_username":"tjhixon+1@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-29 20:43:01.073746+00	
00000000-0000-0000-0000-000000000000	42f317b0-179f-4e01-a564-bdffd071cbb5	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-29 20:43:16.769584+00	
00000000-0000-0000-0000-000000000000	6b9c17e1-0811-4467-a36c-b2bc4b5d4213	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-29 20:43:23.745571+00	
00000000-0000-0000-0000-000000000000	395218e2-8911-4a78-8ce9-382aab0b3a97	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-29 20:43:24.379747+00	
00000000-0000-0000-0000-000000000000	3184f02a-99f3-416e-aed2-6d355481b7d5	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-29 20:44:18.179892+00	
00000000-0000-0000-0000-000000000000	41db6b7d-b766-47fd-b4c5-ef7967df21e3	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-29 20:44:24.694755+00	
00000000-0000-0000-0000-000000000000	194c4263-f1a4-4ac1-97fb-4d588eebd94c	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-29 20:44:25.393255+00	
00000000-0000-0000-0000-000000000000	7a086480-2c85-4ae7-96db-816b4eaf92f9	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-29 20:49:58.295485+00	
00000000-0000-0000-0000-000000000000	40a4d16a-c766-4f66-a266-e43ae780b553	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-29 20:51:27.311386+00	
00000000-0000-0000-0000-000000000000	c02f7e2e-a560-42db-ab87-06056ddad37e	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-29 20:51:48.66334+00	68.53.242.179:34637
00000000-0000-0000-0000-000000000000	e203b169-fdea-4aee-b5ae-b321b1733dd3	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"c7493f4a-a29e-4290-b186-5fabe4944664","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-29 20:51:48.806006+00	68.53.242.179:34637
00000000-0000-0000-0000-000000000000	c9c60715-45aa-4a9f-a800-c5e0c0941955	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-29 20:51:48.814621+00	
00000000-0000-0000-0000-000000000000	9627eab5-4410-42c6-a0c3-fbaf313a24c5	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-29 21:05:31.493299+00	
00000000-0000-0000-0000-000000000000	4db044b4-7740-45d0-bc5d-e962d168f6f6	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-29 21:05:47.495153+00	
00000000-0000-0000-0000-000000000000	c7a5907e-2ad0-4988-862c-8067198df7d2	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-10-29 21:06:05.570632+00	68.53.242.179:34637
00000000-0000-0000-0000-000000000000	63b592d8-1d9a-4860-b652-4116984e47b9	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"dc1fd891-a073-45ac-82d1-b04fb0395845","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-10-29 21:06:05.666581+00	68.53.242.179:34637
00000000-0000-0000-0000-000000000000	ba8d3e8b-6095-443f-81fe-32f09c536e51	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-29 21:06:05.67335+00	
00000000-0000-0000-0000-000000000000	96c58465-a05e-4466-9b52-07f2fdcdc1eb	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 00:34:19.028793+00	
00000000-0000-0000-0000-000000000000	2bae5cd4-8b78-4fb8-a333-e5ff8fdf06aa	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 00:34:19.060651+00	
00000000-0000-0000-0000-000000000000	1c22532c-5e8f-4c9e-b5d7-77dc870debe3	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 03:20:06.091733+00	
00000000-0000-0000-0000-000000000000	bb751a64-af1d-4810-86de-d237f26262be	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 03:20:06.107322+00	
00000000-0000-0000-0000-000000000000	5dc8c582-e434-406d-b7a4-cc8080c1ef82	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 13:20:47.955312+00	
00000000-0000-0000-0000-000000000000	ee7d131d-7a7b-4db7-a3d4-b9c1f52b2124	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 13:20:47.98947+00	
00000000-0000-0000-0000-000000000000	e3553735-19ee-4310-8b1a-c8124bed22a9	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 14:23:03.949282+00	
00000000-0000-0000-0000-000000000000	955d4f22-6c29-4422-9dd7-32547f0ae556	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 14:23:03.972982+00	
00000000-0000-0000-0000-000000000000	e8cc7773-343d-4aa1-8bd0-fcab97f5217a	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 16:50:52.143735+00	
00000000-0000-0000-0000-000000000000	43343d1f-e34a-48fd-a122-7555f97536ab	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 16:50:52.164013+00	
00000000-0000-0000-0000-000000000000	437d181c-0fe0-4a37-93ed-d789c1692720	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 17:58:57.537274+00	
00000000-0000-0000-0000-000000000000	6aa700ce-26eb-4048-852a-f4077dc4b7ae	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 17:58:57.569683+00	
00000000-0000-0000-0000-000000000000	1e4a6f41-2fc5-4b76-8977-2ebf8c9e1889	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 18:58:34.372485+00	
00000000-0000-0000-0000-000000000000	ddc342a9-0a5a-4eb9-84c6-6e063349efab	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 18:58:34.381362+00	
00000000-0000-0000-0000-000000000000	98fc3814-6645-44c2-8bb8-33a0a558b6aa	{"action":"user_confirmation_requested","actor_id":"40e1316e-f3a5-4771-a129-79ca32d42981","actor_username":"tjhixon+aff@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-10-30 19:12:05.279731+00	
00000000-0000-0000-0000-000000000000	e2f153d4-d551-47d8-98f6-ee1f5055efd9	{"action":"user_signedup","actor_id":"40e1316e-f3a5-4771-a129-79ca32d42981","actor_username":"tjhixon+aff@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-10-30 19:12:20.816688+00	
00000000-0000-0000-0000-000000000000	bbc29477-44ce-40a3-9c67-8eb4d584ea78	{"action":"login","actor_id":"40e1316e-f3a5-4771-a129-79ca32d42981","actor_username":"tjhixon+aff@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"email"}}	2025-10-30 19:12:21.57069+00	
00000000-0000-0000-0000-000000000000	3e8ac2b7-9a0f-4e7f-bef8-6e1a7af1e2d5	{"action":"user_updated_password","actor_id":"40e1316e-f3a5-4771-a129-79ca32d42981","actor_username":"tjhixon+aff@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-30 19:12:31.755832+00	
00000000-0000-0000-0000-000000000000	b476dfd6-0728-4b3f-b621-3077ddbb521e	{"action":"user_modified","actor_id":"40e1316e-f3a5-4771-a129-79ca32d42981","actor_username":"tjhixon+aff@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-30 19:12:31.757958+00	
00000000-0000-0000-0000-000000000000	1ecc34df-a297-4061-91da-44745cbb51e7	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"tjhixon+aff@gmail.com","user_id":"40e1316e-f3a5-4771-a129-79ca32d42981","user_phone":""}}	2025-10-30 19:13:15.744737+00	
00000000-0000-0000-0000-000000000000	89ae88ad-7a86-47ad-8cbb-00c6e4876ca1	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"tjhixon+1@gmail.com","user_id":"2dd5a2c1-38cc-45b3-9f7f-143942a42581","user_phone":""}}	2025-10-30 19:13:15.859641+00	
00000000-0000-0000-0000-000000000000	63e98010-33bf-4d8a-8a24-b61d80f8a976	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-30 19:24:59.492675+00	
00000000-0000-0000-0000-000000000000	70e77bd2-ae19-4027-bb45-3b2e7cdc868b	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-02 13:38:50.374561+00	
00000000-0000-0000-0000-000000000000	ea635fb1-e776-4835-8e93-644f118f3724	{"action":"user_confirmation_requested","actor_id":"66905083-a4a9-4e9c-a17b-d11a9a5f8981","actor_username":"tjhixon+aff@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-10-30 19:28:07.447464+00	
00000000-0000-0000-0000-000000000000	6d8fc890-f92f-45fc-848e-1b92d61c4db1	{"action":"user_signedup","actor_id":"66905083-a4a9-4e9c-a17b-d11a9a5f8981","actor_username":"tjhixon+aff@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-10-30 19:28:15.448166+00	
00000000-0000-0000-0000-000000000000	38639d3f-45e5-4e21-b3c2-9f8d42253242	{"action":"login","actor_id":"66905083-a4a9-4e9c-a17b-d11a9a5f8981","actor_username":"tjhixon+aff@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"email"}}	2025-10-30 19:28:16.349825+00	
00000000-0000-0000-0000-000000000000	f0356923-f76e-4fea-afeb-8541b5109d7a	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-30 19:28:38.354584+00	
00000000-0000-0000-0000-000000000000	d392da4d-6cda-4ed5-81eb-4af161dd96c4	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-30 19:28:42.783991+00	
00000000-0000-0000-0000-000000000000	527c6069-2b87-4bf6-9906-9edb25b4031a	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-10-30 19:28:43.439008+00	
00000000-0000-0000-0000-000000000000	0ae28dda-c6a2-4269-bae8-c3f0eb1ce669	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"tjhixon+aff@gmail.com","user_id":"66905083-a4a9-4e9c-a17b-d11a9a5f8981","user_phone":""}}	2025-10-30 19:38:10.764787+00	
00000000-0000-0000-0000-000000000000	5e06374d-1a22-4972-9c63-635635aa7d61	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 20:29:59.712704+00	
00000000-0000-0000-0000-000000000000	319b7d03-a15a-429f-b964-43b8b656432c	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 20:29:59.725763+00	
00000000-0000-0000-0000-000000000000	8a90f4f2-fa36-4715-be4e-2d45bc027a13	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 22:05:49.201887+00	
00000000-0000-0000-0000-000000000000	25b6ea75-befd-4740-ad5b-bd3e04594bce	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 22:05:49.22957+00	
00000000-0000-0000-0000-000000000000	f381b664-20be-40ab-827b-66bd3994be47	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 01:57:32.828869+00	
00000000-0000-0000-0000-000000000000	45d5343c-c7e9-4b10-af48-9db4d0035403	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 01:57:32.846754+00	
00000000-0000-0000-0000-000000000000	8fe59d3d-0508-4f13-880c-9dad6a3f51bb	{"action":"user_confirmation_requested","actor_id":"56a3a331-0f73-4ba5-a3b7-0883c11d2af7","actor_username":"tjhixon+ref@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-10-31 02:35:47.988692+00	
00000000-0000-0000-0000-000000000000	a1b6097b-f366-4453-8920-c31bbdeaf46d	{"action":"user_signedup","actor_id":"56a3a331-0f73-4ba5-a3b7-0883c11d2af7","actor_username":"tjhixon+ref@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-10-31 02:36:03.118214+00	
00000000-0000-0000-0000-000000000000	1b0f0f02-73df-4c6b-b885-529992894757	{"action":"login","actor_id":"56a3a331-0f73-4ba5-a3b7-0883c11d2af7","actor_username":"tjhixon+ref@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"email"}}	2025-10-31 02:36:04.019508+00	
00000000-0000-0000-0000-000000000000	9ca92134-90f1-4792-9efc-94c5367de398	{"action":"user_updated_password","actor_id":"56a3a331-0f73-4ba5-a3b7-0883c11d2af7","actor_username":"tjhixon+ref@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-31 02:36:23.043363+00	
00000000-0000-0000-0000-000000000000	5b97ff24-cf34-4769-ba7b-ed02144b6407	{"action":"user_modified","actor_id":"56a3a331-0f73-4ba5-a3b7-0883c11d2af7","actor_username":"tjhixon+ref@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-10-31 02:36:23.044122+00	
00000000-0000-0000-0000-000000000000	623b27aa-9109-4f80-b5c1-6c0f2834f497	{"action":"logout","actor_id":"56a3a331-0f73-4ba5-a3b7-0883c11d2af7","actor_username":"tjhixon+ref@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-10-31 02:46:16.546758+00	
00000000-0000-0000-0000-000000000000	d76f2552-8f63-4218-8415-75092ccfdfc0	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 02:57:44.226494+00	
00000000-0000-0000-0000-000000000000	9c147389-dc01-4ec8-b766-abd89ae325a2	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 02:57:44.241718+00	
00000000-0000-0000-0000-000000000000	90e4a86d-2568-41e9-bc47-bec47e3fce46	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 04:00:47.527583+00	
00000000-0000-0000-0000-000000000000	762fa6e2-e711-4698-90c3-9e7690d352eb	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-10-31 04:00:47.542109+00	
00000000-0000-0000-0000-000000000000	70bd3f93-c54d-4cbf-85b3-04a7a8b97aed	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-01 12:48:02.120673+00	
00000000-0000-0000-0000-000000000000	ee63180c-d686-411e-91eb-6dc9223b0834	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-01 12:48:02.147364+00	
00000000-0000-0000-0000-000000000000	ed90ea13-4283-465b-975b-ffce8dceb9df	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-01 14:09:46.086519+00	
00000000-0000-0000-0000-000000000000	274d15a2-f7cb-4bcb-8b31-21b19bd96b65	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-01 14:09:46.110247+00	
00000000-0000-0000-0000-000000000000	6ecd44a7-27b8-4871-940c-7bbcebaba526	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-01 16:37:43.870165+00	
00000000-0000-0000-0000-000000000000	de459038-3f8d-40a6-a521-ff9fb5e02963	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-01 16:37:43.899613+00	
00000000-0000-0000-0000-000000000000	bf5530e6-5fbb-41b6-ab31-1b7e2e4757c8	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-01 22:01:37.648933+00	
00000000-0000-0000-0000-000000000000	dd5dfcba-b861-41ff-8fc3-b4ea60e72206	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-01 22:01:37.680263+00	
00000000-0000-0000-0000-000000000000	8c5ba4f3-781a-48b4-af48-b326e4784875	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-02 13:38:50.349009+00	
00000000-0000-0000-0000-000000000000	ba93671d-0121-453d-bef9-30bf9cc5d102	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-03 03:16:22.770211+00	
00000000-0000-0000-0000-000000000000	b35a7f6d-82e5-4fda-ac28-6948569a6579	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-03 03:16:22.809671+00	
00000000-0000-0000-0000-000000000000	2305c4e1-e5ee-4fd4-ada4-8a82ac378994	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-03 15:25:16.87598+00	
00000000-0000-0000-0000-000000000000	6c8a15ce-5255-4648-9e2c-6eef3bcf1402	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-03 15:25:16.90709+00	
00000000-0000-0000-0000-000000000000	9efed45d-7933-450f-b5bd-693bd1bc7440	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-03 17:49:34.212214+00	
00000000-0000-0000-0000-000000000000	ad617351-b0be-4e60-bfdf-e9a91aae1f07	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-03 17:49:34.226605+00	
00000000-0000-0000-0000-000000000000	92cdddc2-7ad4-4220-9932-91d189dd1f59	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-03 20:01:53.225538+00	
00000000-0000-0000-0000-000000000000	35490366-81f0-4ebc-b351-bfef0f63ad38	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-03 20:01:53.259591+00	
00000000-0000-0000-0000-000000000000	e2b39ab8-6ec9-456f-951d-3a864f7ba106	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-04 01:44:03.172081+00	
00000000-0000-0000-0000-000000000000	b9aa5570-116c-449d-9d08-bafd72089235	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-04 01:44:03.197658+00	
00000000-0000-0000-0000-000000000000	8b27326c-ad4e-4846-968a-da77c8fa06ea	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-04 19:05:43.902736+00	
00000000-0000-0000-0000-000000000000	6cc712c6-ee1b-467e-87f9-a34283a024b7	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-04 19:05:43.932028+00	
00000000-0000-0000-0000-000000000000	84c23b42-8267-418c-bad8-1054bb7abe99	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-04 20:54:37.416629+00	
00000000-0000-0000-0000-000000000000	a3966c92-7587-4650-a853-8fb081349641	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-04 20:54:37.431669+00	
00000000-0000-0000-0000-000000000000	b9c50104-68e7-4a63-89e8-93111180e022	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 00:24:03.312592+00	
00000000-0000-0000-0000-000000000000	209d0536-73ec-4799-b129-bfb79d351ac8	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 00:24:03.329265+00	
00000000-0000-0000-0000-000000000000	8c29801b-ab9a-4906-bb4c-209ca95a9a3a	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-05 00:26:10.382064+00	
00000000-0000-0000-0000-000000000000	ef37b271-9f32-4a29-beac-5b72430e92ec	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-05 00:26:21.635487+00	
00000000-0000-0000-0000-000000000000	dc7dde2c-01e0-4a35-875f-f2e37561ea9a	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-05 00:26:30.038181+00	
00000000-0000-0000-0000-000000000000	2661bdad-75df-4f7f-97d0-7433f99bff44	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-11-05 00:26:30.905781+00	
00000000-0000-0000-0000-000000000000	d54c0ef3-a0f0-46c4-bc73-0fc9054dfd54	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-05 00:35:06.323154+00	
00000000-0000-0000-0000-000000000000	5b311690-8686-48a7-afbb-47837275a1af	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-05 00:35:13.353945+00	
00000000-0000-0000-0000-000000000000	f58cb9c7-1acd-4199-aef9-81ecc2f63973	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-11-05 00:35:14.143193+00	
00000000-0000-0000-0000-000000000000	8e9f400a-4f87-4aba-9dde-82e746059ef9	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 15:11:06.825022+00	
00000000-0000-0000-0000-000000000000	8ed74f56-865a-4fad-b4de-679f3239cf0e	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 15:11:06.846461+00	
00000000-0000-0000-0000-000000000000	6479d74b-314b-4ba6-9c51-396b6dc024d8	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-05 15:11:18.390968+00	
00000000-0000-0000-0000-000000000000	06a620e9-2e40-47fb-b147-f470caa6b28a	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-05 15:12:02.40916+00	
00000000-0000-0000-0000-000000000000	5d77c9b7-f4c5-415f-b679-c430be3fc9bd	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 21:38:02.830344+00	
00000000-0000-0000-0000-000000000000	f2e08c08-119a-42ba-8ada-147c5a3ecb16	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 21:38:02.853408+00	
00000000-0000-0000-0000-000000000000	f1e55259-275b-4b99-b28e-cb8c6201f262	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-05 21:38:24.059973+00	
00000000-0000-0000-0000-000000000000	9af619b7-18b2-4bbd-b529-a2af5529c82f	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-11-05 21:38:44.15984+00	68.53.242.179:18949
00000000-0000-0000-0000-000000000000	d7202e8f-9976-48fc-8d18-a134e0d45125	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-11-05 21:38:58.358492+00	68.53.242.179:18949
00000000-0000-0000-0000-000000000000	a795d738-8332-4eb2-b592-165807d10c65	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"1d84f794-18a7-4bdb-bf5d-baa6e192a972","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-11-05 21:38:58.451818+00	68.53.242.179:18949
00000000-0000-0000-0000-000000000000	b39e5b38-9975-4cce-9409-6d282f28de00	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 21:38:58.464848+00	
00000000-0000-0000-0000-000000000000	839cd6ea-d856-4a3d-863a-77d9de96a879	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 23:40:28.422894+00	
00000000-0000-0000-0000-000000000000	c7732116-9f33-4ff4-8ae8-3dc5d76b9a08	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-05 23:40:28.438352+00	
00000000-0000-0000-0000-000000000000	ec5a2431-50c9-4824-9116-90cd20120f37	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-05 23:41:54.747315+00	
00000000-0000-0000-0000-000000000000	5f06c20b-9158-496b-b0bb-6b12e2bbb8d7	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-05 23:42:07.199748+00	
00000000-0000-0000-0000-000000000000	b2a489bb-6c5c-40dd-a55c-0c1975fb4f60	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-11-05 23:42:08.05417+00	
00000000-0000-0000-0000-000000000000	eebef1f6-0a5e-41d2-8689-65e456380631	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-06 13:58:57.836064+00	
00000000-0000-0000-0000-000000000000	c29c5900-4418-4308-b007-c868fbd336b5	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-06 13:58:57.870207+00	
00000000-0000-0000-0000-000000000000	6b3fd4d9-8f38-460b-80a4-18ffae3fce9a	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-06 13:59:13.821424+00	
00000000-0000-0000-0000-000000000000	9495a192-f069-4245-a3d5-9cd0355fc341	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-11-06 14:28:41.316571+00	
00000000-0000-0000-0000-000000000000	b384ca3e-27d8-4bee-877d-65f40bc3402b	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-06 14:28:56.156901+00	
00000000-0000-0000-0000-000000000000	94921f06-3106-4721-b4d1-42fd91a91faa	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-11-06 14:28:56.891479+00	
00000000-0000-0000-0000-000000000000	d710076f-4872-4cfa-b291-fa10c67754db	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-06 15:27:19.515609+00	
00000000-0000-0000-0000-000000000000	678d308d-500d-4b04-a1c7-3945477f55a0	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-06 15:27:19.525487+00	
00000000-0000-0000-0000-000000000000	91ef778a-f0da-4b4b-b734-b14bdcb1a72e	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-06 19:22:24.793238+00	
00000000-0000-0000-0000-000000000000	331ac359-dbdd-408c-83c9-9f58c231001b	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-06 19:22:24.817436+00	
00000000-0000-0000-0000-000000000000	00214299-366c-4662-8aa2-e6c22cfcbd95	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 14:34:01.172872+00	
00000000-0000-0000-0000-000000000000	7b204802-552f-4258-8ed1-a7e2a41bfc7a	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 14:34:01.199291+00	
00000000-0000-0000-0000-000000000000	48563382-8c07-4f89-b654-bf42e80b465e	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 15:53:02.216372+00	
00000000-0000-0000-0000-000000000000	dddb9914-6d72-41b9-99b9-e0a262209fe7	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-11-07 15:53:02.229687+00	
00000000-0000-0000-0000-000000000000	f21e9f20-5b6c-41f3-953e-a7be5592933a	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-20 15:53:56.547308+00	
00000000-0000-0000-0000-000000000000	83f5789b-4e6d-4d3e-a8ad-95acf64b8f84	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-20 15:53:56.579965+00	
00000000-0000-0000-0000-000000000000	f9452447-f1e5-41b5-b00f-30cdcc795368	{"action":"token_refreshed","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-20 15:53:59.42563+00	
00000000-0000-0000-0000-000000000000	8fb95d00-136d-4dd7-adab-6d586d74417e	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-12-20 15:54:18.043478+00	
00000000-0000-0000-0000-000000000000	209fad9b-1d63-4853-8747-76657055c315	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@test.com","user_id":"0f9e7f09-a929-492c-b82a-b1e87a3e84f1","user_phone":""}}	2025-12-20 16:33:34.760286+00	
00000000-0000-0000-0000-000000000000	27ec03fc-745e-46c1-8ebf-006d85c89c78	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@test.com","user_id":"0f9e7f09-a929-492c-b82a-b1e87a3e84f1","user_phone":""}}	2025-12-20 16:33:51.23448+00	
00000000-0000-0000-0000-000000000000	3c112cb7-7485-4965-b46f-a610b6438a85	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@test.com","user_id":"2a266156-acb2-413b-84ce-925a405a2335","user_phone":""}}	2025-12-20 16:33:51.52865+00	
00000000-0000-0000-0000-000000000000	2c3e8a45-393f-4115-a866-e7023983eca3	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher@test.com","user_id":"a98b526a-75e4-4647-8379-bb213c09c8f1","user_phone":""}}	2025-12-20 16:33:51.990942+00	
00000000-0000-0000-0000-000000000000	f6b96c4a-bb95-462d-80b7-7bb123b1f105	{"action":"login","actor_id":"2a266156-acb2-413b-84ce-925a405a2335","actor_username":"admin@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-20 16:43:04.980642+00	
00000000-0000-0000-0000-000000000000	4f282991-fd53-4d99-a862-820ad3853a8c	{"action":"logout","actor_id":"2a266156-acb2-413b-84ce-925a405a2335","actor_username":"admin@test.com","actor_via_sso":false,"log_type":"account"}	2025-12-20 16:43:05.13925+00	
00000000-0000-0000-0000-000000000000	4d9f240f-c6e2-4d83-8722-af5f5cd53a6a	{"action":"login","actor_id":"2a266156-acb2-413b-84ce-925a405a2335","actor_username":"admin@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-20 16:44:04.370946+00	
00000000-0000-0000-0000-000000000000	1fe85af1-1905-449d-b33e-098526fcc2ed	{"action":"logout","actor_id":"2a266156-acb2-413b-84ce-925a405a2335","actor_username":"admin@test.com","actor_via_sso":false,"log_type":"account"}	2025-12-20 16:44:04.478117+00	
00000000-0000-0000-0000-000000000000	017cdca5-4608-4147-bd0b-dc0eb9e5d0eb	{"action":"user_recovery_requested","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"user"}	2025-12-20 16:47:15.671282+00	
00000000-0000-0000-0000-000000000000	2902bdef-0528-45fa-9b85-c9d60aaf17c7	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-12-20 16:47:28.904418+00	
00000000-0000-0000-0000-000000000000	5c588b8f-6291-43f6-a735-c135514d004e	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"magiclink"}}	2025-12-20 16:47:29.511928+00	
00000000-0000-0000-0000-000000000000	48ae071e-0ed9-40f0-814b-47b82f904bba	{"action":"logout","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-12-20 16:47:40.298852+00	
00000000-0000-0000-0000-000000000000	9ada06c6-9caf-4b75-a125-0bc8a33fec2c	{"action":"login","actor_id":"2a266156-acb2-413b-84ce-925a405a2335","actor_username":"admin@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-20 16:55:31.598556+00	
00000000-0000-0000-0000-000000000000	e288f804-5f0d-4f27-8a58-2085a907ac72	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher@test.com","user_id":"a98b526a-75e4-4647-8379-bb213c09c8f1","user_phone":""}}	2025-12-20 19:10:09.92368+00	
00000000-0000-0000-0000-000000000000	edeef185-5e86-4a0a-9ead-e93b5bce54f8	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@test.com","user_id":"2a266156-acb2-413b-84ce-925a405a2335","user_phone":""}}	2025-12-20 19:10:10.110801+00	
00000000-0000-0000-0000-000000000000	e161ddec-fdce-4f8c-a101-fd203c15595d	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@test.com","user_id":"694b92f6-5540-45b0-bc7a-a7ff5f1e9a30","user_phone":""}}	2025-12-20 19:10:10.39511+00	
00000000-0000-0000-0000-000000000000	1f5edd1a-1a42-4f41-bd00-f98571f4b74b	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher@test.com","user_id":"835bfe1f-3df4-4231-a90e-6bb3dc6eac9a","user_phone":""}}	2025-12-20 19:10:10.734135+00	
00000000-0000-0000-0000-000000000000	d5b97da1-b878-4136-961f-248770669b6d	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher@test.com","user_id":"835bfe1f-3df4-4231-a90e-6bb3dc6eac9a","user_phone":""}}	2025-12-20 19:19:33.485657+00	
00000000-0000-0000-0000-000000000000	0c21efc5-16a5-4eb1-b4b1-94c61ea9b847	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"district@test.com","user_id":"6013b0f9-2df8-4786-a2db-71808b0a6394","user_phone":""}}	2025-12-20 19:19:33.760511+00	
00000000-0000-0000-0000-000000000000	562c86dc-e31d-49ad-af63-ed497f373a28	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher@test.com","user_id":"886671ea-24d8-46f2-ba0c-c88ac0bc56b7","user_phone":""}}	2025-12-20 19:19:34.219196+00	
00000000-0000-0000-0000-000000000000	5f2bbed0-0e8e-4a1e-9a8c-4b4869f55d0c	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"teacher@test.com","user_id":"886671ea-24d8-46f2-ba0c-c88ac0bc56b7","user_phone":""}}	2025-12-20 19:19:37.870382+00	
00000000-0000-0000-0000-000000000000	b353df0d-5c1e-44e4-bba5-0ce36e80dedc	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"district@test.com","user_id":"6013b0f9-2df8-4786-a2db-71808b0a6394","user_phone":""}}	2025-12-20 19:19:38.012814+00	
00000000-0000-0000-0000-000000000000	8452b0dd-3dc5-4471-9e7c-34e4e2dea283	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"district@test.com","user_id":"d778315f-3864-444c-87a8-74f322d0dad8","user_phone":""}}	2025-12-20 19:19:38.329953+00	
00000000-0000-0000-0000-000000000000	281c5435-69b7-4669-837a-02ffec7152fc	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"teacher@test.com","user_id":"ad6660e1-309b-4e39-a439-3384df2b78bd","user_phone":""}}	2025-12-20 19:19:38.668182+00	
00000000-0000-0000-0000-000000000000	e01d0a8b-f23e-40b6-95a7-60ba7164a4b5	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@test.com","user_id":"694b92f6-5540-45b0-bc7a-a7ff5f1e9a30","user_phone":""}}	2025-12-20 19:20:38.559423+00	
00000000-0000-0000-0000-000000000000	80acbd89-7331-4564-b587-e344bea8541d	{"action":"login","actor_id":"d778315f-3864-444c-87a8-74f322d0dad8","actor_username":"district@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-20 19:22:50.416734+00	
00000000-0000-0000-0000-000000000000	d5b9d1a6-9dd7-4066-9c2e-bc14e6d3e358	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-20 19:24:51.943552+00	
00000000-0000-0000-0000-000000000000	d21929f3-e63e-43ad-a09a-f79a65f3a3b7	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-12-20 19:25:32.170936+00	68.53.242.179:23007
00000000-0000-0000-0000-000000000000	ab8b4825-2eb1-4c16-b430-65ee825e699d	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"3c78ddd3-263b-42f6-9b7e-4b4d5aef20d8","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-12-20 19:25:32.326224+00	68.53.242.179:23007
00000000-0000-0000-0000-000000000000	2cb163e9-f1c5-4042-b043-3121713880cb	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-20 19:25:32.337431+00	
00000000-0000-0000-0000-000000000000	3c729500-af1b-47f9-9e39-c4c182599f67	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-20 19:25:52.170718+00	
00000000-0000-0000-0000-000000000000	2f7a3fcd-662d-4f88-badd-aff20590fbae	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-12-20 19:26:04.840343+00	68.53.242.179:23007
00000000-0000-0000-0000-000000000000	fff4d063-b0f7-45bb-badc-6567e626c991	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"2555a244-8478-4487-aa9f-e2f415d78f42","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-12-20 19:26:04.920024+00	68.53.242.179:23007
00000000-0000-0000-0000-000000000000	edfd9f24-9280-4493-90ae-d4c1ff7310c9	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-20 19:26:04.924975+00	
00000000-0000-0000-0000-000000000000	fc258582-487f-4453-b438-8da1fe521302	{"action":"login","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-20 19:28:53.816177+00	
00000000-0000-0000-0000-000000000000	890f845a-e0c4-4243-9613-04f0134df728	{"action":"challenge_created","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_status":"verified"}}	2025-12-20 19:29:05.823805+00	68.53.242.179:23007
00000000-0000-0000-0000-000000000000	05bf058d-bc55-4c8c-8b8a-39189f05e2fb	{"action":"verification_attempted","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"factor","traits":{"challenge_id":"c1116b27-a9d0-404d-a0d6-0373936a67db","factor_id":"71fac55f-068c-4007-90d2-a4178e030931","factor_type":"totp"}}	2025-12-20 19:29:05.899818+00	68.53.242.179:23007
00000000-0000-0000-0000-000000000000	a39c176b-a703-4a9a-851a-c182298b7e67	{"action":"token_revoked","actor_id":"7a79e16b-242f-4a34-b660-45d76273807a","actor_username":"tjhixon@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-12-20 19:29:05.90529+00	
00000000-0000-0000-0000-000000000000	d5c754f4-e6fc-4bad-9781-b75f634d6854	{"action":"logout","actor_id":"d778315f-3864-444c-87a8-74f322d0dad8","actor_username":"district@test.com","actor_via_sso":false,"log_type":"account"}	2025-12-20 19:30:34.012888+00	
00000000-0000-0000-0000-000000000000	3158cee6-a0ac-465e-8069-0cfa47444ac6	{"action":"login","actor_id":"ad6660e1-309b-4e39-a439-3384df2b78bd","actor_username":"teacher@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-20 19:30:44.155115+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
c55d29e1-e26e-443f-88f0-bff70094fa33	7a79e16b-242f-4a34-b660-45d76273807a	0cf30e66-853c-44ea-845f-3afa97b41383	s256	mcYO39cOGdFFrZl954acPECYp2c53tXw58K7ttTa2IY	recovery			2025-10-07 02:47:48.166302+00	2025-10-07 02:47:48.166302+00	recovery	\N
ec720242-1fc7-4491-bce8-e789207bff64	7a79e16b-242f-4a34-b660-45d76273807a	1e2da70b-4b6c-4a63-8686-9ed98130c068	s256	9v3ouwIcV3Cp4RlI8sAjh0kOSt0L8gp4lpCJ1rAppMc	recovery			2025-10-07 03:48:15.794799+00	2025-10-07 03:48:15.794799+00	recovery	\N
7f98b101-f59e-41d6-8da7-46390bcb8f1b	7a79e16b-242f-4a34-b660-45d76273807a	56afa457-4722-46e2-8f49-c765d79824cf	plain	cc8603fd17318a61c9ecdf602e7bac7b643275096e4184b13cd8f5133884546a2296afef5db5933d3c3b20df0bcb2d14413b8063a0501b83	magiclink			2025-10-09 01:29:08.072416+00	2025-10-09 01:29:16.767499+00	magiclink	2025-10-09 01:29:16.76746+00
7b97c5a1-bf3f-4fc0-8d30-a1b21dd851fa	7a79e16b-242f-4a34-b660-45d76273807a	2442d45b-f7b0-473a-992d-79fd12443004	s256	dtVmLzcohkY13Cb_R7rqe-Lp1nvQMNVQhtZCiyjql94	recovery			2025-10-07 03:51:37.398728+00	2025-10-07 03:51:37.398728+00	recovery	\N
5bebed07-8165-49ad-846e-64673cc107ce	7a79e16b-242f-4a34-b660-45d76273807a	39fd661a-3b9b-452c-a9ec-a60c297dfc6c	s256	n2G8R9NqGIls2RhlejWiw_H4yzD_Iei_bv4amj8v1zw	recovery			2025-10-07 03:51:58.902519+00	2025-10-07 03:51:58.902519+00	recovery	\N
50fa0285-0002-490c-91cb-7c6ea99f89e1	7a79e16b-242f-4a34-b660-45d76273807a	0ee25974-88aa-4f03-9a94-4121da657c83	s256	ydlO_mu4t7MQrDvIsTixLbqrFAalsZMUarBDjGbxaTk	magiclink			2025-10-09 16:39:14.693924+00	2025-10-09 16:39:50.962305+00	magiclink	2025-10-09 16:39:50.962261+00
53de77ce-6074-4f48-9cd7-3bfe4394a4f7	f199a9ff-01f1-484f-9263-8d289c35c664	cd95e60c-c8fa-4bc6-8212-3c5253714cd6	s256	HpXa3A2b9Qy9RFJYWqssP7DoMwlUwBkr9BH95y2dWkQ	email			2025-10-28 02:31:06.550207+00	2025-10-28 02:31:13.009701+00	email/signup	2025-10-28 02:31:13.009659+00
a18e910f-357c-4bb8-abe9-db474e8af741	7a79e16b-242f-4a34-b660-45d76273807a	b95ddc13-9691-4e50-a6b2-42ecd6044482	s256	RPf2MP35VJLgI7rgDIC9gc2ynmNK4duHzOMMw02OQDU	magiclink			2025-10-07 04:01:53.302629+00	2025-10-07 04:02:06.08051+00	magiclink	2025-10-07 04:02:06.080472+00
a197cfa3-e689-49d1-9f6e-395406ab3ae2	7a79e16b-242f-4a34-b660-45d76273807a	df7b3d62-0586-4293-add0-1e5c6e7405a7	s256	AHE3KubvOhLvHIcjdoSAbJ8LQB1s_abl2DflcGRqnJs	recovery			2025-10-07 14:53:01.708083+00	2025-10-07 14:53:01.708083+00	recovery	\N
358f9418-4c12-4dc3-87ef-5e49c8b410da	7a79e16b-242f-4a34-b660-45d76273807a	dd880632-6e79-4059-82c7-5201aa9ccc96	s256	B_Nb6iZbxA0Ln6aCyN3LsVpMQ3OdhiGt9fru6jJsI4k	recovery			2025-10-07 16:46:50.918532+00	2025-10-07 16:46:50.918532+00	recovery	\N
4e2c3df5-4c13-4263-af60-61e5d746ae79	7a79e16b-242f-4a34-b660-45d76273807a	35e737f8-c7fd-4733-8c9a-22d299de3bd2	s256	KTfXVMlb-4-O5BjiI6DCupcA6-z_9on4dctWyiulE2U	magiclink			2025-10-10 18:32:28.782374+00	2025-10-10 18:32:45.183651+00	magiclink	2025-10-10 18:32:45.18361+00
6932ae42-5a77-44b7-806e-1d5399a953e9	7a79e16b-242f-4a34-b660-45d76273807a	1937aaba-2211-4b26-808a-7e69f89da1a2	s256	rxIrMuoy8ONAYGBwt20OFe5_M1c0Vqs68p4isX1t_4Q	magiclink			2025-10-10 18:43:32.885469+00	2025-10-10 18:43:44.693125+00	magiclink	2025-10-10 18:43:44.693079+00
9853dede-990b-433b-854e-edbd93640444	7a79e16b-242f-4a34-b660-45d76273807a	8f2b79c2-262e-4026-a41d-8ba78ac9e422	s256	pkg9IL7EdzO16CqdkckdYxY69y-B2sHjVGf6PMp6uE4	recovery			2025-10-11 17:15:28.861219+00	2025-10-11 17:15:54.570478+00	recovery	2025-10-11 17:15:54.56981+00
15a449f1-de14-45aa-83fb-21c9f5bf6214	7a79e16b-242f-4a34-b660-45d76273807a	031279a8-c3e9-4d85-8d6b-f5b8f1bcc6d3	s256	Um78I0ZIjY6KwQc8xdyt_oKVJrIQ2eQJ-Wng2Wdfh4Y	magiclink			2025-10-15 22:16:34.94758+00	2025-10-15 22:16:34.94758+00	magiclink	\N
cbf37598-def8-4fae-905e-dc820d652695	7a79e16b-242f-4a34-b660-45d76273807a	e7160d75-fac3-4744-9aef-86afafefa25a	s256	NI1z-lJOz8C4uAuOFQrb9rV0JethpFfQXQGaC6jvUIA	magiclink			2025-10-15 22:17:39.661272+00	2025-10-15 22:17:51.258408+00	magiclink	2025-10-15 22:17:51.258373+00
8ebc56ba-8c2a-4f80-975a-9763222034f6	7a79e16b-242f-4a34-b660-45d76273807a	2b1c87a0-7261-488e-8b95-f8b451130779	s256	IAOLCrdrWEFxsYpzzLGBISsT9vP6MdRwjG4i-BI4_EM	magiclink			2025-10-15 22:18:09.415955+00	2025-10-15 22:18:09.415955+00	magiclink	\N
c36a8776-6f97-4c13-afd8-579fbab95654	7a79e16b-242f-4a34-b660-45d76273807a	a605b336-73d0-4222-94af-d8b98ad23494	s256	JfVnaC2fpCqsrrPPAsl36GP9EXl_Lm4DGDIqyYzCEeE	recovery			2025-10-15 22:18:21.596914+00	2025-10-15 22:18:21.596914+00	recovery	\N
a92ab484-77f0-43ef-b2df-5f829f6c63b8	7a79e16b-242f-4a34-b660-45d76273807a	ff2e3351-dc3b-4618-8028-20e49d30203a	s256	uowqIr6QbF0lec-43p6gNd8witytuQnePyeRl2qdsBU	recovery			2025-10-15 22:21:46.856938+00	2025-10-15 22:22:15.754466+00	recovery	2025-10-15 22:22:15.754415+00
a9e4a423-1b3a-4b5f-9c4e-cbc54c602ae3	7a79e16b-242f-4a34-b660-45d76273807a	75f686ab-f889-43ab-8b8e-7bd7a0eb6b37	s256	kX302osrtN3tXUw9syTLNMz3mEX-NvU6f52w-IyX730	magiclink			2025-10-22 17:06:20.568512+00	2025-10-22 17:06:20.568512+00	magiclink	\N
445ee6db-616f-4658-8e87-4c3b5c6fbdde	7a79e16b-242f-4a34-b660-45d76273807a	0bb36348-0e75-4082-af29-6cd606546077	s256	YZjApHdZIY_eeyRMozMoE-Ni2gDfPMSIpUPFVaEI3Xk	magiclink			2025-10-22 17:07:26.331075+00	2025-10-22 17:07:26.331075+00	magiclink	\N
f8a412e1-b45e-4df5-8200-327f96a5dc37	7a79e16b-242f-4a34-b660-45d76273807a	11eafba9-1589-4e12-b576-ad653108bade	s256	q26Etwzi668hupT3GIhhXHJths89tsptKWrBhdZorI8	magiclink			2025-10-22 17:07:33.723384+00	2025-10-22 17:07:33.723384+00	magiclink	\N
909ebb8c-badb-4d2e-b47e-9f8fad8bbcd4	7a79e16b-242f-4a34-b660-45d76273807a	be3ecf18-cdcc-4f81-946d-75ef822c0299	s256	Tr42x-Gupqy2WFA9ZB3ebloLW6VkNB2-I9ouETYK5F8	magiclink			2025-10-22 17:07:48.798312+00	2025-10-22 17:07:48.798312+00	magiclink	\N
d464e254-b8c4-4c80-b5a1-ea2ba04a3c70	7a79e16b-242f-4a34-b660-45d76273807a	9b5f4d88-fcee-4901-addc-b60cb8a3f00e	s256	_ZC8Xw_RXtx1czacFAQR8pD2ryY1XG8_HcHxRKMxlyg	recovery			2025-10-22 17:07:54.521351+00	2025-10-22 17:07:54.521351+00	recovery	\N
15fc5b45-bc1b-4473-a9d0-6ce17f820c53	7a79e16b-242f-4a34-b660-45d76273807a	ac73c549-db4e-4a6a-8248-e5c2235fbb58	s256	giKvLdXpEPGaQ1Iw31IHaAHxJEScBK6ygIbNoRbT0TQ	recovery			2025-10-22 17:10:54.34829+00	2025-10-22 17:10:54.34829+00	recovery	\N
18cd0d4e-f72d-4493-bf7e-377fa12048d3	7a79e16b-242f-4a34-b660-45d76273807a	ce9a7911-50f7-46bd-88d9-2982bfba7932	s256	CtyGykQUPUWw3v9_k88C9t-URHC1quVLeti5tsT1KKs	recovery			2025-10-22 17:14:59.213958+00	2025-10-22 17:14:59.213958+00	recovery	\N
deac3d65-d989-420f-8d1e-18f0ea278d3c	7a79e16b-242f-4a34-b660-45d76273807a	8bdc7beb-ba00-4abc-b329-0577ff97a9f9	s256	MpUvqmb6OtMqiyPmF0tOSlxbLp8yxUju95w6qeayRYA	recovery			2025-10-22 17:17:17.70478+00	2025-10-22 17:17:17.70478+00	recovery	\N
2df73e1b-c009-4b04-86e1-0172e87f4e9b	7a79e16b-242f-4a34-b660-45d76273807a	e0457fd4-ac91-4f96-9db5-8684a84c4045	s256	ms_M9-0sOLt_WkvctxpTbGwFlC3K3Kpq31neGqVtQeI	recovery			2025-10-22 17:20:23.941175+00	2025-10-22 17:20:23.941175+00	recovery	\N
284b4fb2-31b3-4684-a59a-c9eeab7d5284	b712b40c-7f2b-4ccb-8d7c-0196bc65d04e	df8f259a-79ad-4429-9052-ccd10d33c73a	s256	q0rarY5DTvwstkwipjqZ_7vicl7VAuvDWmfdaAsJfaw	email			2025-10-28 02:16:51.083317+00	2025-10-28 02:17:47.386322+00	email/signup	2025-10-28 02:17:47.386279+00
7ae4f224-1104-4622-8de6-eabc87ff77b3	ca99cee7-2971-490a-b9e4-286bc1076456	8c53a3e0-db5f-4534-a7b0-0e1de86f10a0	s256	OOBVn_iYKqBuq0a67Zq-PTVaoI3KUl4CpLucVOWOlnc	email			2025-10-28 02:27:55.785879+00	2025-10-28 02:28:02.998047+00	email/signup	2025-10-28 02:28:02.998008+00
106705e7-181b-4a26-b6fb-b99d3b320300	d70c716d-0555-41c5-ba66-cdae22ddecd2	f86d9de0-2bb1-4007-9eb9-7228e91b6af5	s256	xSMDf13q1tuPLgjm7FvpZkKkWxkIztdTRBSx6WZ6Euw	email			2025-10-28 14:15:40.281929+00	2025-10-28 14:15:46.014638+00	email/signup	2025-10-28 14:15:46.014596+00
f104e870-9503-494c-9641-d27001133062	7a79e16b-242f-4a34-b660-45d76273807a	2d9ab11c-b7e9-4d72-a0d3-3051213fd600	s256	7EbmWQJGsF_sl5udXSArej5E1Y74okcmUAlpLgtnoq8	magiclink			2025-10-29 20:43:51.786561+00	2025-10-29 20:43:51.786561+00	magiclink	\N
7980cd9f-95b3-4f31-a49b-4eee2aeb443f	7a79e16b-242f-4a34-b660-45d76273807a	bcafb797-3fe4-4505-ae95-300bd06e0ab6	s256	9lt5Vgf2Bq6N--JSPP0i6A-lyw5k6j7AWlCRjCZNtsg	magiclink			2025-10-29 20:44:14.186339+00	2025-10-29 20:44:14.186339+00	magiclink	\N
876d912f-b10b-43c9-9fe8-97ca742977ec	7a79e16b-242f-4a34-b660-45d76273807a	f5a0437a-7f14-4160-ba79-a5581dc3ec16	s256	5SWaIUY570bI05rDXm0yLh-NQPFBqRJjBQSDJBBOxeA	magiclink			2025-10-29 21:05:34.870172+00	2025-10-29 21:05:34.870172+00	magiclink	\N
a94c3fcc-02ec-411d-9588-55b9fc84785b	7a79e16b-242f-4a34-b660-45d76273807a	0f6ac726-4d49-4d12-b15f-46490794c301	s256	mHydjrywnNZJF-NWeWdT5gZLtjTNIJ81QJ8BDtrLEKg	magiclink			2025-11-05 00:35:49.61825+00	2025-11-05 00:35:49.61825+00	magiclink	\N
2b5032c3-26e6-40c7-9441-272ad3de0d5f	7a79e16b-242f-4a34-b660-45d76273807a	c3a25e76-4e49-4e87-b708-37143807af8a	s256	Be85Jk-xOREJq46hpFE1mnCyDwEVFkmXJj2o3zyqJdw	magiclink			2025-11-05 00:36:14.500559+00	2025-11-05 00:36:14.500559+00	magiclink	\N
7dcfc9f8-03d9-45cd-abe4-1fcd30b2fa36	7a79e16b-242f-4a34-b660-45d76273807a	24775d72-ea2b-40e1-b568-b9cad50afc85	s256	9WIJGxvxr4aTgOzQGY2Pawj1g-XVVZJSnr0PxuqainM	recovery			2025-11-05 00:36:22.923345+00	2025-11-05 00:36:22.923345+00	recovery	\N
0dd8c222-1879-4d08-86bc-66e8a65bbfcb	7a79e16b-242f-4a34-b660-45d76273807a	65e9b214-09ac-4b0d-be56-ddb164b457d5	s256	d0xGDtwBHgUOE3AJitOGqYy3-aEgXMGafQuqcaX0JLQ	magiclink			2025-11-05 00:40:32.130895+00	2025-11-05 00:40:32.130895+00	magiclink	\N
d6a10854-5c41-45d7-8787-75bbf7c490c4	7a79e16b-242f-4a34-b660-45d76273807a	7c0c3d20-bf78-4709-a97e-c3513695737f	s256	ATcHz0sLSxX9H9iOID4etD2tBqu_QDY8erl9McWKTsw	magiclink			2025-11-05 00:57:33.708871+00	2025-11-05 00:57:33.708871+00	magiclink	\N
435af5fa-0bc6-4f62-8265-950f78a04370	7a79e16b-242f-4a34-b660-45d76273807a	157e4bca-f958-4a46-82e6-d7973c09e078	s256	7l8vI5p7E9K7iMCos-LFvO95ODXzYRW96kbjh20NYBc	magiclink			2025-11-05 01:06:23.744434+00	2025-11-05 01:06:23.744434+00	magiclink	\N
7341f548-217b-4267-80a5-79614e7248a6	7a79e16b-242f-4a34-b660-45d76273807a	65d33099-0ea8-4e34-ada9-f602c45e0b7b	s256	gaGYhUWb-GmdHfvSV1BrBMHH6THtUTWJrAF8aiVTVqQ	recovery			2025-11-05 15:11:18.374221+00	2025-11-05 15:12:02.422552+00	recovery	2025-11-05 15:12:02.422493+00
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
995cc14f-3a97-4a00-b1a2-3c4305bb4f4b	995cc14f-3a97-4a00-b1a2-3c4305bb4f4b	{"sub": "995cc14f-3a97-4a00-b1a2-3c4305bb4f4b", "email": "user@example.com", "email_verified": false, "phone_verified": false}	email	2025-10-06 19:50:57.742628+00	2025-10-06 19:50:57.743293+00	2025-10-06 19:50:57.743293+00	149ffb8f-42d2-44dc-84cb-7f066811aa74
7a79e16b-242f-4a34-b660-45d76273807a	7a79e16b-242f-4a34-b660-45d76273807a	{"sub": "7a79e16b-242f-4a34-b660-45d76273807a", "email": "tjhixon@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-10-06 19:50:57.95026+00	2025-10-06 19:50:57.95031+00	2025-10-06 19:50:57.95031+00	5a727e48-68af-4243-a9b2-63bce6695079
56a3a331-0f73-4ba5-a3b7-0883c11d2af7	56a3a331-0f73-4ba5-a3b7-0883c11d2af7	{"sub": "56a3a331-0f73-4ba5-a3b7-0883c11d2af7", "name": "Thomas Referred", "email": "tjhixon+ref@gmail.com", "email_verified": true, "phone_verified": false}	email	2025-10-31 02:35:47.975836+00	2025-10-31 02:35:47.976481+00	2025-10-31 02:35:47.976481+00	09e12c18-e898-48ac-8cfb-2d7a1b37d48a
d778315f-3864-444c-87a8-74f322d0dad8	d778315f-3864-444c-87a8-74f322d0dad8	{"sub": "d778315f-3864-444c-87a8-74f322d0dad8", "email": "district@test.com", "email_verified": false, "phone_verified": false}	email	2025-12-20 19:19:38.328494+00	2025-12-20 19:19:38.32856+00	2025-12-20 19:19:38.32856+00	e4b74617-a69b-4d62-90a3-d2d3c787bd7e
ad6660e1-309b-4e39-a439-3384df2b78bd	ad6660e1-309b-4e39-a439-3384df2b78bd	{"sub": "ad6660e1-309b-4e39-a439-3384df2b78bd", "email": "teacher@test.com", "email_verified": false, "phone_verified": false}	email	2025-12-20 19:19:38.66665+00	2025-12-20 19:19:38.666701+00	2025-12-20 19:19:38.666701+00	4ad1b02b-57df-4fe2-8a08-bf0a92426799
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
d884548f-05b4-4741-b4d0-f463ae5283c3	2025-12-20 19:24:51.98936+00	2025-12-20 19:24:51.98936+00	password	ab5e5eba-c9b0-40b4-b262-e94d2d7ed1bc
d884548f-05b4-4741-b4d0-f463ae5283c3	2025-12-20 19:25:32.329652+00	2025-12-20 19:25:32.329652+00	totp	2f35cd7a-39de-44bc-b50e-830e627b1f8c
fb87a602-c88f-4e80-a81a-dc544954723f	2025-12-20 19:25:52.174265+00	2025-12-20 19:25:52.174265+00	password	d7bbdd4a-ec4f-4d8c-bb73-a5dce48a470e
fb87a602-c88f-4e80-a81a-dc544954723f	2025-12-20 19:26:04.92321+00	2025-12-20 19:26:04.92321+00	totp	292afd6c-6474-4acf-9787-77e12f01e537
5bddf6f2-0b89-4362-89a6-bf183d887073	2025-12-20 19:28:53.821171+00	2025-12-20 19:28:53.821171+00	password	6202f655-9fb4-4e24-9430-373feae61873
5bddf6f2-0b89-4362-89a6-bf183d887073	2025-12-20 19:29:05.901861+00	2025-12-20 19:29:05.901861+00	totp	b19c23b5-f403-4855-9d97-af50bae3cfbb
820155a7-a328-4c4a-b3a8-a952c40c324c	2025-12-20 19:30:44.216892+00	2025-12-20 19:30:44.216892+00	password	4128c395-1a5c-4b8e-8614-5f7030c69a8b
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
54bf298a-b031-49a4-9a41-75b41728d103	71fac55f-068c-4007-90d2-a4178e030931	2025-10-08 22:48:52.723308+00	2025-10-08 22:48:52.84886+00	68.53.242.179		\N
b1ded944-9c3c-4b6b-be97-8d8ce5637670	71fac55f-068c-4007-90d2-a4178e030931	2025-10-09 00:01:03.806988+00	2025-10-09 00:01:03.957859+00	68.53.242.179		\N
90153fdd-22e2-4793-9420-7fa02e1d388f	71fac55f-068c-4007-90d2-a4178e030931	2025-10-09 17:04:10.711924+00	2025-10-09 17:04:10.833898+00	68.53.242.179		\N
c77ed76f-9c27-47ff-a51e-4bf25110f18d	71fac55f-068c-4007-90d2-a4178e030931	2025-10-09 17:05:18.115178+00	2025-10-09 17:05:18.235979+00	68.53.242.179		\N
40f92066-a5b9-41a3-99b7-33ce61e19e5b	71fac55f-068c-4007-90d2-a4178e030931	2025-10-15 22:24:03.917216+00	\N	68.53.242.179		\N
2b6adfab-d44f-467d-b84d-190f48856408	71fac55f-068c-4007-90d2-a4178e030931	2025-10-15 22:24:11.945474+00	2025-10-15 22:24:12.017958+00	68.53.242.179		\N
6a9b7554-2a47-42bf-9d55-4bf711964e6c	71fac55f-068c-4007-90d2-a4178e030931	2025-10-22 17:25:42.90597+00	2025-10-22 17:25:43.064686+00	68.53.242.179		\N
29a87657-1d79-4817-bf14-f51ef328279a	71fac55f-068c-4007-90d2-a4178e030931	2025-10-24 21:56:54.457924+00	2025-10-24 21:56:54.601385+00	68.53.242.179		\N
a5da6e9a-3084-44e9-a7cd-55a6f797764f	71fac55f-068c-4007-90d2-a4178e030931	2025-10-24 21:57:08.482019+00	2025-10-24 21:57:08.593148+00	68.53.242.179		\N
cfa33a7d-be40-4008-8491-101b35b6dfc2	71fac55f-068c-4007-90d2-a4178e030931	2025-10-24 23:46:42.957896+00	2025-10-24 23:46:43.190189+00	68.53.242.179		\N
28d75b47-aed2-447b-be15-2d23c2e69ba4	71fac55f-068c-4007-90d2-a4178e030931	2025-10-24 23:46:57.140928+00	2025-10-24 23:46:57.294708+00	68.53.242.179		\N
cabc8a46-2aea-49cb-9c42-24dfa1e14cf0	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 03:30:24.375868+00	2025-10-25 03:30:24.536414+00	68.53.242.179		\N
03581400-da68-4f3a-8dcb-6c8595aef56f	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 03:30:46.9623+00	\N	68.53.242.179		\N
cc11449b-465b-4d3d-ac7b-0972ce136618	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 03:30:58.12803+00	2025-10-25 03:30:58.219307+00	68.53.242.179		\N
c3b32b88-bdf0-49f6-927f-255aff1a2683	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 04:10:24.379377+00	2025-10-25 04:10:24.605276+00	68.53.242.179		\N
11600b46-a65a-46be-a805-cccd3d6a1df4	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 04:10:42.148828+00	2025-10-25 04:10:42.248698+00	68.53.242.179		\N
7f903632-a657-47ee-8ce0-9b45a9ca1714	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 04:14:02.273277+00	\N	68.53.242.179		\N
86b543cb-067b-44fd-a06a-29ec7c815502	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 04:14:08.498968+00	2025-10-25 04:14:08.593481+00	68.53.242.179		\N
57d7806e-65fb-4db8-9397-a7ea78a47d45	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 14:22:15.248417+00	2025-10-25 14:22:15.444291+00	68.53.242.179		\N
05bc17f3-262c-4a05-87b7-5c4852b26c21	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 14:23:23.440826+00	2025-10-25 14:23:23.520162+00	68.53.242.179		\N
e09a1b74-caa4-4b12-89ee-4f9db3931c50	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 14:24:05.104538+00	2025-10-25 14:24:05.228546+00	68.53.242.179		\N
4d3bd06a-8848-4d44-9ca8-fb8a6d4f9314	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 14:24:27.075895+00	2025-10-25 14:24:27.17266+00	68.53.242.179		\N
ed61cab7-a36c-41b9-af8f-96820fcbe087	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 14:24:53.051576+00	\N	68.53.242.179		\N
3ad531ef-eb21-4029-acf2-49998772cbf0	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 14:25:03.268189+00	2025-10-25 14:25:03.350987+00	68.53.242.179		\N
20db8154-4974-4540-9d78-3739ff92d2ec	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 14:30:11.836088+00	\N	68.53.242.179		\N
c027ab55-6696-4d50-82d4-d20c067955f1	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 14:30:21.477914+00	2025-10-25 14:30:21.551353+00	68.53.242.179		\N
c2dc40dd-66b1-47a6-8d7b-b62063de2ccd	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 14:31:24.963088+00	2025-10-25 14:31:25.128982+00	68.53.242.179		\N
7831d9ec-f459-4d83-94d5-b30274221b95	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 14:32:16.388276+00	2025-10-25 14:32:16.505695+00	68.53.242.179		\N
5b32ffcc-fc2e-4934-aeb8-2cc22fc9f6ef	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 14:32:28.182201+00	\N	68.53.242.179		\N
bd95e20f-9af0-4d93-b9bb-a9165da2617d	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 14:32:37.596259+00	2025-10-25 14:32:37.675392+00	68.53.242.179		\N
27ad07ff-01db-4236-9b0b-aa90c500ec76	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 14:38:13.139006+00	2025-10-25 14:38:13.274909+00	68.53.242.179		\N
d68e8d93-4945-4b00-9f25-6018ae4adb99	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 14:38:49.756095+00	2025-10-25 14:38:49.85483+00	68.53.242.179		\N
767eb5a0-c8f8-4e44-a0e0-67b6ee6aacd4	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 14:39:52.257137+00	2025-10-25 14:39:52.336755+00	68.53.242.179		\N
03abfaa3-0817-4cc0-80dd-671948b76a4d	71fac55f-068c-4007-90d2-a4178e030931	2025-10-25 14:42:50.245678+00	2025-10-25 14:42:50.330031+00	68.53.242.179		\N
10f35f36-d106-40ec-878d-76b25d828f65	71fac55f-068c-4007-90d2-a4178e030931	2025-10-26 13:20:41.310106+00	2025-10-26 13:20:41.439034+00	68.53.242.179		\N
b2680108-289d-4807-93e3-fd264317814d	71fac55f-068c-4007-90d2-a4178e030931	2025-10-27 14:56:37.475824+00	2025-10-27 14:56:37.625383+00	68.53.242.179		\N
af659e4d-84bf-4d31-a860-d19c734d8006	71fac55f-068c-4007-90d2-a4178e030931	2025-10-28 15:03:28.025671+00	2025-10-28 15:03:28.224905+00	68.53.242.179		\N
c7493f4a-a29e-4290-b186-5fabe4944664	71fac55f-068c-4007-90d2-a4178e030931	2025-10-29 20:51:48.651181+00	2025-10-29 20:51:48.810338+00	68.53.242.179		\N
dc1fd891-a073-45ac-82d1-b04fb0395845	71fac55f-068c-4007-90d2-a4178e030931	2025-10-29 21:06:05.559849+00	2025-10-29 21:06:05.667391+00	68.53.242.179		\N
5becd264-4383-43e2-bdee-f24cfb320fb7	71fac55f-068c-4007-90d2-a4178e030931	2025-11-05 21:38:44.150204+00	\N	68.53.242.179		\N
1d84f794-18a7-4bdb-bf5d-baa6e192a972	71fac55f-068c-4007-90d2-a4178e030931	2025-11-05 21:38:58.357281+00	2025-11-05 21:38:58.452555+00	68.53.242.179		\N
3c78ddd3-263b-42f6-9b7e-4b4d5aef20d8	71fac55f-068c-4007-90d2-a4178e030931	2025-12-20 19:25:32.154373+00	2025-12-20 19:25:32.328182+00	68.53.242.179		\N
2555a244-8478-4487-aa9f-e2f415d78f42	71fac55f-068c-4007-90d2-a4178e030931	2025-12-20 19:26:04.839132+00	2025-12-20 19:26:04.922021+00	68.53.242.179		\N
c1116b27-a9d0-404d-a0d6-0373936a67db	71fac55f-068c-4007-90d2-a4178e030931	2025-12-20 19:29:05.821827+00	2025-12-20 19:29:05.900458+00	68.53.242.179		\N
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
71fac55f-068c-4007-90d2-a4178e030931	7a79e16b-242f-4a34-b660-45d76273807a	Authenticator App	totp	verified	2025-10-08 22:48:24.582318+00	2025-12-20 19:29:05.823141+00	RFG6R57QVP3ZTCD5WPR7GMLRWU2QCWYB	\N	2025-12-20 19:29:05.821778+00	\N	\N	\N
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	310	xp57bsmd6qqs	7a79e16b-242f-4a34-b660-45d76273807a	t	2025-12-20 19:24:51.970222+00	2025-12-20 19:25:32.338834+00	\N	d884548f-05b4-4741-b4d0-f463ae5283c3
00000000-0000-0000-0000-000000000000	311	rkbgexc55w4m	7a79e16b-242f-4a34-b660-45d76273807a	f	2025-12-20 19:25:32.342636+00	2025-12-20 19:25:32.342636+00	xp57bsmd6qqs	d884548f-05b4-4741-b4d0-f463ae5283c3
00000000-0000-0000-0000-000000000000	312	bo6ouxfoh6ly	7a79e16b-242f-4a34-b660-45d76273807a	t	2025-12-20 19:25:52.173059+00	2025-12-20 19:26:04.925549+00	\N	fb87a602-c88f-4e80-a81a-dc544954723f
00000000-0000-0000-0000-000000000000	313	ideo5qnzcmhu	7a79e16b-242f-4a34-b660-45d76273807a	f	2025-12-20 19:26:04.925871+00	2025-12-20 19:26:04.925871+00	bo6ouxfoh6ly	fb87a602-c88f-4e80-a81a-dc544954723f
00000000-0000-0000-0000-000000000000	314	z6x3wblmofoo	7a79e16b-242f-4a34-b660-45d76273807a	t	2025-12-20 19:28:53.818501+00	2025-12-20 19:29:05.905988+00	\N	5bddf6f2-0b89-4362-89a6-bf183d887073
00000000-0000-0000-0000-000000000000	315	dgro6ilgh32l	7a79e16b-242f-4a34-b660-45d76273807a	f	2025-12-20 19:29:05.906552+00	2025-12-20 19:29:05.906552+00	z6x3wblmofoo	5bddf6f2-0b89-4362-89a6-bf183d887073
00000000-0000-0000-0000-000000000000	316	b4l2khk7tead	ad6660e1-309b-4e39-a439-3384df2b78bd	f	2025-12-20 19:30:44.193501+00	2025-12-20 19:30:44.193501+00	\N	820155a7-a328-4c4a-b3a8-a952c40c324c
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
d884548f-05b4-4741-b4d0-f463ae5283c3	7a79e16b-242f-4a34-b660-45d76273807a	2025-12-20 19:24:51.960877+00	2025-12-20 19:25:32.34397+00	71fac55f-068c-4007-90d2-a4178e030931	aal2	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	68.53.242.179	\N	\N	\N	\N	\N
fb87a602-c88f-4e80-a81a-dc544954723f	7a79e16b-242f-4a34-b660-45d76273807a	2025-12-20 19:25:52.172261+00	2025-12-20 19:26:04.927174+00	71fac55f-068c-4007-90d2-a4178e030931	aal2	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	68.53.242.179	\N	\N	\N	\N	\N
5bddf6f2-0b89-4362-89a6-bf183d887073	7a79e16b-242f-4a34-b660-45d76273807a	2025-12-20 19:28:53.817342+00	2025-12-20 19:29:05.908264+00	71fac55f-068c-4007-90d2-a4178e030931	aal2	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	68.53.242.179	\N	\N	\N	\N	\N
820155a7-a328-4c4a-b3a8-a952c40c324c	ad6660e1-309b-4e39-a439-3384df2b78bd	2025-12-20 19:30:44.167852+00	2025-12-20 19:30:44.167852+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	68.53.242.179	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	56a3a331-0f73-4ba5-a3b7-0883c11d2af7	authenticated	authenticated	tjhixon+ref@gmail.com	$2a$10$6/OnRfRcdYVOhYJRN6NzDevgfFu/nuqDFRQtD0E12PAeB8n0sJn1u	2025-10-31 02:36:03.119818+00	\N		\N		\N			\N	2025-10-31 02:36:04.02243+00	{"provider": "email", "providers": ["email"]}	{"sub": "56a3a331-0f73-4ba5-a3b7-0883c11d2af7", "name": "Thomas Referred", "email": "tjhixon+ref@gmail.com", "email_verified": true, "phone_verified": false}	\N	2025-10-31 02:35:47.949996+00	2025-10-31 02:36:23.041292+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7a79e16b-242f-4a34-b660-45d76273807a	authenticated	authenticated	tjhixon@gmail.com	$2a$06$nx8vmYaPa9zRUbINAf.1kOqbOZMguZffdd3Q3w/las3vy5Te.UFW2	2025-10-06 19:50:57.956366+00	\N		\N		2025-12-20 16:47:15.673771+00			\N	2025-12-20 19:28:53.817229+00	{"provider": "email", "providers": ["email"]}	{"name": "Jack Hixon", "role": "SUPER_ADMIN", "legacy_id": "cmg60nw7m0000on5g3pd8sawo", "email_verified": true}	\N	2025-10-06 19:50:57.947919+00	2025-12-20 19:29:05.907574+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	ad6660e1-309b-4e39-a439-3384df2b78bd	authenticated	authenticated	teacher@test.com	$2a$10$Xi0uTAjNTpbZ9BRqyBCnl.QnLCbhDlCCNGgh6z7P2AsnRGy9V56PG	2025-12-20 19:19:38.67132+00	\N		\N		\N			\N	2025-12-20 19:30:44.16599+00	{"provider": "email", "providers": ["email"]}	{"name": "Sample Teacher", "email_verified": true}	\N	2025-12-20 19:19:38.664837+00	2025-12-20 19:30:44.213553+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	995cc14f-3a97-4a00-b1a2-3c4305bb4f4b	authenticated	authenticated	user@example.com	$2a$10$iCFU0rvrZVkj7UpiYhxQPO5xO6ZwC.8sm.pLa/a/K.5.XYRyDH49W	2025-10-06 19:50:57.747099+00	\N		\N		\N			\N	2025-10-27 14:46:27.136685+00	{"provider": "email", "providers": ["email"]}	{"name": "Test User", "role": "USER", "legacy_id": "cmg5q2jhc0001oniqdghczalp", "email_verified": true}	\N	2025-10-06 19:50:57.740309+00	2025-10-27 14:46:27.140777+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	d778315f-3864-444c-87a8-74f322d0dad8	authenticated	authenticated	district@test.com	$2a$10$UlXr6eVyjbtuvJUG49EmQe3nfYOcHCrxzVpzF8NQj7jiTsU8L.hq2	2025-12-20 19:19:38.334008+00	\N		\N		\N			\N	2025-12-20 19:22:50.42022+00	{"provider": "email", "providers": ["email"]}	{"name": "District Administrator", "email_verified": true}	\N	2025-12-20 19:19:38.326214+00	2025-12-20 19:22:50.445016+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: AffiliateAttribution; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AffiliateAttribution" (id, "refCode", "prospectUserId", "clickId", "deviceId", ip, utm, model, "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: AffiliateClick; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AffiliateClick" (id, "refCode", "sessionId", ip, ua, utm, "createdAt") FROM stdin;
cmhdss97v0000on10y34mh79d	cVJO3Mb3	session_1761851315709_5th02cpmx	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-30 19:08:37.675
cmhdssc3b0001on10zrcy3cin	cVJO3Mb3	session_1761851319759_5jlkuxnyb	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-30 19:08:41.399
cmhdt6xp50000onmum6xergtb	cVJO3Mb3	session_1761852000864_ttys0tm2u	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-30 19:20:02.585
cmhdt70g30001onmuxomr8505	cVJO3Mb3	session_1761852004746_3cptya7ye	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-30 19:20:06.148
cmhdteiho001jonmukehnl5rh	cVJO3Mb3	session_1761852355620_io0s1homw	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-30 19:25:56.124
cmhdtekei001konmub3lk5z0c	cVJO3Mb3	session_1761852356218_mjt4v1pt8	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-30 19:25:58.602
cmhdtnv4f003eonmuu52kfn8w	cVJO3Mb3	session_1761852791767_gjatuqzfj	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 19:33:12.399
cmhdtnw7h003fonmumr1hk444	cVJO3Mb3	session_1761852792363_oopigpkcu	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 19:33:13.805
cmhdtnyz7003gonmuv7xs3af3	cVJO3Mb3	session_1761852796936_0rjyp9s9y	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 19:33:17.395
cmhdtnzf8003honmudz3o2a8o	cVJO3Mb3	session_1761852792363_oopigpkcu	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 19:33:17.972
cmhdtwcgn0000on3r122qj13g	cVJO3Mb3	session_1761853186360_8qjb6gv8b	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 19:39:48.119
cmhdtwez10001on3rwjgkb51d	cVJO3Mb3	session_1761853190366_qhlph36kz	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 19:39:51.373
cmhdtwgx70002on3rhsxijy3k	cVJO3Mb3	session_1761853193475_c3122oh6p	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 19:39:53.9
cmhdtwhe60003on3rrn28ibvy	cVJO3Mb3	session_1761853190366_qhlph36kz	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 19:39:54.51
cmhdu5sjc0000on9m1pkil3w4	cVJO3Mb3	session_1761853627106_1guthkskk	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 19:47:08.856
cmhdu5v190001on9ms8fi0sez	cVJO3Mb3	session_1761853190366_qhlph36kz	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 19:47:12.094
cmhdu5zdv0002on9md0bigu7q	cVJO3Mb3	session_1761853637308_7a9sszm19	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 19:47:17.732
cmhdu5zto0003on9magcvhbyn	cVJO3Mb3	session_1761853190366_qhlph36kz	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 19:47:18.3
cmhdunxsp001eon51ch9rf0oy	cVJO3Mb3	session_1761854474350_i33r913lc	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-30 20:01:15.482
cmhdunybz001fon51zr78offf	cVJO3Mb3	session_1761854474729_z7y38qfhk	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-30 20:01:16.175
cmhduw2i60000ondcsonbx16r	cVJO3Mb3	session_1761854853973_w280w74lw	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 20:07:34.83
cmhduw2pz0001ondcqkalxp2t	cVJO3Mb3	session_1761854853047_doyxh3lfi	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 20:07:35.111
cmhduw55t0002ondchv4qrsfg	cVJO3Mb3	session_1761854857315_alu8lvus9	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 20:07:38.274
cmhdvpyup0000ondytx5bxq82	cVJO3Mb3	session_1761856247993_f666ptdbe	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-30 20:30:49.777
cmhdvpz0l0001ondyhqu3h0zq	cVJO3Mb3	session_1761856247988_oqg3jkt0f	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-30 20:30:49.989
cmhdvq1w60002ondydub0u2b4	cVJO3Mb3	session_1761856252112_qyfqrv2jk	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-30 20:30:53.718
cmhdvr9e00000on5tgexhtpdf	cVJO3Mb3	session_1761856308209_5fuf2f8ma	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-30 20:31:50.089
cmhdvsfj70000ontbroskeo04	cVJO3Mb3	session_1761856362936_h8gsejrew	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 20:32:44.707
cmhdvsimw0001ontbcphiqk2q	cVJO3Mb3	session_1761854857315_alu8lvus9	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 20:32:48.728
cmhdvv8c60013ontbw5o9r8zx	cVJO3Mb3	session_1761856494814_1b9rztkah	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-30 20:34:55.351
cmhdvv8r90014ontb88o3iz3n	cVJO3Mb3	session_1761856252112_qyfqrv2jk	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-30 20:34:55.893
cmhdvvce00016ontbfmuhgegs	cVJO3Mb3	session_1761856500125_ysz9glq4l	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-30 20:35:00.601
cmhdvvcph0017ontbw36l4899	cVJO3Mb3	session_1761856252112_qyfqrv2jk	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-30 20:35:01.014
cmhdw7dk60000ondj2chvgr2n	cVJO3Mb3	session_1761857060184_nxa07teld	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 20:44:21.99
cmhdw7gbj0001ondjqq7eg50w	cVJO3Mb3	session_1761857064692_f91rctzcd	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 20:44:25.568
cmhdw7kv10002ondjy16xjiax	cVJO3Mb3	session_1761857070979_227ukz8kw	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 20:44:31.454
cmhdw7lc70003ondj6r0su4ej	cVJO3Mb3	session_1761857064692_f91rctzcd	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 20:44:32.071
cmhdw80f00004ondjaj07w8z6	cVJO3Mb3	session_1761857091134_82rhv2w04	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 20:44:51.612
cmhdw817h0005ondj1ivmq52w	cVJO3Mb3	session_1761857064692_f91rctzcd	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 20:44:52.637
cmhdw8mhw0006ondjl29o7w8m	cVJO3Mb3	session_1761857119746_abgtkilib	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 20:45:20.228
cmhdw8n3x0007ondj19708dip	cVJO3Mb3	session_1761857064692_f91rctzcd	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	null	2025-10-30 20:45:21.022
cmhe87lj10000on9l2o3y4vou	cVJO3Mb3	session_1761877226948_zj1p6xx29	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:20:27.71
cmhe87mcb0001on9ljcfar39p	cVJO3Mb3	session_1761877227349_y1j2e6bv9	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:20:28.763
cmhe87n600002on9lw5qrxh9c	cVJO3Mb3	session_1761877229377_0xz5gcdo5	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:20:29.832
cmhe87nnl0003on9l5orin0gu	cVJO3Mb3	session_1761877227349_y1j2e6bv9	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:20:30.465
cmhe87sw50005on9lxawsarps	cVJO3Mb3	session_1761877236796_goqo50apa	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:20:37.253
cmhe87tuy0006on9lnbapeymp	cVJO3Mb3	session_1761877227349_y1j2e6bv9	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:20:38.506
cmhe8gcwo0000onx32ipki1qg	cVJO3Mb3	session_1761877634628_4hq3ay9ry	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:27:16.44
cmhe8gfy50001onx3xgg6gtps	cVJO3Mb3	session_1761877638932_hi0j06a3c	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:27:20.381
cmhe8gh8x0002onx3paepggp5	cVJO3Mb3	session_1761877641634_o6s6cubji	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:27:22.065
cmhe8ghqp0003onx3xbjxglar	cVJO3Mb3	session_1761877638932_hi0j06a3c	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:27:22.705
cmhe8gng80005onx3248dyu1u	cVJO3Mb3	session_1761877649650_bgerryrn0	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:27:30.105
cmhe8gobt0006onx3nyrmxuip	cVJO3Mb3	session_1761877638932_hi0j06a3c	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:27:31.242
cmhe8gsff0009onx3oi3i85cx	cVJO3Mb3	session_1761877656113_p8zu1d6km	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:27:36.556
cmhe8gtg7000eonx3m6tooqjq	cVJO3Mb3	session_1761877638932_hi0j06a3c	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:27:37.879
cmhe94na70000onci9p44nozz	cVJO3Mb3	session_1761878768814_ezx5vjniu	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:46:09.632
cmhe94oqg0001onci71htdryc	cVJO3Mb3	session_1761878769212_5favh87q7	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:46:11.512
cmhe9527d0002onciqa04fyiq	cVJO3Mb3	session_1761878788472_hwo9k70ld	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:46:28.969
cmhe952sy0003oncim12txaok	cVJO3Mb3	session_1761878788880_dwpw8e0zj	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:46:29.715
cmhe959d10004oncirh0qvxox	cVJO3Mb3	session_1761878797785_ay8gren8m	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:46:38.246
cmhe959xs0005oncimgsmnuvq	cVJO3Mb3	session_1761878788880_dwpw8e0zj	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:46:38.992
cmhe95dyp0007onci3xt42z95	cVJO3Mb3	session_1761878803684_6mn4i68a5	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:46:44.209
cmhe95et10008oncivhveq3bl	cVJO3Mb3	session_1761878788880_dwpw8e0zj	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:46:45.302
cmhe95hw7000bonci3si9x9mt	cVJO3Mb3	session_1761878808778_tsgbi1ds9	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:46:49.304
cmhe95iny000gonciomw4bh6g	cVJO3Mb3	session_1761878788880_dwpw8e0zj	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	null	2025-10-31 02:46:50.302
\.


--
-- Data for Name: AffiliateCommission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AffiliateCommission" (id, "refCode", "referrerId", "referredUserId", event, "amountCents", status, "voidReason", "holdUntil", "orderId", "createdAt") FROM stdin;
\.


--
-- Data for Name: AffiliateNotificationPreferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AffiliateNotificationPreferences" (id, "referrerId", "emailOnPayout", "emailOnCommissionEarned", "emailOnCommissionPayable", "emailWeeklySummary", "emailMonthlySummary", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AffiliatePayout; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AffiliatePayout" (id, "referrerId", "amountCents", status, provider, "transferId", "failureReason", "payoutMethod", "estimatedArrivalDate", "actualArrivalDate", "feesCents", "netAmountCents", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AffiliatePayoutPreferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AffiliatePayoutPreferences" (id, "referrerId", "minPayoutThresholdCents", "payoutFrequency", "autoPayoutEnabled", "payoutDayOfMonth", "payoutDayOfWeek", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AffiliateReferrer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AffiliateReferrer" (id, "userId", "refCode", status, "stripeConnectAccountId", "lastPayoutDate", "lifetimeEarningsCents", "lifetimePaidOutCents", "createdAt") FROM stdin;
\.


--
-- Data for Name: AuthorizationCode; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuthorizationCode" (code, "clientId", "redirectUri", scope, nonce, state, "codeChallenge", "codeChallengeMethod", "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: BannedDevice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BannedDevice" ("deviceId", reason, "createdAt") FROM stdin;
\.


--
-- Data for Name: BannedEmail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BannedEmail" (email, reason, "createdAt") FROM stdin;
\.


--
-- Data for Name: BannedUser; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BannedUser" ("userId", reason, "createdAt") FROM stdin;
\.


--
-- Data for Name: ChatGPTAssessmentResult; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChatGPTAssessmentResult" (id, "assessmentId", "overallScore", percentile, scores, "categoryScores", recommendations, "createdAt") FROM stdin;
\.


--
-- Data for Name: CreditTransaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CreditTransaction" (id, "userId", amount, type, reference, "balanceAfter", "createdAt") FROM stdin;
\.


--
-- Data for Name: EmailTemplate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EmailTemplate" (id, name, slug, type, category, subject, preheader, html, "plainText", variables, metadata, version, "parentId", "isActive", "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: EmailTemplateVersion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EmailTemplateVersion" (id, "templateId", version, name, subject, preheader, html, "plainText", variables, metadata, "changeDescription", "createdById", "createdAt") FROM stdin;
\.


--
-- Data for Name: MagicLinkToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MagicLinkToken" (email, token, "userId", "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: OAuthToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OAuthToken" (id, "clientId", "accessToken", "refreshToken", "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: PDFStyle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PDFStyle" (id, name, css, "updatedAt") FROM stdin;
\.


--
-- Data for Name: TrialSession; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TrialSession" (id, "childAge", "relationshipType", status, questions, answers, "startedAt", "completedAt", "createdAt") FROM stdin;
trial_6b86c282-38b6-4e0d-93ac-8825d7f6da46	8	parent	completed	"[\\"trial_attention_1\\",\\"trial_attention_2\\",\\"trial_attention_3\\",\\"trial_emotional_1\\",\\"trial_emotional_2\\",\\"trial_emotional_3\\",\\"trial_social_1\\",\\"trial_social_2\\",\\"trial_social_3\\",\\"trial_behavioral_1\\",\\"trial_behavioral_2\\",\\"trial_behavioral_3\\",\\"trial_learning_1\\",\\"trial_learning_2\\",\\"trial_learning_3\\"]"	"[{\\"questionId\\":\\"trial_attention_1\\",\\"answer\\":\\"yes\\"},{\\"questionId\\":\\"trial_attention_2\\",\\"answer\\":\\"no\\"},{\\"questionId\\":\\"trial_attention_3\\",\\"answer\\":\\"yes\\"},{\\"questionId\\":\\"trial_emotional_1\\",\\"answer\\":\\"yes\\"},{\\"questionId\\":\\"trial_emotional_2\\",\\"answer\\":\\"no\\"},{\\"questionId\\":\\"trial_emotional_3\\",\\"answer\\":\\"no\\"},{\\"questionId\\":\\"trial_social_1\\",\\"answer\\":\\"no\\"},{\\"questionId\\":\\"trial_social_2\\",\\"answer\\":\\"no\\"},{\\"questionId\\":\\"trial_social_3\\",\\"answer\\":\\"no\\"},{\\"questionId\\":\\"trial_behavioral_1\\",\\"answer\\":\\"no\\"},{\\"questionId\\":\\"trial_behavioral_2\\",\\"answer\\":\\"no\\"},{\\"questionId\\":\\"trial_behavioral_3\\",\\"answer\\":\\"no\\"},{\\"questionId\\":\\"trial_learning_1\\",\\"answer\\":\\"no\\"},{\\"questionId\\":\\"trial_learning_2\\",\\"answer\\":\\"yes\\"},{\\"questionId\\":\\"trial_learning_3\\",\\"answer\\":\\"yes\\"}]"	2025-11-04 14:54:50.936	2025-11-04 15:04:27.153	2025-11-04 14:54:50.936
trial_febe1b57-78ea-4f5e-a522-a8a50751fc78	9	parent	completed	"[\\"trial_attention_1\\",\\"trial_attention_2\\",\\"trial_attention_3\\",\\"trial_emotional_1\\",\\"trial_emotional_2\\",\\"trial_emotional_3\\",\\"trial_social_1\\",\\"trial_social_2\\",\\"trial_social_3\\",\\"trial_behavioral_1\\",\\"trial_behavioral_2\\",\\"trial_behavioral_3\\",\\"trial_learning_1\\",\\"trial_learning_2\\",\\"trial_learning_3\\"]"	"[{\\"questionId\\":\\"trial_attention_1\\",\\"answer\\":\\"yes\\"},{\\"questionId\\":\\"trial_attention_2\\",\\"answer\\":\\"yes\\"},{\\"questionId\\":\\"trial_attention_3\\",\\"answer\\":\\"yes\\"},{\\"questionId\\":\\"trial_emotional_1\\",\\"answer\\":\\"yes\\"},{\\"questionId\\":\\"trial_emotional_2\\",\\"answer\\":\\"yes\\"},{\\"questionId\\":\\"trial_emotional_3\\",\\"answer\\":\\"yes\\"},{\\"questionId\\":\\"trial_social_1\\",\\"answer\\":\\"yes\\"},{\\"questionId\\":\\"trial_social_2\\",\\"answer\\":\\"yes\\"},{\\"questionId\\":\\"trial_social_3\\",\\"answer\\":\\"yes\\"},{\\"questionId\\":\\"trial_behavioral_1\\",\\"answer\\":\\"yes\\"},{\\"questionId\\":\\"trial_behavioral_2\\",\\"answer\\":\\"yes\\"},{\\"questionId\\":\\"trial_behavioral_3\\",\\"answer\\":\\"yes\\"},{\\"questionId\\":\\"trial_learning_1\\",\\"answer\\":\\"yes\\"},{\\"questionId\\":\\"trial_learning_2\\",\\"answer\\":\\"yes\\"},{\\"questionId\\":\\"trial_learning_3\\",\\"answer\\":\\"yes\\"}]"	2025-11-04 15:17:34.911	2025-11-04 15:21:48.223	2025-11-04 15:17:34.911
cmhniksse0000onfoaaol90kg	0	other	started	[]	[]	2025-11-06 14:20:35.39	\N	2025-11-06 14:20:35.39
cmhnilv3l0001onfobij07yjd	7	parent	completed	["q1", "q2"]	[{"answer": 3, "answeredAt": "2025-11-06T14:21:26.135Z", "questionId": "q1"}, {"answer": 0, "answeredAt": "2025-11-06T14:21:26.697Z", "questionId": "q2"}]	2025-11-06 14:21:25.009	2025-11-06 14:21:27.302	2025-11-06 14:21:25.009
cmhnimmq80002onfoey4nkl00	0	other	started	[]	[]	2025-11-06 14:22:00.813	\N	2025-11-06 14:22:00.813
cmhnix61e0000onh7ugxq2zas	7	other	in_progress	{"ageBand": "6-8", "gradeBand": "grade_3_5"}	[]	2025-11-06 14:30:12.404	\N	2025-11-06 14:30:12.404
cmhnj6uy80000onjizhl9imj7	0	other	started	["q1"]	[{"answer": 3, "answeredAt": "2025-11-06T14:37:46.252Z", "questionId": "q1"}]	2025-11-06 14:37:44.624	\N	2025-11-06 14:37:44.624
cmhnja2om0001onjiwmzw8sxp	0	other	started	[]	[]	2025-11-06 14:40:14.614	\N	2025-11-06 14:40:14.614
cmhnjdx4e0000onbb3n38c19u	0	other	started	[]	[]	2025-11-06 14:43:14.03	\N	2025-11-06 14:43:14.03
cmhnjgfkr0001onbba71kstiq	7	other	in_progress	["hyp_1"]	[{"answer": 3, "answeredAt": "2025-11-06T14:45:19.462Z", "questionId": "hyp_1"}]	2025-11-06 14:45:11.259	\N	2025-11-06 14:45:11.259
cmhnjw4u50000oni8r6weu0at	0	other	completed	["hyp_1", "hyp_2", "hyp_3"]	[{"answer": 3, "answeredAt": "2025-11-06T14:57:31.514Z", "questionId": "hyp_1"}, {"answer": 0, "answeredAt": "2025-11-06T14:57:35.186Z", "questionId": "hyp_2"}, {"answer": 3, "answeredAt": "2025-11-06T14:57:35.775Z", "questionId": "hyp_3"}]	2025-11-06 14:57:23.838	2025-11-06 14:57:39.33	2025-11-06 14:57:23.838
cmhnjhetz0000on4gktifmx44	10	other	completed	["hyp_1", "hyp_2", "hyp_3", "hyp_4", "hyp_5", "emo_1", "emo_2", "emo_3", "emo_4", "emo_5", "att_1", "att_2", "att_3", "att_4", "att_5"]	[{"answer": 0, "answeredAt": "2025-11-06T14:46:04.268Z", "questionId": "hyp_1"}, {"answer": 3, "answeredAt": "2025-11-06T14:46:08.332Z", "questionId": "hyp_2"}, {"answer": 3, "answeredAt": "2025-11-06T14:46:10.903Z", "questionId": "hyp_3"}, {"answer": 3, "answeredAt": "2025-11-06T14:46:12.696Z", "questionId": "hyp_4"}, {"answer": 3, "answeredAt": "2025-11-06T14:46:14.494Z", "questionId": "hyp_5"}, {"answer": 3, "answeredAt": "2025-11-06T14:46:16.141Z", "questionId": "emo_1"}, {"answer": 0, "answeredAt": "2025-11-06T14:46:17.901Z", "questionId": "emo_2"}, {"answer": 0, "answeredAt": "2025-11-06T14:46:19.624Z", "questionId": "emo_3"}, {"answer": 0, "answeredAt": "2025-11-06T14:46:21.113Z", "questionId": "emo_4"}, {"answer": 0, "answeredAt": "2025-11-06T14:46:22.901Z", "questionId": "emo_5"}, {"answer": 3, "answeredAt": "2025-11-06T14:46:24.733Z", "questionId": "att_1"}, {"answer": 3, "answeredAt": "2025-11-06T14:46:26.583Z", "questionId": "att_2"}, {"answer": 3, "answeredAt": "2025-11-06T14:46:28.415Z", "questionId": "att_3"}, {"answer": 3, "answeredAt": "2025-11-06T14:46:30.209Z", "questionId": "att_4"}, {"answer": 3, "answeredAt": "2025-11-06T14:46:32.236Z", "questionId": "att_5"}]	2025-11-06 14:45:56.951	2025-11-06 14:46:33.599	2025-11-06 14:45:56.951
cmhnk20gq0000on31vdtf9qr4	0	other	completed	["hyp_1", "hyp_2", "hyp_3", "hyp_4", "hyp_5", "emo_1", "emo_2", "emo_3", "emo_4", "emo_5", "att_1", "att_2", "att_3", "att_4", "att_5"]	[{"answer": 3, "answeredAt": "2025-11-06T15:01:59.494Z", "questionId": "hyp_1"}, {"answer": 3, "answeredAt": "2025-11-06T15:02:00.050Z", "questionId": "hyp_2"}, {"answer": 3, "answeredAt": "2025-11-06T15:02:00.608Z", "questionId": "hyp_3"}, {"answer": 3, "answeredAt": "2025-11-06T15:02:01.158Z", "questionId": "hyp_4"}, {"answer": 3, "answeredAt": "2025-11-06T15:02:01.701Z", "questionId": "hyp_5"}, {"answer": 3, "answeredAt": "2025-11-06T15:02:02.268Z", "questionId": "emo_1"}, {"answer": 3, "answeredAt": "2025-11-06T15:02:02.807Z", "questionId": "emo_2"}, {"answer": 3, "answeredAt": "2025-11-06T15:02:03.342Z", "questionId": "emo_3"}, {"answer": 3, "answeredAt": "2025-11-06T15:02:03.886Z", "questionId": "emo_4"}, {"answer": 3, "answeredAt": "2025-11-06T15:02:04.453Z", "questionId": "emo_5"}, {"answer": 3, "answeredAt": "2025-11-06T15:02:04.995Z", "questionId": "att_1"}, {"answer": 3, "answeredAt": "2025-11-06T15:02:05.558Z", "questionId": "att_2"}, {"answer": 0, "answeredAt": "2025-11-06T15:02:06.349Z", "questionId": "att_3"}, {"answer": 0, "answeredAt": "2025-11-06T15:02:06.890Z", "questionId": "att_4"}, {"answer": 0, "answeredAt": "2025-11-06T15:02:07.418Z", "questionId": "att_5"}]	2025-11-06 15:01:58.106	2025-11-06 15:02:08.069	2025-11-06 15:01:58.106
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
86e67372-6a63-41b2-b880-69f0770b66e6	30b8db45910090ba9e3d8fbcc2264f393c3a5242383d0dcb18d07d5869d8b719	\N	20250102_affiliate_enhancements	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250102_affiliate_enhancements\n\nDatabase error code: 42P01\n\nDatabase error:\nERROR: relation "AffiliatePayout" does not exist\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P01), message: "relation \\"AffiliatePayout\\" does not exist", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("namespace.c"), line: Some(636), routine: Some("RangeVarGetRelidExtended") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250102_affiliate_enhancements"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250102_affiliate_enhancements"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:260	2025-12-20 19:04:41.965971+00	2025-12-20 19:04:36.197307+00	0
b5f5d8c4-26b5-4981-bebe-1ca03a16d257	30b8db45910090ba9e3d8fbcc2264f393c3a5242383d0dcb18d07d5869d8b719	2025-12-20 19:04:42.101043+00	20250102_affiliate_enhancements		\N	2025-12-20 19:04:42.101043+00	0
0c3a38d4-a7c5-4266-8738-579686668211	1b19a71d4400533d8e7bd910fca473de8bd5a7ec89e01b452b77956cd3c005cb	2025-10-22 01:17:27.235233+00	20250915234902_init	\N	\N	2025-10-22 01:17:26.710702+00	1
f515d3e3-89eb-475a-900d-34767e626b05	1f4a40e80aaa3e3715d61b720bd7cd0b32dee96d0d1fcb5b0b2891c443a329ae	2025-10-22 01:17:31.095493+00	20250930034649_add_super_admin_role	\N	\N	2025-10-22 01:17:30.950997+00	1
d9a6669d-4e29-4f0c-b78a-1f83bc3d89fc	7a7a66bf2b7ce29de262053eb4919084ccea34dd43a3b5f02245f088b1d5c3d3	2025-10-22 01:17:27.692538+00	20250916004030_add_structured_assessment	\N	\N	2025-10-22 01:17:27.291454+00	1
be95235a-def8-4165-b7db-918a96cf66dd	5902e7d073d5649791c63a57d61bdbffeaed83886cdc7ef1556136fc9951e3d2	2025-10-22 01:17:27.94369+00	20250917022732_remove_question_response_foreign_key	\N	\N	2025-10-22 01:17:27.777197+00	1
f11adeb7-9b20-481f-ab38-4373d3dd9dd7	d968bc975b0c663452d83d1761c032abd4b95087d06670547c7e84ae65a4931f	2025-10-22 01:17:33.079663+00	20251004185241_add_onboarding_fields	\N	\N	2025-10-22 01:17:32.934438+00	1
70705318-7875-455f-b854-f61665f6061c	fc060ba15d8cf2f86be404a38cce5a13a96cf870866964b60a42c76ab31a65de	2025-10-22 01:17:28.275484+00	20250917200614_add_clinical_scoring_fields	\N	\N	2025-10-22 01:17:28.000097+00	1
bbe89344-20d8-4805-8e4e-18d0cee5b537	11653618f3da51102fa8f6a288c2dd7a8ca31686c13ae35c531bf365f013467d	2025-10-22 01:17:31.388576+00	20250930034756_add_platform_settings	\N	\N	2025-10-22 01:17:31.152206+00	1
ff2f3a23-2813-480a-8a64-7133ef615531	bd234e7ea947f2415af6a33367e2236177eaf2ead2a243ba6e589b028ae1ffde	2025-10-22 01:17:28.740483+00	20250921144730_add_licensing_system	\N	\N	2025-10-22 01:17:28.33972+00	1
edc3a2ec-cf2d-4316-a76b-213c1410812a	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2025-10-22 01:17:28.955348+00	20250921144839_add_licensing_system	\N	\N	2025-10-22 01:17:28.816461+00	1
204d9630-849d-4f92-9069-c8114a384193	6d324e2d82f6147418eb3698b2ebe731bbda5575134bc40f874e20b9616dbe04	2025-10-22 01:17:29.323264+00	20250923011658_add_recommendations	\N	\N	2025-10-22 01:17:29.041027+00	1
c868ebf8-12ff-4624-961d-65a4a169682a	5c61a2ce0a53346920bfaafbdbc37c097a5ad74ace8988465f491d090c2b8c4b	2025-10-22 01:17:31.592498+00	20251001222426_add_enhanced_report_fields	\N	\N	2025-10-22 01:17:31.444959+00	1
1dfd8825-b5ef-4904-adda-4fcb9790b94d	85dcd9a0cfea7f35be5e8f3d3b39e48b9aed6a0cfa6852840703be3773bc2594	2025-10-22 01:17:29.523432+00	20250923193221_add_optional_short_id_to_assessment	\N	\N	2025-10-22 01:17:29.380532+00	1
128fc9ef-f081-4611-af59-9c6b365ec52c	4858e055f6a7e3c0ab9b1e61a78e554ac41dae77c3d8696e56b63918b121771d	2025-10-22 01:17:29.85599+00	20250924181209_add_shareable_links	\N	\N	2025-10-22 01:17:29.632042+00	1
84362c88-223f-47bf-8bef-e54e18bf3c6e	2815dee7fbcd7750eb9710a9fcb750115b2ccfb0fdc6569c9fa7fb15a4495680	2025-10-22 01:17:30.063358+00	20250925154138_add_payment_model	\N	\N	2025-10-22 01:17:29.91186+00	1
b6a7dd94-c3cd-4b05-96b2-514f9fa8aa72	6bf741947093c77e6af13b3bde2f5c2e14a1ec30426ec969d3aca98573244a52	2025-10-22 01:17:31.888508+00	20251002201018_add_domain_template_to_scores	\N	\N	2025-10-22 01:17:31.652136+00	1
dc5067a8-f44f-4729-a395-4213594845b5	e9defa175735b86bf776b9c8a812d9f095841ece3679a485884c8cf787c2077d	2025-10-22 01:17:30.376231+00	20250929221137_add_assessment_templates	\N	\N	2025-10-22 01:17:30.120158+00	1
6c55341a-bfdb-4ab0-a717-20f0230f4687	9ba6868a68aa3ad488929c71f660ca6fdef34003e84fcc13c2d78369e388c33a	2025-10-22 01:17:30.592582+00	20250929221948_update_assessment_template_fields	\N	\N	2025-10-22 01:17:30.436077+00	1
78829135-65bb-43a5-815e-6a400c1d62e7	2ae0481f7185728d853190f49818b9f3b783c1a1d5001406ce3ac8f23431b38b	2025-10-22 01:17:33.30251+00	20251013000000_add_email_and_pdf_templates	\N	\N	2025-10-22 01:17:33.138839+00	1
08ccb71d-fbf2-42f1-b79f-c9ed189e8581	59f8ec7f3953e6573be3e6f288e8d111663b082cb60e2f8c50a5b38b81a89ea0	2025-10-22 01:17:30.894787+00	20250929223020_add_version_management	\N	\N	2025-10-22 01:17:30.652182+00	1
22af5e89-3479-42ce-a5f1-8a17d5087314	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2025-10-22 01:17:32.095549+00	20251002201032_add_domain_template_to_scores	\N	\N	2025-10-22 01:17:31.947491+00	1
371b8b04-d55b-44e0-9a37-9b4e90443319	65b2b57e75bd90819f531c8b76a9a4c4b2ec79d47055a1919919f33bbb3fe0f3	2025-10-22 01:17:32.307738+00	20251002225843_add_free_license_type	\N	\N	2025-10-22 01:17:32.1531+00	1
ec70ecf9-c15c-4c07-bf44-c24a99b29f97	26d7d9b8edce6a6e8c2927ceb9c5055ee1bbe956318163ec9971c7a738fa94eb	2025-10-22 01:17:32.598636+00	20251003000023_add_login_tokens	\N	\N	2025-10-22 01:17:32.449142+00	1
6d5b1171-0f0a-4f54-a745-ad905381febf	6540129998a29000355994d4e63f2600f35f53ec6bddc82db0c992aa3afcb5ea	2025-10-22 01:17:33.59931+00	20251015114700_add_conversational_report_limits	\N	\N	2025-10-22 01:17:33.360778+00	1
ec14817f-eda4-4b94-8377-a9547740a621	c7cd2fa60b75f576c91fcbc34e61949b65c02958ce50e4d7713560986bf208b0	2025-10-22 01:17:32.811419+00	20251004162105_add_assessment_credits_tracking	\N	\N	2025-10-22 01:17:32.658343+00	1
1877643e-044f-4a05-8f97-9451e2fd1115	2ae0481f7185728d853190f49818b9f3b783c1a1d5001406ce3ac8f23431b38b	2025-10-13 21:50:50.227066+00	20251013000000_add_email_and_pdf_templates		\N	2025-10-13 21:50:50.227066+00	0
a74114f5-c409-496a-b7af-b36817e148e4	7d151f32a5451c060543756789a59bf93f2009f2bd8bfb56f50b50b12b14fb70	\N	20250915234902_init	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250915234902_init\n\nDatabase error code: 42710\n\nDatabase error:\nERROR: type "Role" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42710), message: "type \\"Role\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("typecmds.c"), line: Some(1177), routine: Some("DefineEnum") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250915234902_init"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250915234902_init"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:244	2025-10-14 14:48:52.749809+00	2025-10-14 14:41:43.892994+00	0
e894f35a-3c68-4f8a-9087-f7e036da7042	5d43ab48665e63a712c94f18010c935b7c9461d5fc55ff8edcad9969db72d7e2	2025-10-14 14:48:52.832192+00	20250915234902_init		\N	2025-10-14 14:48:52.832192+00	0
5aae58d4-ec5f-4f86-a6c2-83e863d97abc	7a7a66bf2b7ce29de262053eb4919084ccea34dd43a3b5f02245f088b1d5c3d3	\N	20250916004030_add_structured_assessment	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250916004030_add_structured_assessment\n\nDatabase error code: 42701\n\nDatabase error:\nERROR: column "currentDomain" of relation "assessments" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42701), message: "column \\"currentDomain\\" of relation \\"assessments\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(7478), routine: Some("check_for_column_name_collision") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250916004030_add_structured_assessment"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250916004030_add_structured_assessment"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:244	2025-10-22 21:05:50.97002+00	2025-10-14 14:48:57.173713+00	0
8075eabb-31f2-4baa-8294-f5ac2c7d6a0f	482737168ed7a12771ebec5f138476cba7fce4472dd0473dca704fa069a88c47	\N	20251022000000_add_affiliate_fields	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20251022000000_add_affiliate_fields\n\nDatabase error code: 42703\n\nDatabase error:\nERROR: column "status" does not exist\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42703), message: "column \\"status\\" does not exist", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("indexcmds.c"), line: Some(1888), routine: Some("ComputeIndexAttrs") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20251022000000_add_affiliate_fields"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20251022000000_add_affiliate_fields"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:244	2025-10-22 22:17:06.51762+00	2025-10-22 22:16:53.950764+00	0
6d3899dd-a59a-4cf5-8d9d-6c0cd724966c	73e1482d19b65a013b7b6196d48dbd9a8660dbc09b310c427dc50577e40847d0	2025-10-22 22:17:11.489942+00	20251022000000_add_affiliate_fields	\N	\N	2025-10-22 22:17:11.329369+00	1
3d96f949-da24-4713-b77b-990a7c84b202	ff8ad0e4bb23ef926e0f7b8ca8a8a268f15b0fa8e0cce1c4e2ea3aa3dd875fd7	2025-10-22 22:31:54.446188+00	20251022000001_create_affiliate_tables		\N	2025-10-22 22:31:54.446188+00	0
62024a51-1905-4fc6-b02f-008bd822fa93	1daef3d2fc50616baa95f5c4ab07db5d3fecf751145d1e48214880dbab573a9b	\N	20251026_add_trial_to_full_flow	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20251026_add_trial_to_full_flow\n\nDatabase error code: 42P01\n\nDatabase error:\nERROR: relation "Assessment" does not exist\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P01), message: "relation \\"Assessment\\" does not exist", detail: None, hint: None, position: None, where_: Some("SQL statement \\"ALTER TABLE \\"Assessment\\" ADD COLUMN \\"mode\\" \\"AssessmentMode\\" NOT NULL DEFAULT 'TRIAL'\\"\\nPL/pgSQL function inline_code_block line 3 at SQL statement"), schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("namespace.c"), line: Some(636), routine: Some("RangeVarGetRelidExtended") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20251026_add_trial_to_full_flow"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20251026_add_trial_to_full_flow"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:260	2025-10-26 13:04:38.032116+00	2025-10-26 13:03:58.911894+00	0
4ed2a745-7c50-4b99-9b21-5cdd1291928a	569e8f3dbca97b586ed16770ed61a1c2a52db20340e05a17d3f8a94cf708f9ba	2025-10-26 13:04:42.916986+00	20251026_add_trial_to_full_flow	\N	\N	2025-10-26 13:04:42.640751+00	1
2f4527ed-e6d0-4ba2-92f0-807b43b7e371	0230d6532d55309b1af4dabd5abe52a4d398c8479580037bec19c33c6771e634	\N	20251026_add_avatar_url	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20251026_add_avatar_url\n\nDatabase error code: 42P01\n\nDatabase error:\nERROR: relation "User" does not exist\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P01), message: "relation \\"User\\" does not exist", detail: None, hint: None, position: None, where_: Some("SQL statement \\"ALTER TABLE \\"User\\" ADD COLUMN \\"avatarUrl\\" TEXT\\"\\nPL/pgSQL function inline_code_block line 3 at SQL statement"), schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("namespace.c"), line: Some(636), routine: Some("RangeVarGetRelidExtended") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20251026_add_avatar_url"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20251026_add_avatar_url"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:260	2025-10-26 23:50:32.610825+00	2025-10-26 23:50:25.18885+00	0
0da0db32-13d5-47ea-81a2-1df173a40d3e	ac97e7d37616afb4b3259c46828bab20726d72b5a885389861855e4561108934	2025-10-27 13:43:37.901799+00	20251026_add_email_verified	\N	\N	2025-10-27 13:43:37.695866+00	1
47a6c236-64f2-4384-8b72-ae6883196bfb	7eb8d43afba08c96570148ce0c8e413559409f277cc904efe62f0c5860f94a8c	2025-10-26 23:50:36.721354+00	20251026_add_avatar_url	\N	\N	2025-10-26 23:50:36.506105+00	1
8ec83a02-36bf-4376-a725-2d2a8974ed55	f96407d6633bce44622da0574c71b720b911922b3f5b5f870b984ca281b5e04b	2025-10-27 14:38:55.472367+00	20251026_add_email_verification_columns	\N	\N	2025-10-27 14:38:55.141621+00	1
800f5772-ef91-46cd-878a-9906ac5c4038	f4846b4b14938552ddfefe29fd4e211fe95ab39fc9f41bfdfe24864d6f1a6ada	2025-10-27 15:31:20.930424+00	20251027_add_istrial_to_questions	\N	\N	2025-10-27 15:31:20.748692+00	1
e078af40-11e1-41cb-9308-072320a4d3b6	68c9e860678b23748785d105348942367c9de3f2627eb6bc1b78c471d260fee2	2025-10-27 15:39:29.326024+00	20251027_make_userid_nullable	\N	\N	2025-10-27 15:39:29.124733+00	1
7d51afa1-08bf-46e2-9702-3449a3bfdbbd	fc9fc21f634d079083cbe02c72f5cad010ba4d08174c3fab6b2e4dfa8157eb30	2025-10-27 16:58:23.919333+00	20251027_make_payment_userid_nullable	\N	\N	2025-10-27 16:58:23.719822+00	1
f1635092-2886-46db-ad28-e0a5e0d9018f	d44e7c8cc1dcde2672f4fd4b115fbf3b4d68c7cf73c924b56ef549096bfafdbb	2025-10-28 23:03:22.807905+00	make_recommendation_userid_optional	\N	\N	2025-10-28 23:03:22.589291+00	1
0baa4df2-9d68-420a-9893-43728b58e9d9	c6d3975b8a31c1756e5e0c7c883cdcc8b4df108c5e7b2d98f855f473bc57acf8	\N	20251102000000_enhance_email_templates	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20251102000000_enhance_email_templates\n\nDatabase error code: 42710\n\nDatabase error:\nERROR: type "EmailTemplateType" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42710), message: "type \\"EmailTemplateType\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("typecmds.c"), line: Some(1177), routine: Some("DefineEnum") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20251102000000_enhance_email_templates"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20251102000000_enhance_email_templates"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:260	\N	2025-12-20 19:33:16.769277+00	0
\.


--
-- Data for Name: ai_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_reports (id, "assessmentId", content, summary, "riskLevel", "generatedAt", "generatedByUserId", "reportOptions", "pdfPath", "pdfSize", "emailsSent", "lastAccessedAt", "isArchived") FROM stdin;
\.


--
-- Data for Name: assessment_template_domains; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessment_template_domains (id, "assessmentTemplateId", "domainTemplateId", "order", "isRequired") FROM stdin;
\.


--
-- Data for Name: assessment_template_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessment_template_versions (id, "assessmentTemplateId", version, name, slug, description, instructions, "isActive", "domainSnapshot", "changeDescription", "createdById", "createdAt") FROM stdin;
\.


--
-- Data for Name: assessment_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessment_templates (id, name, slug, description, instructions, "isActive", version, "createdById", "createdAt", "updatedAt") FROM stdin;
cmg618glp0007onv3jnu3ls4i	Parent Behavioral Screening - Trial	parent-behavioral-screening-trial	A comprehensive behavioral screening assessment for parents to evaluate their child's attention, hyperactivity, and emotional regulation. This trial version provides an overview of key behavioral indicators.	Please answer each question based on your child's behavior over the past 6 months. Select the option that best describes how often these behaviors occur.	t	5	7a79e16b-242f-4a34-b660-45d76273807a	2025-09-30 04:03:18.925	2025-10-27 16:28:16.328
cmg5sg6y90001ono4fmcyzb70	Mental Health Screening Assessment	mental-health-screening-assessment	Comprehensive mental health screening assessment covering multiple psychological domains including mood, anxiety, substance use, and personality disorders.		t	1	7a79e16b-242f-4a34-b660-45d76273807a	2025-09-29 23:57:23.121	2025-10-28 15:05:59.003
\.


--
-- Data for Name: assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessments (id, "userId", "subjectName", status, mode, "sessionId", "startedAt", "completedAt", "paidAt", "currentDomain", "currentQuestionOrder", "shortId", "assessmentTemplateId", "isConversational", "hasEnhancedReport", "enhancedReportPurchasedAt", "aiReportGenerated", "childResponses", "enhancedAnalysis", childprofileid, "affiliateRefCode") FROM stdin;
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_messages (id, "assessmentId", "sessionId", role, content, sources, "timestamp") FROM stdin;
\.


--
-- Data for Name: chat_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_sessions (id, title, type, "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: child_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.child_profiles (id, userid, name, birthdate, gradeband, createdat, updatedat) FROM stdin;
a300a996-51c5-4fce-bb63-3fafaf457761	7a79e16b-242f-4a34-b660-45d76273807a	Jack	\N	\N	2025-10-22 19:28:51.276	2025-10-22 19:28:51.276
\.


--
-- Data for Name: classrooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.classrooms (id, "schoolId", name, "gradeLevel", "isActive", "createdAt", "updatedAt") FROM stdin;
cmjeoakwt0006onzs345rnna6	cmjeoaksf0004onzsiawkc7c4	Lincoln Elementary - Grade K	K	t	2025-12-20 19:10:05.406	2025-12-20 19:10:05.406
cmjeoal3l0008onzsrk96gxwt	cmjeoaksf0004onzsiawkc7c4	Lincoln Elementary - Grade 1	1	t	2025-12-20 19:10:05.65	2025-12-20 19:10:05.65
cmjeoal85000aonzs28pgcxbb	cmjeoaksf0004onzsiawkc7c4	Lincoln Elementary - Grade 2	2	t	2025-12-20 19:10:05.813	2025-12-20 19:10:05.813
cmjeoalcs000conzszvlzy6fh	cmjeoaksf0004onzsiawkc7c4	Lincoln Elementary - Grade 3	3	t	2025-12-20 19:10:05.981	2025-12-20 19:10:05.981
cmjeoaljk000eonzsryvu7h4c	cmjeoaksf0004onzsiawkc7c4	Lincoln Elementary - Grade 4	4	t	2025-12-20 19:10:06.225	2025-12-20 19:10:06.225
cmjeoalon000gonzsfbaqpv3n	cmjeoaksf0004onzsiawkc7c4	Lincoln Elementary - Grade 5	5	t	2025-12-20 19:10:06.407	2025-12-20 19:10:06.407
cmjeoam4a000konzsvf638ffv	cmjeoam03000ionzsop375qg2	Washington Middle School - Grade 6	6	t	2025-12-20 19:10:06.971	2025-12-20 19:10:06.971
cmjeoamaf000monzszxzzqxa1	cmjeoam03000ionzsop375qg2	Washington Middle School - Grade 7	7	t	2025-12-20 19:10:07.192	2025-12-20 19:10:07.192
cmjeoames000oonzsblvermj1	cmjeoam03000ionzsop375qg2	Washington Middle School - Grade 8	8	t	2025-12-20 19:10:07.349	2025-12-20 19:10:07.349
cmjeoamug000sonzsyzgq8mp6	cmjeoampv000qonzst17h16qn	Jefferson High School - Grade 9	9	t	2025-12-20 19:10:07.913	2025-12-20 19:10:07.913
cmjeoamyk000uonzsxzrp21v8	cmjeoampv000qonzst17h16qn	Jefferson High School - Grade 10	10	t	2025-12-20 19:10:08.06	2025-12-20 19:10:08.06
cmjeoan59000wonzs035jm4zz	cmjeoampv000qonzst17h16qn	Jefferson High School - Grade 11	11	t	2025-12-20 19:10:08.301	2025-12-20 19:10:08.301
cmjeoan9p000yonzsc3zablej	cmjeoampv000qonzst17h16qn	Jefferson High School - Grade 12	12	t	2025-12-20 19:10:08.461	2025-12-20 19:10:08.461
\.


--
-- Data for Name: conversational_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversational_sessions (id, "assessmentId", "userId", "currentQuestionIndex", responses, messages, "isComplete", "isTrial", questions, "totalTokenUsage", "clarificationAttempts", "lastSubmittedAt", "submissionCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: conversational_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversational_submissions (id, "sessionId", "questionId", "questionIndex", "userResponse", "extractedAnswer", confidence, "wasRecorded", "tokenUsage", "submittedAt") FROM stdin;
\.


--
-- Data for Name: district_audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.district_audit_logs (id, "districtId", "studentId", "userId", action, "resourceId", metadata, "ipAddress", "createdAt") FROM stdin;
\.


--
-- Data for Name: districts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.districts (id, name, code, "organizationId", "isActive", "ferpaComplianceDate", settings, "createdAt", "updatedAt") FROM stdin;
cmjeoakhr0002onzs7p8vf7p1	Demo Unified School District	DEMO-001	cmjeoak8u0000onzshk0xg7km	t	2025-12-20 19:10:04.861	{"retentionDays": 365, "requireConsent": true, "enableAnonymousMode": true}	2025-12-20 19:10:04.863	2025-12-20 19:10:04.863
\.


--
-- Data for Name: document_chunks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_chunks (id, title, content, category, "chunkIndex", embedding, "documentId", "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, title, "fileName", "fileType", "fileSize", category, content, "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: domain_template_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.domain_template_versions (id, "domainTemplateId", version, name, slug, description, questions, resources, "scoringConfig", "changeDescription", "createdById", "createdAt") FROM stdin;
\.


--
-- Data for Name: domain_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.domain_templates (id, name, slug, description, questions, resources, "scoringConfig", version, "createdById", "createdAt", "updatedAt") FROM stdin;
cmg5q2jhk0005oniqh9l1zdcm	Attention Issues	attention-issues	Evaluates focus problems, hyperactivity, and impulsivity	[{"id": "attention_1", "text": "Do you have trouble paying attention to details?", "order": 1, "weight": 1, "isGatingQuestion": true}, {"id": "attention_2", "text": "Do you often get distracted during tasks?", "order": 2, "weight": 1, "isGatingQuestion": false}, {"id": "attention_3", "text": "Do you have difficulty organizing tasks and activities?", "order": 3, "weight": 1, "isGatingQuestion": false}]	null	{"maxScore": 3, "riskLevels": {"low": {"max": 1, "min": 0}, "high": {"max": 3, "min": 3}, "moderate": {"max": 2, "min": 2}}}	1	7a79e16b-242f-4a34-b660-45d76273807a	2025-09-29 22:50:46.952	2025-09-29 22:50:46.952
cmg5q2jhn0009oniq6kavnl3t	Conduct Problems	conduct-problems	Evaluates rule-breaking behavior, defiance, and authority issues	[{"id": "conduct_1", "text": "Do you often break rules or ignore instructions?", "order": 1, "weight": 1, "isGatingQuestion": true}, {"id": "conduct_2", "text": "Do you frequently argue with authority figures?", "order": 2, "weight": 1, "isGatingQuestion": false}]	null	{"maxScore": 2, "riskLevels": {"low": {"max": 0, "min": 0}, "high": {"max": 2, "min": 2}, "moderate": {"max": 1, "min": 1}}}	1	7a79e16b-242f-4a34-b660-45d76273807a	2025-09-29 22:50:46.956	2025-09-29 22:50:46.956
cmg5rj5v70003onvla8aw5c30	Test Domain	test-domain	A test domain	[{"id": "test_1", "text": "This is a test question", "order": 1, "weight": 1}]	[]	{"maxScore": 5, "riskLevels": {"low": {"max": 2, "min": 0}, "high": {"max": 5, "min": 5}, "moderate": {"max": 4, "min": 3}}, "significantScore": 3}	1	7a79e16b-242f-4a34-b660-45d76273807a	2025-09-29 23:31:42.067	2025-09-29 23:31:42.067
cmg5sg6yw000vono4wt98gqma	Substance Misuse	substance-misuse	Evaluates problematic substance use patterns and potential substance use disorders.	[{"id": "substance_screening", "text": "Do you drink alcohol, vape/smoke nicotine, use marijuana or other THC products, use inhalants, hallucinogens, or amphetamines, take pills not prescribed to you, or use any other kind of substance recreationally?", "order": 1, "weight": 1, "skipLogic": {"skipToNextDomain": "NO"}, "isGatingQuestion": true}, {"id": "substance_1", "text": "Over your time using this substance, have you used it in larger amounts or over longer periods of time than you planned?", "order": 2, "weight": 1, "isGatingQuestion": false}, {"id": "substance_2", "text": "Have you wanted to or tried to stop or lessen your use of these substances and been unsuccessful?", "order": 3, "weight": 1, "isGatingQuestion": false}, {"id": "substance_3", "text": "Have you spent a great deal of time doing things to get these substances, use these substances, or recover from the effects of these substances?", "order": 4, "weight": 1, "isGatingQuestion": false}, {"id": "substance_4", "text": "Do you get strong cravings to use the substance?", "order": 5, "weight": 1, "isGatingQuestion": false}, {"id": "substance_5", "text": "Have you failed to meet certain responsibilities because of using this substance, for example forgetting to do chores, homework, work?", "order": 6, "weight": 1, "isGatingQuestion": false}, {"id": "substance_6", "text": "Have you continued using this substance despite it causing problems with friends, family, or meeting your responsibilities?", "order": 7, "weight": 1, "isGatingQuestion": false}, {"id": "substance_7", "text": "Have you given up, skipped out on, or left early from, or temporarily stepped away from important social, work, or fun activities to use the substance?", "order": 8, "weight": 1, "isGatingQuestion": false}, {"id": "substance_8", "text": "Have you used the substance in situations that are physically dangerous, for example while driving a car or riding with someone else while you were both under the influence?", "order": 9, "weight": 1, "isGatingQuestion": false}, {"id": "substance_9", "text": "Have you continued to use the substance despite knowing that it was having a negative effect on you?", "order": 10, "weight": 1, "isGatingQuestion": false}, {"id": "substance_10", "text": "Have you needed to use larger amounts of the substance to get the same effect, or noticed that the normal amount you use does not give you the same effect it once did?", "order": 11, "weight": 1, "isGatingQuestion": false}, {"id": "substance_11", "text": "Have you experienced any unpleasant feelings when you cannot use the substance, such as headaches, nausea, sweating, shaking, getting chilled, or have you used the substance to relieve or avoid these feelings?", "order": 12, "weight": 1, "isGatingQuestion": false}]	[{"url": null, "title": "Substance Use Disorder Information", "category": "information", "description": "Substance Use Disorders involve a problematic and increasing use of drugs, including alcohol. The user experiences an inability to stop, and often needs to increase their use to get the same effect."}]	{"maxScore": 11, "riskLevels": {"low": {"max": 1, "min": 0}, "high": {"max": 11, "min": 6}, "moderate": {"max": 5, "min": 2}}, "significantScore": 2}	1	7a79e16b-242f-4a34-b660-45d76273807a	2025-09-29 23:57:23.144	2025-09-29 23:57:23.144
cmg5sg6yy000zono4sc1awazj	Antisocial Personality	antisocial-personality	Evaluates patterns of disregard for and violation of the rights of others, assessed from age 15 and above.	[{"id": "aspd_age_check", "text": "Are you 15 years old or older?", "order": 1, "weight": 0, "isTrial": false, "skipLogic": {"skipToNextDomain": "NO"}, "isGatingQuestion": true}, {"id": "aspd_childhood_1", "text": "Before you were 15 years old, did you repeatedly skip school or run away from home overnight?", "order": 2, "weight": 1, "isTrial": false, "category": "childhood", "isGatingQuestion": false}, {"id": "aspd_childhood_2", "text": "Before you were 15 years old, did you repeatedly lie, cheat, 'con' others, or steal?", "order": 3, "weight": 1, "isTrial": false, "category": "childhood", "isGatingQuestion": false}, {"id": "aspd_childhood_3", "text": "Before you were 15 years old, did you start fights or bully, threaten, or intimidate others?", "order": 4, "weight": 1, "isTrial": false, "category": "childhood", "isGatingQuestion": false}, {"id": "aspd_childhood_4", "text": "Before you were 15 years old, did you purposefully destroy things or set fires?", "order": 5, "weight": 1, "isTrial": false, "category": "childhood", "isGatingQuestion": false}, {"id": "aspd_childhood_5", "text": "Before you were 15 years old, did you purposefully hurt animals or people?", "order": 6, "weight": 1, "isTrial": false, "category": "childhood", "isGatingQuestion": false}, {"id": "aspd_childhood_6", "text": "Before you were 15 years old, did you force someone to engage in sexual activity with you?", "order": 7, "weight": 1, "isTrial": false, "category": "childhood", "skipLogic": {"note": "If less than 2 childhood questions are YES, skip to next module", "skipToNextDomain": "LESS_THAN_TWO_YES"}, "isGatingQuestion": false}, {"id": "aspd_adult_1", "text": "Since you were 15 years old, have you repeatedly behaved in a way that others would consider irresponsible, like failing to pay for things you owed, deliberately being impulsive or deliberately not working to support yourself?", "order": 8, "weight": 1, "isTrial": false, "category": "adult", "isGatingQuestion": false}, {"id": "aspd_adult_2", "text": "Since you were 15 years old, have you done things that are illegal (for example, destroying property, shoplifting, stealing, selling drugs, or committing a felony)?", "order": 9, "weight": 1, "isTrial": false, "category": "adult", "isGatingQuestion": false}, {"id": "aspd_adult_3", "text": "Since you were 15 years old, have you been in physical fights repeatedly (including physical fights with friends or family)?", "order": 10, "weight": 1, "isTrial": false, "category": "adult", "isGatingQuestion": false}, {"id": "aspd_adult_4", "text": "Since you were 15 years old, have you often lied or tricked other people to get money or pleasure, or lied just for fun?", "order": 11, "weight": 1, "isTrial": false, "category": "adult", "isGatingQuestion": false}, {"id": "aspd_adult_5", "text": "Since you were 15 years old, have you exposed others to danger without caring?", "order": 12, "weight": 1, "isTrial": false, "category": "adult", "isGatingQuestion": false}, {"id": "aspd_adult_6", "text": "Since you were 15 years old, have you felt no guilt after hurting, mistreating, lying to, or stealing from others, or after damaging property?", "order": 13, "weight": 1, "isTrial": false, "category": "adult", "isGatingQuestion": false}]	[{"url": null, "title": "Antisocial Personality Information", "category": "information", "description": "Antisocial Personality Disorder cannot be officially diagnosed until an individual is 18 years of age; however, the patterns of behavior characteristic of this disorder emerge long before then."}]	{"maxScore": 12, "riskLevels": {"low": {"max": 4, "min": 0}, "high": {"max": 12, "min": 8}, "moderate": {"max": 7, "min": 5}}, "specialScoring": {"note": "Requires 2+ childhood criteria AND 3+ adult criteria for significant score", "requiresAdult": 3, "requiresChildhood": 2}, "significantScore": 5}	1	7a79e16b-242f-4a34-b660-45d76273807a	2025-09-29 23:57:23.146	2025-09-29 23:57:23.146
cmg618glk0001onv3p2k8h3rc	Attention & Focus	attention-focus	Assesses attention, focus, and concentration difficulties	[{"id": "att_1", "text": "Does your child have difficulty paying attention to details or make careless mistakes in schoolwork, work, or other activities?", "type": "LIKERT_5", "order": 1, "weight": 1, "isTrial": false, "options": [], "required": true}, {"id": "att_2", "text": "Does your child have trouble staying focused on tasks or activities (like homework, chores, or playing)?", "type": "LIKERT_5", "order": 1, "weight": 1, "isTrial": false, "options": [], "required": true}, {"id": "att_3", "text": "Does your child seem to not listen when spoken to directly?", "type": "LIKERT_5", "order": 2, "weight": 1, "isTrial": false, "options": [], "required": true}, {"id": "att_4", "text": "Does your child fail to follow through on instructions and fail to finish schoolwork or chores?", "type": "LIKERT_5", "order": 3, "weight": 1, "isTrial": false, "options": [], "required": true}, {"id": "att_5", "text": "Does your child have difficulty organizing tasks and activities?", "type": "LIKERT_5", "order": 4, "weight": 1, "isTrial": false, "options": [], "required": true}]	[]	{"riskLevels": {"low": {"max": 4, "min": 0, "color": "#22c55e", "label": "Low Risk"}, "high": {"max": 11, "min": 8, "color": "#f97316", "label": "High Risk"}, "moderate": {"max": 7, "min": 5, "color": "#eab308", "label": "Moderate Risk"}, "veryHigh": {"max": 15, "min": 12, "color": "#ef4444", "label": "Very High Risk"}}, "totalPossibleScore": 15, "clinicallySignificantScore": 8}	1	7a79e16b-242f-4a34-b660-45d76273807a	2025-09-30 04:03:18.921	2025-10-27 16:24:14.398
cmg5sg6yu000rono4b2cbzkdc	Social Anxiety	social-anxiety	Evaluates fear and anxiety in social situations where judgment by others is possible.	[{"id": "social_1", "text": "Do you feel afraid or anxious about one or more social situations? For instance, talking to others, meeting new people, eating in public, or giving a speech?", "order": 1, "weight": 1, "isTrial": false, "skipLogic": {"skipToNextDomain": "NO"}, "isGatingQuestion": true}, {"id": "social_2", "text": "Is this feeling present even when the situation involves only your peers?", "order": 2, "weight": 1, "isTrial": false, "skipLogic": {"skipToNextDomain": "NO"}, "isGatingQuestion": true}, {"id": "social_3", "text": "Do you fear you will act in a way that others will judge you for in these situations?", "order": 3, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "social_4", "text": "Do these social situations almost always provoke fear or anxiety?", "order": 4, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "social_5", "text": "In these social situations, do you shrink away, freeze, stammer, cry, have difficulty talking, or become completely silent?", "order": 5, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "social_6", "text": "Do you feel so afraid or anxious in these social situations that you try to avoid them or suffer through them when you can't avoid them?", "order": 6, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "social_7", "text": "Would others consider this fear or anxiety excessive or unreasonable?", "order": 7, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "social_8", "text": "Do these fears make your social life hard, cause you a lot of distress, or affect your ability/desire to go to school, go out in public, make friends, or make/keep plans with friends?", "order": 8, "weight": 1, "isTrial": false, "skipLogic": {"note": "If 3 items are coded as NO (excluding items 1 and 2), discontinue screening", "skipToNextDomain": "THREE_NO_ANSWERS"}, "isGatingQuestion": false}]	[{"url": null, "title": "Social Anxiety Information", "category": "information", "description": "Social Anxiety involves excessive anxiety and fear in social situations where the sufferer may be negatively evaluated by others."}]	{"maxScore": 8, "riskLevels": {"low": {"max": 5, "min": 0}, "high": {"max": 8, "min": 8}, "moderate": {"max": 7, "min": 6}}, "significantScore": 6}	1	7a79e16b-242f-4a34-b660-45d76273807a	2025-09-29 23:57:23.142	2025-09-29 23:57:23.142
cmg5sg6ys000nono45ie242p2	Generalized Anxiety	generalized-anxiety	Evaluates excessive worry and anxiety symptoms that interfere with daily functioning.	[{"id": "gad_1", "text": "Over the past 6 months, have you felt very worried or anxious about many things?", "order": 1, "weight": 1, "isTrial": false, "isGatingQuestion": true}, {"id": "gad_2", "text": "Are these worries present almost every day?", "order": 2, "weight": 1, "isTrial": false, "isGatingQuestion": true}, {"id": "gad_3", "text": "Is it hard to stop your worries or does worrying make it hard to focus on tasks?", "order": 3, "weight": 1, "isTrial": false, "skipLogic": {"requiresAny": ["gad_1", "gad_2", "gad_3"], "skipToNextDomain": "NO"}, "isGatingQuestion": true}, {"id": "gad_4", "text": "Over the past 6 months, when you were anxious, did you feel restless, excited, or on edge?", "order": 4, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "gad_5", "text": "Over the past 6 months, when you were anxious, did you feel tense?", "order": 5, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "gad_6", "text": "Over the past 6 months, when you were anxious, did you feel tired, weak, or easily exhausted?", "order": 6, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "gad_7", "text": "Over the past 6 months, when you were anxious, did you have trouble concentrating or find your mind going blank?", "order": 7, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "gad_8", "text": "Over the past 6 months, when you were anxious, did you feel irritated?", "order": 8, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "gad_9", "text": "Over the past 6 months, when you were anxious, did you have trouble falling asleep, staying asleep, or waking up in the night or early morning, or sleeping much more than usual?", "order": 9, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "gad_10", "text": "Over the past 6 months, when you were anxious, did you feel nauseous more than normal?", "order": 10, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "gad_11", "text": "Over the past 6 months, when you were anxious, did you have recurring headaches?", "order": 11, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "gad_12", "text": "Over the past 6 months, when you were anxious, did you expect the worst of something without reason?", "order": 12, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "gad_13", "text": "Over the past 6 months, when you were anxious, did you become easily upset or feel easily overwhelmed by things that wouldn't upset or overwhelm others?", "order": 13, "weight": 1, "isTrial": false, "isGatingQuestion": false}]	[{"url": null, "title": "Generalized Anxiety Information", "category": "information", "description": "Generalized Anxiety involves excessive worrying about a wide range of topics and can be very distressing to those suffering from it."}]	{"maxScore": 13, "riskLevels": {"low": {"max": 4, "min": 0}, "high": {"max": 13, "min": 9}, "moderate": {"max": 8, "min": 5}}, "significantScore": 5}	1	7a79e16b-242f-4a34-b660-45d76273807a	2025-09-29 23:57:23.14	2025-09-29 23:57:23.14
cmg618gln0003onv33rc6oe0t	Hyperactivity & Impulsivity	hyperactivity-impulsivity	Assesses hyperactive and impulsive behaviors	[{"id": "hyp_1", "text": "Does your child fidget with or tap hands or feet, or squirm in seat?", "type": "LIKERT_5", "order": 100, "weight": 1, "isTrial": true, "options": [], "required": true}, {"id": "hyp_2", "text": "Does your child leave their seat when remaining seated is expected?", "type": "LIKERT_5", "order": 101, "weight": 1, "isTrial": true, "options": [], "required": true}, {"id": "hyp_3", "text": "Does your child run or climb excessively when it's inappropriate?", "type": "LIKERT_5", "order": 102, "weight": 1, "isTrial": true, "options": [], "required": true}, {"id": "hyp_4", "text": "Does your child have difficulty playing or engaging in activities quietly?", "type": "LIKERT_5", "order": 103, "weight": 1, "isTrial": true, "options": [], "required": true}, {"id": "hyp_5", "text": "Does your child blurt out answers before questions have been completed?", "type": "LIKERT_5", "order": 104, "weight": 1, "isTrial": true, "options": [], "required": true}]	[]	{"riskLevels": {"low": {"max": 4, "min": 0, "color": "#22c55e", "label": "Low Risk"}, "high": {"max": 11, "min": 8, "color": "#f97316", "label": "High Risk"}, "moderate": {"max": 7, "min": 5, "color": "#eab308", "label": "Moderate Risk"}, "veryHigh": {"max": 15, "min": 12, "color": "#ef4444", "label": "Very High Risk"}}, "totalPossibleScore": 15, "clinicallySignificantScore": 8}	1	7a79e16b-242f-4a34-b660-45d76273807a	2025-09-30 04:03:18.923	2025-10-27 16:38:20.619
cmg5sg6yo000jono4wzipey7j	Panic	panic	Evaluates panic attacks and panic disorder symptoms including physical and psychological manifestations.	[{"id": "panic_1", "text": "Have you ever had more than one instance where you had a sudden and intense surge of fear, panic, anxiety, or discomfort?", "order": 1, "weight": 1, "isTrial": false, "skipLogic": {"skipToNextDomain": "NO"}, "isGatingQuestion": true}, {"id": "panic_2", "text": "Did this spell reach its worst point within only a matter of minutes before subsiding on its own or with the help of someone else?", "order": 2, "weight": 1, "isTrial": false, "skipLogic": {"skipToNextDomain": "NO"}, "isGatingQuestion": true}, {"id": "panic_3", "text": "During these spells, do you experience pounding or rapid heartbeat?", "order": 3, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "panic_4", "text": "During these spells, do you experience sweating?", "order": 4, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "panic_5", "text": "During these spells, do you experience trembling or shaking?", "order": 5, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "panic_6", "text": "During these spells, do you experience shortness of breath or a smothering sensation?", "order": 6, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "panic_7", "text": "During these spells, do you experience feelings of choking?", "order": 7, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "panic_8", "text": "During these spells, do you experience pain or discomfort in your chest?", "order": 8, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "panic_9", "text": "During these spells, do you experience nausea, stomach pain, or diarrhea?", "order": 9, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "panic_10", "text": "During these spells, do you feel dizzy, faint, lightheaded, or like the room was spinning?", "order": 10, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "panic_11", "text": "During these spells, do you experience changes in temperature so that you felt hot or chilled?", "order": 11, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "panic_12", "text": "During these spells, do you experience tingling or numbness in any part of your body?", "order": 12, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "panic_13", "text": "During these spells, do you feel like the world around you was strange or unreal, or that you were not yourself or were outside of yourself?", "order": 13, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "panic_14", "text": "During these spells, do you fear that you were losing control or maybe even going crazy?", "order": 14, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "panic_15", "text": "During these spells, do you fear that you were dying or might die?", "order": 15, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "panic_16", "text": "In the one month that followed the panic attack, did you have a persistent concern or worry about having another attack or significantly change your behavior to avoid having another attack?", "order": 16, "weight": 1, "isTrial": false, "isGatingQuestion": false}]	[{"url": null, "title": "Panic Disorder Information", "category": "information", "description": "The Panic screen asks questions related to Panic Attacks and Panic Disorder. Panic attacks can occur within the context of other disorders, such as Anxiety, Depression, and PTSD."}]	{"maxScore": 16, "riskLevels": {"low": {"max": 4, "min": 0}, "high": {"max": 16, "min": 10}, "moderate": {"max": 9, "min": 5}}, "significantScore": 5}	1	7a79e16b-242f-4a34-b660-45d76273807a	2025-09-29 23:57:23.136	2025-09-29 23:57:23.136
cmg5sg6ym000fono4qp8ewnkj	Self-Harm	self-harm	Evaluates non-suicidal self-injury thoughts and behaviors.	[{"id": "selfharm_1", "text": "Have you ever wanted to do anything to hurt, but not kill, yourself?", "order": 1, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "selfharm_2", "text": "Have you ever had any thoughts about hurting, but not killing, yourself?", "order": 2, "weight": 1, "isTrial": false, "skipLogic": {"condition": "NO", "skipToQuestion": "selfharm_7"}, "isGatingQuestion": true}, {"id": "selfharm_3", "text": "Have you been thinking about how you might hurt, but not kill, yourself?", "order": 3, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "selfharm_4", "text": "Have you had these thoughts and some intention of acting on them?", "order": 4, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "selfharm_5", "text": "Have you considered or do you have a plan to hurt, but not kill, yourself?", "order": 5, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "selfharm_6", "text": "Do you intend to carry out this plan?", "order": 6, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "selfharm_7", "text": "Have you done, started to do, or prepared to do something to hurt but not kill yourself?", "order": 7, "weight": 1, "isTrial": false, "isGatingQuestion": false}]	[{"url": null, "title": "Self-Harm Information", "category": "information", "description": "The Self-Harm Screen asks questions related to Self Harm thoughts and behaviors. While not designed to diagnose Nonsuicidal Self-Injury Disorder, endorsement of these criteria could signal the presence of a current or emerging problem."}]	{"maxScore": 7, "riskLevels": {"low": {"max": 2, "min": 0}, "high": {"max": 7, "min": 5}, "moderate": {"max": 4, "min": 3}}, "significantScore": 3}	1	7a79e16b-242f-4a34-b660-45d76273807a	2025-09-29 23:57:23.134	2025-09-29 23:57:23.134
cmg5sg6yj000bono4eqpdik02	Suicidality	suicidality	Evaluates suicidal thoughts and behaviors with appropriate safety protocols.	[{"id": "suicidality_1", "text": "Have you ever wanted to be dead or wished you just weren't here anymore?", "order": 1, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "suicidality_2", "text": "Have you ever had any thoughts about ending your life?", "order": 2, "weight": 1, "isTrial": false, "skipLogic": {"condition": "NO", "skipToQuestion": "suicidality_7"}, "isGatingQuestion": true}, {"id": "suicidality_3", "text": "Have you been thinking about how you might end your life?", "order": 3, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "suicidality_4", "text": "Have you had these thoughts and had some intention of acting on them?", "order": 4, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "suicidality_5", "text": "Have you considered a plan or the details for ending your life?", "order": 5, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "suicidality_6", "text": "Do you intend to carry out this plan?", "order": 6, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "suicidality_7", "text": "Have you done, started to do, or prepared to do something to end your life?", "order": 7, "weight": 1, "isTrial": false, "isGatingQuestion": false}]	[{"url": null, "title": "Suicide Prevention Resources", "category": "crisis", "description": "If you are having thoughts of suicide or are engaging in actions to commit suicide, you should reach out to your Primary Care Provider or a mental health professional immediately."}, {"url": null, "title": "Crisis Hotlines", "category": "crisis", "description": "Numbers like 9-1-1, and 9-8-8 can be used in suicidal or crisis situations in which self-injury or death are a possibility."}]	{"maxScore": 7, "riskLevels": {"low": {"max": 2, "min": 0}, "high": {"max": 7, "min": 5}, "moderate": {"max": 4, "min": 3}}, "significantScore": 3}	1	7a79e16b-242f-4a34-b660-45d76273807a	2025-09-29 23:57:23.132	2025-09-29 23:57:23.132
cmg5sg6yh0007ono4l9zxodw5	Mania	mania	Evaluates symptoms related to Mania and Hypomania including elevated mood, energy, and impulsive behaviors.	[{"id": "mania_1", "text": "Have you ever had a period of time, lasting a few days or more, where you felt so full of energy or ideas that you couldn't settle down and got in trouble, or found it very hard to sleep at night?", "order": 1, "weight": 1, "isTrial": false, "isGatingQuestion": true}, {"id": "mania_2", "text": "Have you ever had a period of time, lasting a few days or more, where you felt so irritable and short-tempered that you got into arguments or fights with others?", "order": 2, "weight": 1, "isTrial": false, "skipLogic": {"requiresBoth": ["mania_1", "mania_2"], "skipToNextDomain": "NO"}, "isGatingQuestion": true}, {"id": "mania_3", "text": "During that time, did you feel much more confident or self-important than usual, or believe you were much more important than others?", "order": 3, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "mania_4", "text": "During that time, did you need much less sleep than usual and still feel rested?", "order": 4, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "mania_5", "text": "During that time, did you talk much more than usual, or so fast that others could keep up?", "order": 5, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "mania_6", "text": "During that time, did you have racing thoughts?", "order": 6, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "mania_7", "text": "During that time, were you much more easily distracted than normal?", "order": 7, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "mania_8", "text": "During that time, were you much more active or restless than usual?", "order": 8, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "mania_9", "text": "During that time, did you want to do fun things so much that you ignored the risks?", "order": 9, "weight": 1, "isTrial": false, "isGatingQuestion": false}]	[{"url": null, "title": "Mania Information", "category": "information", "description": "The Mania screen asks questions related to Mania and Hypomania. While not designed to diagnose either, endorsement of these criteria could signal the presence of a current or emerging problem in this domain."}]	{"maxScore": 9, "riskLevels": {"low": {"max": 3, "min": 0}, "high": {"max": 9, "min": 7}, "moderate": {"max": 6, "min": 4}}, "significantScore": 4}	1	7a79e16b-242f-4a34-b660-45d76273807a	2025-09-29 23:57:23.13	2025-09-29 23:57:23.13
cmg5sg6yc0003ono4sd4zg9kr	Depression	depression	Evaluates symptoms related to Major Depressive Disorder including mood, sleep, appetite, and cognitive changes.	[{"id": "depression_1", "text": "Have you ever had a time in your life (including now) where you felt depressed or sad most of the day, every day, for nearly two weeks or more?", "order": 1, "weight": 1, "isTrial": false, "skipLogic": {"skipToNextDomain": "NO"}, "isGatingQuestion": true}, {"id": "depression_2", "text": "During that time, were you much hungrier or much less hungry nearly every day so that you gained or lost weight?", "order": 2, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "depression_3", "text": "During that time, did you experience changes in your sleep, for example, trouble falling or staying asleep nearly every night, waking up much earlier than usual, or sleeping much more nearly every day?", "order": 3, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "depression_4", "text": "During that time, did you talk or walk more slowly nearly every day?", "order": 4, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "depression_5", "text": "During that time, were you more fidgety, restless, or have difficulty sitting still nearly every day?", "order": 5, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "depression_6", "text": "During that time, did you feel much more tired nearly every day?", "order": 6, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "depression_7", "text": "During that time, did you have trouble paying attention or making decisions nearly every day?", "order": 7, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "depression_8", "text": "During that time, did you feel much more irritable, easily frustrated, upset, or short-tempered nearly every day- maybe even to the point where you got into arguments or fights with others?", "order": 8, "weight": 1, "isTrial": false, "isGatingQuestion": false}, {"id": "depression_9", "text": "During that time, did you feel so unhappy that you didn't want to do anything, or stopped doing things you enjoyed?", "order": 9, "weight": 1, "isTrial": false, "isGatingQuestion": false}]	[{"url": null, "title": "Depression Information", "category": "information", "description": "The Depression Screen asks questions related to Major Depressive Disorder. While not designed to diagnose Major Depressive Disorder or to provide a full risk assessment for the disorder, endorsement of these criteria could signal the presence of a current or emerging problem in this domain."}, {"url": null, "title": "Crisis Resources", "category": "crisis", "description": "If you are having thoughts of suicide or self-harm, you should reach out to your Primary Care Provider or a mental health professional. Additionally, numbers like 9-1-1, and 9-8-8 can be used in suicidal or crisis situations."}]	{"maxScore": 9, "riskLevels": {"low": {"max": 3, "min": 0}, "high": {"max": 9, "min": 7}, "moderate": {"max": 6, "min": 4}}, "significantScore": 4}	1	7a79e16b-242f-4a34-b660-45d76273807a	2025-09-29 23:57:23.125	2025-09-29 23:57:23.125
cmg618glo0005onv33doolaka	Emotional Regulation	emotional-regulation	Assesses emotional regulation and mood-related challenges	[{"id": "emo_1", "text": "Does your child have frequent temper outbursts or angry episodes?", "type": "LIKERT_5", "order": 200, "weight": 1, "isTrial": true, "options": [], "required": true}, {"id": "emo_2", "text": "Does your child seem sad, depressed, or unhappy most of the time?", "type": "LIKERT_5", "order": 201, "weight": 1, "isTrial": true, "options": [], "required": true}, {"id": "emo_3", "text": "Does your child worry excessively about many things?", "type": "LIKERT_5", "order": 202, "weight": 1, "isTrial": true, "options": [], "required": true}, {"id": "emo_4", "text": "Does your child have difficulty calming down when upset?", "type": "LIKERT_5", "order": 203, "weight": 1, "isTrial": true, "options": [], "required": true}, {"id": "emo_5", "text": "Does your child avoid activities or situations due to fear or anxiety?", "type": "LIKERT_5", "order": 204, "weight": 1, "isTrial": true, "options": [], "required": true}]	[]	{"riskLevels": {"low": {"max": 4, "min": 0, "color": "#22c55e", "label": "Low Risk"}, "high": {"max": 11, "min": 8, "color": "#f97316", "label": "High Risk"}, "moderate": {"max": 7, "min": 5, "color": "#eab308", "label": "Moderate Risk"}, "veryHigh": {"max": 15, "min": 12, "color": "#ef4444", "label": "Very High Risk"}}, "totalPossibleScore": 15, "clinicallySignificantScore": 8}	1	7a79e16b-242f-4a34-b660-45d76273807a	2025-09-30 04:03:18.924	2025-10-27 16:21:48.66
\.


--
-- Data for Name: email_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_logs (id, "userId", "recipientEmail", "emailType", subject, status, "messageId", "errorMessage", "templateId", "templateVersion", "sentAt") FROM stdin;
\.


--
-- Data for Name: feature_flags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feature_flags (id, key, "displayName", description, scope, "isEnabled", "enabledForRoles", "enabledForOrgs", metadata, "createdAt", "updatedAt") FROM stdin;
cmjeo6b280000onq5xm570is6	district_routes	District Routes	Enable access to /district and /teacher routes	role	t	{DISTRICT_ADMIN,TEACHER,ADMIN,SUPER_ADMIN}	{}	\N	2025-12-20 19:06:46.016	2025-12-20 19:06:46.016
cmjeo6bdj0001onq5wmcggfgm	district_dashboard	District Dashboard	Enable district-level aggregate dashboard	role	f	{DISTRICT_ADMIN,ADMIN,SUPER_ADMIN}	{}	\N	2025-12-20 19:06:46.423	2025-12-20 19:06:46.423
cmjeo6bw30003onq5mkybwo8s	ai_recommendations	AI Recommendations	Enable AI-generated support strategies and accommodations	global	f	{}	{}	\N	2025-12-20 19:06:47.092	2025-12-20 19:06:47.092
cmjeo6c7d0004onq58ihf0kvp	ai_chat	AI Chat	Enable conversational AI for assessment questions	global	f	{}	{}	\N	2025-12-20 19:06:47.497	2025-12-20 19:06:47.497
cmjeo6cfv0005onq5u1sy7r5l	pdf_export	PDF Export	Enable PDF report generation with FERPA disclaimers	global	f	{}	{}	\N	2025-12-20 19:06:47.803	2025-12-20 19:06:47.803
cmjeo6cq30006onq5fftelmiu	csv_export	CSV Export	Enable CSV exports (aggregate data only, no PII)	role	f	{DISTRICT_ADMIN,ADMIN,SUPER_ADMIN}	{}	\N	2025-12-20 19:06:48.171	2025-12-20 19:06:48.171
cmjeo6d0k0007onq5sc3xzeya	aggregate_reports	Aggregate Reports	Enable classroom and district-level aggregate reporting	role	f	{TEACHER,DISTRICT_ADMIN,ADMIN,SUPER_ADMIN}	{}	\N	2025-12-20 19:06:48.548	2025-12-20 19:06:48.548
cmjeo6e27000bonq5bg7v8cf7	audit_logging	Audit Logging	Log all access to student data for compliance	global	t	{}	{}	\N	2025-12-20 19:06:49.903	2025-12-20 19:06:49.903
cmjeo6ec7000conq5lrz245lo	anonymization	Student Anonymization	Use anonymousId instead of names in aggregate views	global	t	{}	{}	\N	2025-12-20 19:06:50.264	2025-12-20 19:06:50.264
cmjeo6bm10002onq5vbpsoj27	teacher_dashboard	Teacher Dashboard	Enable teacher classroom management dashboard	role	t	{TEACHER,DISTRICT_ADMIN,ADMIN,SUPER_ADMIN}	{}	\N	2025-12-20 19:06:46.73	2025-12-20 19:14:50.836
cmjeo6diz0009onq5z5abmesv	student_creation	Student Creation	Enable teachers to add students to their classrooms	role	t	{TEACHER,DISTRICT_ADMIN,ADMIN,SUPER_ADMIN}	{}	\N	2025-12-20 19:06:49.211	2025-12-20 19:14:51.024
cmjeo6dtt000aonq5g6wuoixs	assessment_assignment	Assessment Assignment	Enable teachers to assign assessments to students	role	t	{TEACHER,DISTRICT_ADMIN,ADMIN,SUPER_ADMIN}	{}	\N	2025-12-20 19:06:49.602	2025-12-20 19:14:51.174
cmjeo6d8z0008onq5ix3go340	student_detail_view	Student Detail View	Enable detailed student assessment view with intent gate	role	t	{TEACHER,DISTRICT_ADMIN,ADMIN,SUPER_ADMIN}	{}	\N	2025-12-20 19:06:48.851	2025-12-20 19:14:51.419
\.


--
-- Data for Name: licenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.licenses (id, "licenseKey", type, status, "maxUsers", "maxAssessments", features, "validFrom", "validUntil", "createdAt", "updatedAt", "organizationId", "maxConversationalReports", "maxConversationalAssessments") FROM stdin;
cmi7qkl3v0000l704zn9dmf55	CORE-MI7QKL3U-LTZQL3LBQ	CORE	ACTIVE	1	6	{"tier": "CORE", "planId": "CORE_MONTHLY", "features": ["2 full assessment credits per month (parent or child)", "Credit rollover up to 6 total credits", "Credits expire after 12 months (oldest expire first)", "Conversational AI sessions ($9 each)", "Full dashboard access with progress tracking graphs", "Parent resource library", "School-ready PDF reports", "Priority email support", "Member discount on additional assessments ($77 per credit)", "Enhanced Reports at member rate ($9 each)"], "rolloverCap": 6, "billingInterval": "monthly", "enhancedReports": {"included": 0, "priceCents": 900, "description": "Member rate $9 each"}, "conversationalAI": {"included": false, "unlimited": false, "priceCents": 900, "description": "$9 per session"}, "creditsPerInterval": 2, "creditIntervalMonths": 1}	2025-11-20 17:59:45.884	\N	2025-11-20 17:59:45.884	2025-11-20 19:35:36.868	\N	0	0
cmgaaov2e0003onq1lqfev7tg	LIC-MGAAOV2E-BZCRL0UXS	PROFESSIONAL	ACTIVE	1	\N	null	2025-10-03 03:39:05.415	2026-10-03 03:39:05.414	2025-10-03 03:39:05.415	2025-10-03 03:43:45.1	\N	\N	\N
cmg8cs9800003onkdu69vndzl	LIC-1759345330608-uqctn9hd1	PROFESSIONAL	ACTIVE	1	\N	null	2025-10-01 19:02:10.609	2026-10-01 19:02:10.608	2025-10-01 19:02:10.609	2025-10-03 03:59:29.144	\N	\N	\N
cmgchmba80005on0383u6k2vu	LIC-MGCHMBA8-XNV76DC65	PROFESSIONAL	ACTIVE	1	\N	null	2025-10-04 16:28:36.129	2026-10-04 16:28:36.128	2025-10-04 16:28:36.129	2025-10-04 16:29:26.787	\N	\N	\N
cmgch41ov0003onuuazf6muc2	LIC-MGCH41OV-7G3OX22SQ	BASIC	ACTIVE	1	5	null	2025-10-04 16:14:23.887	2026-10-04 16:14:23.887	2025-10-04 16:14:23.887	2025-10-04 19:27:43.739	\N	0	\N
cmhkq7uxv0002l704ol566um5	LIC-MHKQ7UXU-NFADEQ25B	BASIC	ACTIVE	1	1	\N	2025-11-04 15:31:10.052	2026-11-04 15:31:10.051	2025-11-04 15:31:10.052	2025-11-04 15:31:10.052	\N	\N	\N
cmgick6nb0003onr310g6iqfz	LIC-MGICK6NA-ET3TJANHT	BASIC	ACTIVE	1	1	\N	2025-10-08 18:53:35.784	2026-10-08 18:53:35.783	2025-10-08 18:53:35.784	2025-10-08 18:53:35.784	\N	0	\N
cmgieidk800tgonr3tcffmvls	LIC-MGIEIDK7-5LZ8S3Y4P	BASIC	ACTIVE	1	1	\N	2025-10-08 19:48:10.664	2026-10-08 19:48:10.664	2025-10-08 19:48:10.664	2025-10-08 19:48:10.664	\N	0	\N
cmgierq0e00tqonr3753ljpsf	LIC-MGIERQ0E-MIC7VC5O9	BASIC	ACTIVE	1	1	\N	2025-10-08 19:55:26.703	2026-10-08 19:55:26.702	2025-10-08 19:55:26.703	2025-10-08 19:55:26.703	\N	0	\N
cmgiew6oe00u1onr3x3a10v85	LIC-MGIEW6OE-76NJULT39	BASIC	ACTIVE	1	1	\N	2025-10-08 19:58:54.926	2026-10-08 19:58:54.926	2025-10-08 19:58:54.926	2025-10-08 19:58:54.926	\N	0	\N
cmgif9t3j00uaonr3lve954up	LIC-MGIF9T3H-BFASHPGVR	BASIC	ACTIVE	1	1	\N	2025-10-08 20:09:30.511	2026-10-08 20:09:30.509	2025-10-08 20:09:30.511	2025-10-08 20:09:30.511	\N	0	\N
cmgiii43r00ulonr33mnr4fzf	LIC-MGIII43Q-KGLFX7JAN	BASIC	ACTIVE	1	1	\N	2025-10-08 21:39:56.871	2026-10-08 21:39:56.87	2025-10-08 21:39:56.871	2025-10-08 21:39:56.871	\N	0	\N
cmgiisrq40002onbgafwp8qoc	LIC-MGIISRQ2-OS49MZRTT	BASIC	ACTIVE	1	1	\N	2025-10-08 21:48:14.045	2026-10-08 21:48:14.042	2025-10-08 21:48:14.045	2025-10-08 21:48:14.045	\N	0	\N
cmgij9bkb00ttonbg8bdeac87	LIC-MGIJ9BK5-3XOEYSO0A	BASIC	ACTIVE	1	1	\N	2025-10-08 22:01:06.251	2026-10-08 22:01:06.245	2025-10-08 22:01:06.251	2025-10-08 22:01:06.251	\N	0	\N
cmggyffuw0000on4r5z9u49vd	LIC-1759865413639-524VC0QK2	BASIC	ACTIVE	1	9	\N	2025-10-07 19:30:13.641	2026-10-07 19:30:13.639	2025-10-07 19:30:13.641	2025-10-10 00:56:33.903	\N	0	\N
cmgaaccmf0003onjdox399ogd	LIC-MGAACCMF-U0K8H3JHR	FAMILY	ACTIVE	1	15	{"tier": "FAMILY", "planId": "FAMILY_MONTHLY", "features": ["5 full assessment credits per month (parent or child)", "Credit rollover up to 15 total credits", "Credits expire after 12 months (oldest expire first)", "Unlimited conversational AI sessions included", "Multi-child profile management", "Full dashboard with advanced features", "Progress tracking for all children", "Parent resource library (premium access)", "All Enhanced Reports included free", "Priority support with live chat", "Early access to new features", "Member discount on additional assessments ($77 per credit)"], "rolloverCap": 15, "billingInterval": "monthly", "enhancedReports": {"included": "unlimited", "description": "All Enhanced Reports included free"}, "conversationalAI": {"included": true, "unlimited": true, "description": "Unlimited included"}, "creditsPerInterval": 5, "creditIntervalMonths": 1}	2025-10-03 03:29:21.639	2026-10-03 03:29:21.639	2025-10-03 03:29:21.639	2025-11-22 20:30:19.698	\N	\N	\N
cmggyxl1r0000onib1bp9nahe	BMW6-33LK-D3WE-3GD3	CORE	ACTIVE	1	6	{"tier": "CORE", "planId": "CORE_MONTHLY", "features": ["2 full assessment credits per month (parent or child)", "Credit rollover up to 6 total credits", "Credits expire after 12 months (oldest expire first)", "Conversational AI sessions ($9 each)", "Full dashboard access with progress tracking graphs", "Parent resource library", "School-ready PDF reports", "Priority email support", "Member discount on additional assessments ($77 per credit)", "Enhanced Reports at member rate ($9 each)"], "rolloverCap": 6, "billingInterval": "monthly", "enhancedReports": {"included": 0, "priceCents": 900, "description": "Member rate $9 each"}, "conversationalAI": {"included": false, "unlimited": false, "priceCents": 900, "description": "$9 per session"}, "creditsPerInterval": 2, "creditIntervalMonths": 1}	2025-10-07 19:44:20.176	2026-10-07 19:44:20.173	2025-10-07 19:44:20.176	2025-11-22 20:13:31.797	\N	0	0
\.


--
-- Data for Name: login_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login_tokens (id, "userId", token, "expiresAt", "usedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_preferences (id, "userId", "assessmentComplete", "assessmentShared", "licenseExpiring", "licenseRenewed", "newRecommendation", "weeklySummary", "monthlySummary", "accountUpdate", "securityAlert", "productUpdates", "marketingEmails", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizations (id, name, email, phone, address, "billingEmail", "taxId", industry, "employeeCount", "createdAt", "updatedAt", "customDomain", logo, "primaryColor", "secondaryColor", "headerTitle", "footerText") FROM stdin;
cmjeoak8u0000onzshk0xg7km	Demo School District	admin@demodistrict.edu	(555) 123-4567	123 Education Way, Demo City, DC 12345	\N	\N	\N	\N	2025-12-20 19:10:04.541	2025-12-20 19:10:04.541	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: passkey_challenges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.passkey_challenges (id, "userId", challenge, "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: passkeys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.passkeys (id, "userId", name, "credentialId", "publicKey", counter, transports, "createdAt", "lastUsed") FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, "userId", "stripePaymentIntentId", "stripeCustomerId", amount, currency, status, "planType", plan, "childName", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: platform_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_settings (id, "globalTrialAssessmentId", "globalRegularAssessmentId", "maintenanceMode", "registrationEnabled", "trialAssessmentsEnabled", "aiReportsEnabled", "maxAiReportsPerUser", "createdAt", "updatedAt", "updatedBy", "emailSendingEnabled", "sesMonthlyBudget", "maxConversationalSessionsPerUser") FROM stdin;
cmjeozvi30000onjse08mcj9c	\N	\N	f	t	t	t	10	2025-12-20 19:29:45.53	2025-12-20 19:29:45.53	7a79e16b-242f-4a34-b660-45d76273807a	t	5.000000000000000000000000000000	10
cmh28lakg0006on3g4v18bhbt	cmg618glp0007onv3jnu3ls4i	cmg5sg6y90001ono4fmcyzb70	f	t	t	t	10	2025-10-22 16:57:52.576	2025-10-24 23:48:01.221	7a79e16b-242f-4a34-b660-45d76273807a	t	5.000000000000000000000000000000	10
\.


--
-- Data for Name: question_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question_responses (id, "assessmentId", "questionId", response, score, "timestamp") FROM stdin;
\.


--
-- Data for Name: question_sets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question_sets (id, domain, name, description, "isActive", "order", "createdAt", "updatedAt", "clinicallySignificantScore", "displayName", "multiPartLogic", prerequisites, "skipConditions", "totalPossibleScore") FROM stdin;
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.questions (id, "questionSetId", text, "order", "isGatingQuestion", weight, "isActive", "isTrial", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: recommendations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recommendations (id, "assessmentId", "userId", title, content, category, priority, "isBookmarked", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: resource_library; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_library (id, title, description, url, category, tags, "isActive", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: schools; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schools (id, "districtId", name, code, "isActive", "createdAt", "updatedAt") FROM stdin;
cmjeoaksf0004onzsiawkc7c4	cmjeoakhr0002onzs7p8vf7p1	Lincoln Elementary	LES	t	2025-12-20 19:10:05.247	2025-12-20 19:10:05.247
cmjeoam03000ionzsop375qg2	cmjeoakhr0002onzs7p8vf7p1	Washington Middle School	WMS	t	2025-12-20 19:10:06.82	2025-12-20 19:10:06.82
cmjeoampv000qonzst17h16qn	cmjeoakhr0002onzs7p8vf7p1	Jefferson High School	JHS	t	2025-12-20 19:10:07.748	2025-12-20 19:10:07.748
\.


--
-- Data for Name: scores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scores (id, "assessmentId", domain, "domainTemplateId", "domainName", "rawScore", "riskLevel", confidence, "timestamp", "questionsAnswered", "totalPossible", "wasTerminatedEarly") FROM stdin;
\.


--
-- Data for Name: ses_monthly_totals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ses_monthly_totals (id, month, "totalEmailsSent", "totalCost", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ses_usage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ses_usage (id, "emailsSent", "estimatedCost", recipient, "emailType", "sentAt") FROM stdin;
\.


--
-- Data for Name: shareable_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shareable_links (id, "shareCode", "assessmentId", "createdById", privacy, password, "expiresAt", "isActive", "viewCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: snapshot_full_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.snapshot_full_reports (id, "orderId", "reportJson", "pdfUrl", "createdAt") FROM stdin;
\.


--
-- Data for Name: snapshot_leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.snapshot_leads (id, email, "consentMarketing", "createdAt", "sessionId") FROM stdin;
\.


--
-- Data for Name: snapshot_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.snapshot_orders (id, "leadId", "sessionId", amount, status, "stripePaymentIntent", "createdAt") FROM stdin;
\.


--
-- Data for Name: snapshot_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.snapshot_sessions (id, anonymous, consented, region, utm, "createdAt") FROM stdin;
cmhao9hmy007eongeu5oixexu	f	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-28 14:38:45.131+00
cmh2dnp6z000cona1ee35xlgk	t	t	us	\N	2025-10-22 19:19:42.923+00
cmh5e1a4c0000l704ermdswgn	t	t	us	\N	2025-10-24 21:53:35.1+00
cmh5gf32b0000l7048ntapd1v	t	t	us	\N	2025-10-24 23:00:18.372+00
cmh5gpc960000l404rqofjr3c	f	t	us	\N	2025-10-24 23:08:16.747+00
cmh6h9ivp0000on3r6hpwzdo6	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-25 16:11:44.724+00
cmh6hcqie0000onk1rpb78trm	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-25 16:14:14.582+00
cmh6hf0kh0003onk124mr9egh	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-25 16:16:00.884+00
cmh6hjlr30006onk1tpnt4x2x	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-25 16:19:34.972+00
cmh6mh2zh000bonk1xid1lrzj	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-25 18:37:34.938+00
cmh6mh8hc000conk16qjgtog4	f	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-25 18:37:42.577+00
cmh7qjkfa0000on41t4n90u58	f	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-26 13:19:16.005+00
cmh99lr9t0004onoz1vrlcp87	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-27 15:00:37.016+00
cmh9ars91000conh88nr6p01h	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-27 15:33:17.893+00
cmh9axhv10000onfez39ye7lc	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-27 15:37:44.365+00
cmh9b3zik000eonvikmnnywg5	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-27 15:42:47.065+00
cmh9byq7m001donvifxc5nvoh	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-27 16:06:41.427+00
cmh9cba1z002aonvitht55hkb	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-27 16:16:27.011+00
cmh9clj3v004donvic9wxes0x	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-27 16:24:25.311+00
cmhaoqh8q00e5onge2sgdunyl	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-28 14:51:57.38+00
cmh9d5cnx0000onl2fcko59z9	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-27 16:39:50.109+00
cmh9dl9cq0011onl2x6crvd24	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-27 16:52:11.931+00
cmh9dynqt0032onl27anmkc1g	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-27 17:02:37.493+00
cmh9edcz70000onl03cfp7oim	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-27 17:14:03.379+00
cmh9k1fdc0087onl0nudf8h7a	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-27 19:52:44.272+00
cmh9o60h1009qonl039tavzy1	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-27 21:48:16.709+00
cmhanixkp0000ongejh2ps5wr	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-28 14:18:06.038+00
cmhap6frj00owonge18izxof2	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-28 15:04:22.351+00
cmhc5isto0002onfa3w3lfy7m	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-29 15:29:39.148+00
cmhc7bwx50000on0qqpvyn1v3	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-29 16:20:16.649+00
cmhdsuect0002on10qe6bav01	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-30 19:10:17.613+00
cmhdt7eek0002onmu9jl6wiwa	f	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-30 19:20:24.204+00
cmhdtf1uu001lonmu60e6zjjo	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-30 19:26:21.185+00
cmhdtoiku003ionmu162wuj5s	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-30 19:33:42.763+00
cmhdtwm5r0004on3rmzylib6y	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-30 19:40:00.688+00
cmhdu62i10004on9m57uxh2lk	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-30 19:47:21.769+00
cmhduo6n7001gon51n3atbxwj	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-30 20:01:26.948+00
cmhduwpsp0003ondchx3wggeh	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-30 20:08:04.984+00
cmhdvqi0q0003ondyhf94r5jw	f	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-30 20:31:14.587+00
cmhdvsxht0002ontbr10i815v	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-30 20:33:07.951+00
cmhdvvbv90015ontb46dbjlc2	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":\\"cVJO3Mb3\\"}"	2025-10-30 20:34:59.925+00
cmhdwam940008ondjqo5za144	f	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":null}"	2025-10-30 20:46:53.19+00
cmhe87set0004on9lhbf3lv67	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":\\"cVJO3Mb3\\"}"	2025-10-31 02:20:36.629+00
cmhe8gmxw0004onx3i1naie14	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":\\"cVJO3Mb3\\"}"	2025-10-31 02:27:29.444+00
cmhe95df40006oncinlxny2dy	t	t	\N	"{\\"source\\":null,\\"medium\\":null,\\"campaign\\":null,\\"content\\":null,\\"term\\":null,\\"ref\\":\\"cVJO3Mb3\\"}"	2025-10-31 02:46:43.504+00
cmhjx8rga0000onzl4t4mo7ab	t	t	\N	"{\\"source\\":\\"chatgpt\\",\\"medium\\":\\"app\\",\\"campaign\\":\\"chatgpt_trial\\"}"	2025-11-04 02:00:03.319+00
\.


--
-- Data for Name: snapshot_trials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.snapshot_trials (id, "sessionId", "childFirstName", "ageBand", "gradeBand", region, responses, "scoreSnapshot", "createdAt") FROM stdin;
cmh9cbea9002convieye44pqi	cmh9cba1z002aonvitht55hkb	Jack	9-12	grade_3_5	\N	\N	\N	2025-10-27 16:16:32.529+00
cmh6hjpj00008onk1dkal2zey	cmh6hjlr30006onk1tpnt4x2x	\N	9-12	grade_3_5	\N	{"att_1": 3, "att_2": 3, "att_3": 3, "att_4": 3, "att_5": 3, "hyp_1": 3, "hyp_2": 0, "hyp_3": 3, "hyp_4": 3, "hyp_5": 3}	"{\\"indicators\\":1,\\"domains\\":[{\\"domain\\":\\"Hyperactivity & Impulsivity\\",\\"slug\\":\\"hyperactivity-impulsivity\\",\\"score\\":2.4,\\"level\\":\\"moderate\\"},{\\"domain\\":\\"Attention & Focus\\",\\"slug\\":\\"attention-focus\\",\\"score\\":3,\\"level\\":\\"elevated\\"}],\\"recommendationPreview\\":\\"Most noticeable patterns appear in Attention & Focus and Hyperactivity & Impulsivity. Unlock the full report for action steps.\\"}"	2025-10-25 16:19:39.9+00
cmh6hf4j90005onk1sszmatw1	cmh6hf0kh0003onk124mr9egh	\N	6-8	grade_6_8	\N	{"att_1": 0, "att_2": 3, "att_3": 3, "att_4": 3, "att_5": 3, "hyp_1": 3, "hyp_2": 3, "hyp_3": 3, "hyp_4": 3, "hyp_5": 0}	"{\\"indicators\\":0,\\"domains\\":[{\\"domain\\":\\"Hyperactivity & Impulsivity\\",\\"slug\\":\\"hyperactivity-impulsivity\\",\\"score\\":2.4,\\"level\\":\\"moderate\\"},{\\"domain\\":\\"Attention & Focus\\",\\"slug\\":\\"attention-focus\\",\\"score\\":2.4,\\"level\\":\\"moderate\\"}],\\"recommendationPreview\\":\\"Most noticeable patterns appear in Hyperactivity & Impulsivity and Attention & Focus. Unlock the full report for action steps.\\"}"	2025-10-25 16:16:06.069+00
cmh5gf3j90002l704wx52oecx	cmh5gf32b0000l7048ntapd1v	\N	\N	\N	us	{"att_1": 0, "att_2": 0, "att_3": 0, "att_4": 0, "att_5": 0, "hyp_1": 0, "hyp_2": 3, "hyp_3": 0, "hyp_4": 0, "hyp_5": 0}	"{\\"indicators\\":0,\\"domains\\":[{\\"domain\\":\\"Hyperactivity & Impulsivity\\",\\"slug\\":\\"hyperactivity-impulsivity\\",\\"score\\":0.6,\\"level\\":\\"low\\"},{\\"domain\\":\\"Attention & Focus\\",\\"slug\\":\\"attention-focus\\",\\"score\\":0,\\"level\\":\\"low\\"}],\\"recommendationPreview\\":\\"Most noticeable patterns appear in Hyperactivity & Impulsivity and Attention & Focus. Unlock the full report for action steps.\\"}"	2025-10-24 23:00:18.981+00
cmh6mhfez000eonk1zd2gbdt1	cmh6mh8hc000conk16qjgtog4	TOMAS	6-8	grade_3_5	\N	{"att_1": 3, "att_2": 3, "att_3": 3, "att_4": 3, "att_5": 3, "hyp_1": 3, "hyp_2": 3, "hyp_3": 3, "hyp_4": 3, "hyp_5": 3}	"{\\"indicators\\":2,\\"domains\\":[{\\"domain\\":\\"Hyperactivity & Impulsivity\\",\\"slug\\":\\"hyperactivity-impulsivity\\",\\"score\\":3,\\"level\\":\\"elevated\\"},{\\"domain\\":\\"Attention & Focus\\",\\"slug\\":\\"attention-focus\\",\\"score\\":3,\\"level\\":\\"elevated\\"}],\\"recommendationPreview\\":\\"Most noticeable patterns appear in Hyperactivity & Impulsivity and Attention & Focus. Unlock the full report for action steps.\\"}"	2025-10-25 18:37:51.563+00
cmh7qjvdu0002on415inyupgn	cmh7qjkfa0000on41t4n90u58	JACK 	9-12	grade_6_8	\N	\N	\N	2025-10-26 13:19:30.211+00
cmh6hcuep0002onk142kxwzw3	cmh6hcqie0000onk1rpb78trm	\N	6-8	grade_1_2	\N	{"att_1": 3, "att_2": 3, "att_3": 3, "att_4": 3, "att_5": 0, "hyp_1": 0, "hyp_2": 3, "hyp_3": 3, "hyp_4": 0, "hyp_5": 3}	"{\\"indicators\\":0,\\"domains\\":[{\\"domain\\":\\"Hyperactivity & Impulsivity\\",\\"slug\\":\\"hyperactivity-impulsivity\\",\\"score\\":1.8,\\"level\\":\\"moderate\\"},{\\"domain\\":\\"Attention & Focus\\",\\"slug\\":\\"attention-focus\\",\\"score\\":2.4,\\"level\\":\\"moderate\\"}],\\"recommendationPreview\\":\\"Most noticeable patterns appear in Attention & Focus and Hyperactivity & Impulsivity. Unlock the full report for action steps.\\"}"	2025-10-25 16:14:19.634+00
cmh99lyja0006onozuvwi4aaw	cmh99lr9t0004onoz1vrlcp87	\N	6-8	grade_1_2	\N	\N	\N	2025-10-27 15:00:46.487+00
cmh2dnq0k000eona13968wonl	cmh2dnp6z000cona1ee35xlgk	\N	\N	\N	us	{"att_2": 0, "att_3": 3, "att_4": 3, "att_5": 3, "hyp_1": 0, "hyp_2": 3, "hyp_3": 0, "hyp_4": 0, "hyp_5": 3}	{"domains": [{"slug": "hyperactivity-impulsivity", "level": "low", "score": 1.2, "domain": "Hyperactivity & Impulsivity"}, {"slug": "attention-focus", "level": "moderate", "score": 2.25, "domain": "Attention & Focus"}], "indicators": 0, "recommendationPreview": "Most noticeable patterns appear in Attention & Focus and Hyperactivity & Impulsivity. Unlock the full report for action steps."}	2025-10-22 19:19:43.988+00
cmh9arxdy000eonh8kdd2be1x	cmh9ars91000conh88nr6p01h	Jsk	6-8	grade_1_2	\N	\N	\N	2025-10-27 15:33:24.551+00
cmh9axumk0002onfejmlo727o	cmh9axhv10000onfez39ye7lc	JACK	9-12	grade_6_8	\N	\N	\N	2025-10-27 15:38:00.909+00
cmh9b4uua000gonvi0dumrn4y	cmh9b3zik000eonvikmnnywg5	Jack	9-12	grade_1_2	\N	\N	\N	2025-10-27 15:43:27.778+00
cmh5gpclf0002l404xxmzcx97	cmh5gpc960000l404rqofjr3c	\N	13-18	\N	us	{"att_1": 3, "att_2": 3, "att_3": 3, "att_4": 3, "att_5": 3, "hyp_1": 3, "hyp_2": 3, "hyp_3": 0, "hyp_4": 3, "hyp_5": 3}	"{\\"indicators\\":1,\\"domains\\":[{\\"domain\\":\\"Hyperactivity & Impulsivity\\",\\"slug\\":\\"hyperactivity-impulsivity\\",\\"score\\":2.4,\\"level\\":\\"moderate\\"},{\\"domain\\":\\"Attention & Focus\\",\\"slug\\":\\"attention-focus\\",\\"score\\":3,\\"level\\":\\"elevated\\"}],\\"recommendationPreview\\":\\"Most noticeable patterns appear in Attention & Focus and Hyperactivity & Impulsivity. Unlock the full report for action steps.\\"}"	2025-10-24 23:08:17.284+00
cmh6h9phf0002on3r3hylayc8	cmh6h9ivp0000on3r6hpwzdo6	\N	6-8	grade_3_5	\N	\N	\N	2025-10-25 16:11:53.283+00
cmh9clne5004fonviopcbzivw	cmh9clj3v004donvic9wxes0x	Jack	6-8	grade_1_2	\N	\N	\N	2025-10-27 16:24:30.893+00
cmh9byuxn001fonvixzqv914j	cmh9byq7m001donvifxc5nvoh	\N	6-8	grade_1_2	\N	\N	\N	2025-10-27 16:06:47.579+00
cmh5e1aid0002l7046apn1kfv	cmh5e1a4c0000l704ermdswgn	\N	\N	\N	us	{"att_1": 0, "att_2": 3, "att_3": 0, "att_4": 0, "att_5": 0, "hyp_1": 3, "hyp_2": 0, "hyp_3": 3, "hyp_4": 0, "hyp_5": 3}	"{\\"indicators\\":0,\\"domains\\":[{\\"domain\\":\\"Hyperactivity & Impulsivity\\",\\"slug\\":\\"hyperactivity-impulsivity\\",\\"score\\":1.8,\\"level\\":\\"moderate\\"},{\\"domain\\":\\"Attention & Focus\\",\\"slug\\":\\"attention-focus\\",\\"score\\":0.6,\\"level\\":\\"low\\"}],\\"recommendationPreview\\":\\"Most noticeable patterns appear in Hyperactivity & Impulsivity and Attention & Focus. Unlock the full report for action steps.\\"}"	2025-10-24 21:53:35.605+00
cmh9d5j3r0002onl2jmyvp1of	cmh9d5cnx0000onl2fcko59z9	\N	9-12	grade_6_8	\N	\N	\N	2025-10-27 16:39:58.455+00
cmh9dlfm00013onl2f1f58yul	cmh9dl9cq0011onl2x6crvd24	J	6-8	grade_6_8	\N	\N	\N	2025-10-27 16:52:20.425+00
cmh9dyss20034onl2sllbfo35	cmh9dynqt0032onl27anmkc1g	Jak	9-12	grade_3_5	\N	\N	\N	2025-10-27 17:02:44.018+00
cmh9ediax0002onl01c0xtpi6	cmh9edcz70000onl03cfp7oim	Jack	9-12	grade_3_5	\N	\N	\N	2025-10-27 17:14:10.281+00
cmh9k1li50089onl0m8bwxlbr	cmh9k1fdc0087onl0nudf8h7a	\N	9-12	grade_6_8	\N	\N	\N	2025-10-27 19:52:52.254+00
cmh9o648h009sonl0axrybuao	cmh9o60h1009qonl039tavzy1	\N	9-12	grade_9_12	\N	\N	\N	2025-10-27 21:48:21.617+00
cmhanj3lp0002ongejhyd042t	cmhanixkp0000ongejh2ps5wr	Jack	9-12	grade_1_2	\N	\N	\N	2025-10-28 14:18:13.886+00
cmhao9ni7007gonge1l3bfeli	cmhao9hmy007eongeu5oixexu	Jack	9-12	grade_3_5	\N	\N	\N	2025-10-28 14:38:52.736+00
cmhaor7iz00e7ongewxwb9w68	cmhaoqh8q00e5onge2sgdunyl	Jack	9-12	grade_3_5	\N	\N	\N	2025-10-28 14:52:31.835+00
cmhap6iyi00oyongeyadwvkj1	cmhap6frj00owonge18izxof2	\N	9-12	grade_1_2	\N	\N	\N	2025-10-28 15:04:26.49+00
cmhc5ixvw0004onfa77m3of99	cmhc5isto0002onfa3w3lfy7m	\N	6-8	grade_1_2	\N	\N	\N	2025-10-29 15:29:45.74+00
cmhc7c27o0002on0qvrv7rjme	cmhc7bwx50000on0qqpvyn1v3	\N	9-12	grade_3_5	\N	\N	\N	2025-10-29 16:20:23.989+00
cmhdsumd70004on102rr66vay	cmhdsuect0002on10qe6bav01	\N	9-12	grade_1_2	\N	\N	\N	2025-10-30 19:10:28.027+00
cmhdt7mmr0004onmub0b85u3o	cmhdt7eek0002onmu9jl6wiwa	Big Kahuna	6-8	grade_6_8	\N	\N	\N	2025-10-30 19:20:34.899+00
cmhdtf5qe001nonmuw0nlr7ci	cmhdtf1uu001lonmu60e6zjjo	\N	6-8	grade_3_5	\N	\N	\N	2025-10-30 19:26:26.246+00
cmhdtomqe003konmu5g0dkdlu	cmhdtoiku003ionmu162wuj5s	\N	9-12	grade_9_12	\N	\N	\N	2025-10-30 19:33:48.183+00
cmhdtwq7d0006on3rdb6b82q8	cmhdtwm5r0004on3rmzylib6y	\N	6-8	grade_3_5	\N	\N	\N	2025-10-30 19:40:05.929+00
cmhdu66iu0006on9mz99jdbkl	cmhdu62i10004on9m57uxh2lk	\N	13-18	grade_1_2	\N	\N	\N	2025-10-30 19:47:26.983+00
cmhduodul001ion51n9ehc1pu	cmhduo6n7001gon51n3atbxwj	\N	6-8	grade_1_2	\N	\N	\N	2025-10-30 20:01:36.286+00
cmhdux0cy0005ondc652mn435	cmhduwpsp0003ondchx3wggeh	\N	13-18	grade_6_8	\N	\N	\N	2025-10-30 20:08:18.706+00
cmhdvt9s70004ontbaremqw7u	cmhdvsxht0002ontbr10i815v	\N	9-12	grade_3_5	\N	\N	\N	2025-10-30 20:33:23.911+00
cmhdvw6bp0001on1oek8o7hqt	cmhdvvbv90015ontb46dbjlc2	\N	9-12	grade_1_2	\N	\N	\N	2025-10-30 20:35:39.398+00
cmhe87wyh0008on9lefz1qsur	cmhe87set0004on9lhbf3lv67	\N	13-18	grade_1_2	\N	\N	\N	2025-10-31 02:20:42.522+00
cmhe8gryb0008onx3s0ia6iyg	cmhe8gmxw0004onx3i1naie14	\N	6-8	grade_1_2	\N	\N	\N	2025-10-31 02:27:35.939+00
cmhe95hcz000aoncitv2bjm7c	cmhe95df40006oncinlxny2dy	\N	6-8	grade_1_2	\N	\N	\N	2025-10-31 02:46:48.611+00
\.


--
-- Data for Name: student_assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_assessments (id, "studentId", "assessmentId", "isTrial", "trialCompletedAt", "fullCompletedAt", "pdfUrl", "shareLinkId", "reviewedAt", "reviewedBy", "flaggedDomains", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: student_classrooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_classrooms (id, "studentId", "classroomId", "enrolledAt") FROM stdin;
cmjeoaq260016onzsixorfskd	cmjeoapxj0014onzsg6r38van	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:12.078
cmjeoaqcv001aonzs1qzn0w32	cmjeoaq6t0018onzsfyoavwzp	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:12.463
cmjeoaql6001eonzs3e7yfc1c	cmjeoaqh1001conzsjdiwwgxh	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:12.762
cmjeoaqvz001ionzsveallk4r	cmjeoaqri001gonzsrowo44o3	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:13.152
cmjeoar6r001monzs2kbyj1ur	cmjeoar07001konzsbzysutl6	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:13.539
cmjeoarfh001qonzsoy1u8yvj	cmjeoarba001oonzswn7rd7s4	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:13.853
cmjeoarqj001uonzso7911462	cmjeoarmd001sonzsnjqcbjlb	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:14.252
cmjeoas0w001yonzsa7txqsjl	cmjeoarum001wonzs802z0j1o	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:14.624
cmjeoas960022onzsjyir5mbg	cmjeoas4y0020onzs978c8n3w	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:14.922
cmjeoasjt0026onzs846jit6r	cmjeoasfm0024onzsqxp2qg4e	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:15.306
cmjeoasuh002aonzsxs9mjakr	cmjeoasnx0028onzs48q6xkzi	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:15.689
cmjeoat56002eonzs6a69r6rp	cmjeoasyw002conzsc21fmd35	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:16.075
cmjeoatdl002ionzsz65vl8bt	cmjeoat9j002gonzse4ap8tgp	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:16.377
cmjeoatnw002monzsw46yun8j	cmjeoatju002konzstubnwrbe	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:16.748
cmjeoatyf002qonzsvkiu687p	cmjeoatrw002oonzsqsgdoj95	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:17.127
cmjeoau6r002uonzsrfyu2pik	cmjeoau2l002sonzs9j2mjb6y	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:17.427
cmjeoauhm002yonzs6hekx9f4	cmjeoaucw002wonzsbgqv3l1q	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:17.818
cmjeoaus80032onzszldt4wdj	cmjeoaum10030onzs49z6o8tn	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:18.2
cmjeoav1i0036onzsi68mwsy2	cmjeoauwu0034onzstq0ul8vt	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:18.535
cmjeoavdi003aonzsgecs0o9e	cmjeoav7x0038onzswof0solu	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:18.967
cmjeoavq9003eonzsr9vklg3d	cmjeoavkk003conzsoclwltfh	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:19.39
cmjeoaw0z003ionzsxadr9lou	cmjeoavus003gonzsq62by5k2	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:19.811
cmjeoawa5003monzs3fc364mh	cmjeoaw5m003konzsolm9vd2p	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:20.141
cmjeoawl6003qonzsi26ajyik	cmjeoawgi003oonzs8j1ld3fz	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:20.539
cmjeoawwh003uonzsmm5v2p07	cmjeoawsa003sonzshea23ib6	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:10:20.946
cmjeofli30003on0vltqbjrw0	cmjeofli30001on0vpwhzem9s	cmjeoakwt0006onzs345rnna6	2025-12-20 19:13:59.45
cmjeoflp60007on0v705z4vqj	cmjeoflp60005on0vgzqzyonb	cmjeoakwt0006onzs345rnna6	2025-12-20 19:13:59.706
cmjeofly5000bon0vsuftw9c2	cmjeofly50009on0vqz5hj179	cmjeoakwt0006onzs345rnna6	2025-12-20 19:14:00.029
cmjeofm5b000fon0vwihfjkxk	cmjeofm5b000don0vp3yizlab	cmjeoakwt0006onzs345rnna6	2025-12-20 19:14:00.287
cmjeofmea000jon0vti6xhmm3	cmjeofmea000hon0vg5s8rxoq	cmjeoakwt0006onzs345rnna6	2025-12-20 19:14:00.61
cmjeofml3000non0vi8ydgjf3	cmjeofml3000lon0vk0wyrhe0	cmjeoakwt0006onzs345rnna6	2025-12-20 19:14:00.855
cmjeofmua000ron0vkture4co	cmjeofmua000pon0ve3knxyik	cmjeoakwt0006onzs345rnna6	2025-12-20 19:14:01.186
cmjeofn3n000von0v7yjfggym	cmjeofn3m000ton0vu75et85y	cmjeoakwt0006onzs345rnna6	2025-12-20 19:14:01.523
cmjeofnaj000zon0vbw875qe6	cmjeofnaj000xon0v4tysbmph	cmjeoal3l0008onzsrk96gxwt	2025-12-20 19:14:01.771
cmjeofnjn0013on0vjwwdddou	cmjeofnjn0011on0v10v0p338	cmjeoal3l0008onzsrk96gxwt	2025-12-20 19:14:02.099
cmjeofnqn0017on0va8p6prrq	cmjeofnqm0015on0vh8nk8f6i	cmjeoal3l0008onzsrk96gxwt	2025-12-20 19:14:02.351
cmjeofnzn001bon0vy5nuibtb	cmjeofnzn0019on0vjt5tpqlb	cmjeoal3l0008onzsrk96gxwt	2025-12-20 19:14:02.676
cmjeofo6g001fon0vpkf3cp3u	cmjeofo6g001don0vrboys6ye	cmjeoal3l0008onzsrk96gxwt	2025-12-20 19:14:02.92
cmjeofog1001jon0vo06y350v	cmjeofog1001hon0v3a3c59bs	cmjeoal3l0008onzsrk96gxwt	2025-12-20 19:14:03.265
cmjeofon3001non0vu48dnymz	cmjeofon3001lon0vnpzkff0i	cmjeoal3l0008onzsrk96gxwt	2025-12-20 19:14:03.52
cmjeofowl001ron0v89p7arrf	cmjeofowl001pon0v7w55lr2a	cmjeoal3l0008onzsrk96gxwt	2025-12-20 19:14:03.861
cmjeofp5y001von0voaxw3htn	cmjeofp5y001ton0v23vr1h12	cmjeoal85000aonzs28pgcxbb	2025-12-20 19:14:04.198
cmjeofpcy001zon0vx0kim20m	cmjeofpcy001xon0v1fydudtr	cmjeoal85000aonzs28pgcxbb	2025-12-20 19:14:04.45
cmjeofpm70023on0vn5mflqha	cmjeofpm70021on0vwg7qjcf3	cmjeoal85000aonzs28pgcxbb	2025-12-20 19:14:04.784
cmjeofpt50027on0v23htwqed	cmjeofpt50025on0vyetg0b8l	cmjeoal85000aonzs28pgcxbb	2025-12-20 19:14:05.033
cmjeofq2a002bon0vfrmbc6d7	cmjeofq2a0029on0vlob4ok5n	cmjeoal85000aonzs28pgcxbb	2025-12-20 19:14:05.362
cmjeofq9b002fon0vaatil7bc	cmjeofq9b002don0v11kmcarz	cmjeoal85000aonzs28pgcxbb	2025-12-20 19:14:05.615
cmjeofqhy002jon0vd5a2lh40	cmjeofqhy002hon0vvkg5opys	cmjeoal85000aonzs28pgcxbb	2025-12-20 19:14:05.926
cmjeofqr8002non0vpz6qipat	cmjeofqr8002lon0vlu94izam	cmjeoal85000aonzs28pgcxbb	2025-12-20 19:14:06.26
cmjeofqyj002ron0vtmk3t57z	cmjeofqyi002pon0vwyka7dab	cmjeoalcs000conzszvlzy6fh	2025-12-20 19:14:06.523
cmjeofr89002von0vjtj6wanm	cmjeofr89002ton0v4lkf4o5o	cmjeoalcs000conzszvlzy6fh	2025-12-20 19:14:06.873
cmjeofrf8002zon0vmbsj0spq	cmjeofrf8002xon0vea90dz3h	cmjeoalcs000conzszvlzy6fh	2025-12-20 19:14:07.125
cmjeofroi0033on0vlk8krmsy	cmjeofroi0031on0vyefht9ho	cmjeoalcs000conzszvlzy6fh	2025-12-20 19:14:07.458
cmjeofrvh0037on0vbu593bo2	cmjeofrvh0035on0vg72mjfbr	cmjeoalcs000conzszvlzy6fh	2025-12-20 19:14:07.709
cmjeofs4g003bon0vxzcarb83	cmjeofs4g0039on0vr7wfo434	cmjeoalcs000conzszvlzy6fh	2025-12-20 19:14:08.032
cmjeofsdl003fon0veuje71mm	cmjeofsdl003don0vm9u0554h	cmjeoalcs000conzszvlzy6fh	2025-12-20 19:14:08.361
cmjeofskk003jon0vpb33lo3r	cmjeofskk003hon0vuf1vn3z3	cmjeoalcs000conzszvlzy6fh	2025-12-20 19:14:08.612
cmjeofstm003non0v6zuzppdg	cmjeofstm003lon0vaxfe37wv	cmjeoaljk000eonzsryvu7h4c	2025-12-20 19:14:08.938
cmjeoft0n003ron0v5bw5vrtv	cmjeoft0n003pon0vbk8cgqu5	cmjeoaljk000eonzsryvu7h4c	2025-12-20 19:14:09.192
cmjeoft9x003von0vmatg768y	cmjeoft9x003ton0vsxr2u1bw	cmjeoaljk000eonzsryvu7h4c	2025-12-20 19:14:09.525
cmjeoftgz003zon0vsjuivaag	cmjeoftgz003xon0v0t45aisj	cmjeoaljk000eonzsryvu7h4c	2025-12-20 19:14:09.779
cmjeoftps0043on0vxap2cwa7	cmjeoftps0041on0v27rnccxv	cmjeoaljk000eonzsryvu7h4c	2025-12-20 19:14:10.096
cmjeoftz20047on0vmxqt815d	cmjeoftz20045on0vubhrgfmc	cmjeoaljk000eonzsryvu7h4c	2025-12-20 19:14:10.431
cmjeofu64004bon0vv6g4udgf	cmjeofu640049on0v838d9yve	cmjeoaljk000eonzsryvu7h4c	2025-12-20 19:14:10.685
cmjeofuf9004fon0vck71csst	cmjeofuf9004don0vrfyocpz9	cmjeoaljk000eonzsryvu7h4c	2025-12-20 19:14:11.013
cmjeofume004jon0vhgo8z4r4	cmjeofume004hon0vrsu37url	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:14:11.27
cmjeofuvr004non0vqmu5h310	cmjeofuvr004lon0v7l68zy50	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:14:11.607
cmjeofv2t004ron0vkz629bkf	cmjeofv2t004pon0ver8mbolo	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:14:11.862
cmjeofvcf004von0viu8zhfux	cmjeofvcf004ton0vdv67r76c	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:14:12.207
cmjeofvlb004zon0v8q9rau2x	cmjeofvlb004xon0vcf27qotr	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:14:12.527
cmjeofvs90053on0vj7rdeolu	cmjeofvs90051on0v5gwhkise	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:14:12.777
cmjeofw1n0057on0vkar7evsn	cmjeofw1m0055on0v1gdtgxzg	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:14:13.115
cmjeofw8w005bon0vudvgmkn5	cmjeofw8w0059on0vqxhpdy1g	cmjeoalon000gonzsfbaqpv3n	2025-12-20 19:14:13.376
cmjeofwij005fon0vp6wr906s	cmjeofwij005don0vjjj7tqxe	cmjeoam4a000konzsvf638ffv	2025-12-20 19:14:13.724
cmjeofwq8005jon0v1fo14524	cmjeofwq8005hon0vzvbl7cfx	cmjeoam4a000konzsvf638ffv	2025-12-20 19:14:13.974
cmjeofwz9005non0vanukdxg0	cmjeofwz8005lon0vx29tecvd	cmjeoam4a000konzsvf638ffv	2025-12-20 19:14:14.324
cmjeofx8d005ron0vqnkmgidt	cmjeofx8d005pon0veucrs6i7	cmjeoam4a000konzsvf638ffv	2025-12-20 19:14:14.654
cmjeofxfa005von0vud1hthvp	cmjeofxfa005ton0vb28vrh1e	cmjeoam4a000konzsvf638ffv	2025-12-20 19:14:14.902
cmjeofxoj005zon0v1up54jkj	cmjeofxoj005xon0v6knv9d1q	cmjeoam4a000konzsvf638ffv	2025-12-20 19:14:15.235
cmjeofxvp0063on0vjgweq404	cmjeofxvp0061on0vgzzwik50	cmjeoam4a000konzsvf638ffv	2025-12-20 19:14:15.493
cmjeofy4k0067on0vmycf30db	cmjeofy4k0065on0v4acvwl9m	cmjeoam4a000konzsvf638ffv	2025-12-20 19:14:15.812
cmjeofybl006bon0vv3r1zch6	cmjeofybl0069on0vuwuqb436	cmjeoamaf000monzszxzzqxa1	2025-12-20 19:14:16.065
cmjeofykx006fon0v64dx8ztb	cmjeofykx006don0voys0hvcw	cmjeoamaf000monzszxzzqxa1	2025-12-20 19:14:16.401
cmjeofytt006jon0vxwnphazm	cmjeofytt006hon0vkoywebgv	cmjeoamaf000monzszxzzqxa1	2025-12-20 19:14:16.721
cmjeofz13006non0vfcs4tvrs	cmjeofz12006lon0v7xt1uizi	cmjeoamaf000monzszxzzqxa1	2025-12-20 19:14:16.983
cmjeofzaa006ron0vpio12vtu	cmjeofzaa006pon0vak7k00f6	cmjeoamaf000monzszxzzqxa1	2025-12-20 19:14:17.314
cmjeofzhi006von0viwtsbvt9	cmjeofzhh006ton0voqtpeok6	cmjeoamaf000monzszxzzqxa1	2025-12-20 19:14:17.574
cmjeofzqw006zon0v5l97svpw	cmjeofzqw006xon0v3i0l5hbw	cmjeoamaf000monzszxzzqxa1	2025-12-20 19:14:17.913
cmjeofzxp0073on0vex5jftlj	cmjeofzxp0071on0vgvohdcn6	cmjeoamaf000monzszxzzqxa1	2025-12-20 19:14:18.157
cmjeog06y0077on0vhr7dnpce	cmjeog06y0075on0v9rkwz6j5	cmjeoames000oonzsblvermj1	2025-12-20 19:14:18.49
cmjeog0g2007bon0vxwbq7tga	cmjeog0g20079on0v5u5zuiye	cmjeoames000oonzsblvermj1	2025-12-20 19:14:18.818
cmjeog0n2007fon0v1ph5t928	cmjeog0n2007don0vnze3xer4	cmjeoames000oonzsblvermj1	2025-12-20 19:14:19.07
cmjeog0wb007jon0vtfehf62e	cmjeog0wb007hon0vwbueywh1	cmjeoames000oonzsblvermj1	2025-12-20 19:14:19.403
cmjeog13z007non0vytp4indo	cmjeog13y007lon0vua47c4gj	cmjeoames000oonzsblvermj1	2025-12-20 19:14:19.679
cmjeog1d6007ron0vot2bwv27	cmjeog1d6007pon0vzlr6kngf	cmjeoames000oonzsblvermj1	2025-12-20 19:14:20.01
cmjeog1k8007von0vgcxnmmun	cmjeog1k8007ton0vb6wm8loi	cmjeoames000oonzsblvermj1	2025-12-20 19:14:20.264
cmjeog1tb007zon0v98wcg3ju	cmjeog1tb007xon0veinn6x9i	cmjeoames000oonzsblvermj1	2025-12-20 19:14:20.591
cmjeog22a0083on0vcsxgbcvo	cmjeog22a0081on0v7kmaliq1	cmjeoamug000sonzsyzgq8mp6	2025-12-20 19:14:20.915
cmjeog29d0087on0vwt86irxv	cmjeog29d0085on0vizyggju4	cmjeoamug000sonzsyzgq8mp6	2025-12-20 19:14:21.17
cmjeog2il008bon0vgsi26adi	cmjeog2il0089on0vdk2m2mqb	cmjeoamug000sonzsyzgq8mp6	2025-12-20 19:14:21.501
cmjeog2px008fon0vle2uvudn	cmjeog2px008don0vff4dqfbw	cmjeoamug000sonzsyzgq8mp6	2025-12-20 19:14:21.765
cmjeog2zc008jon0vjivw4l0b	cmjeog2zc008hon0vvwvt7688	cmjeoamug000sonzsyzgq8mp6	2025-12-20 19:14:22.104
cmjeog36s008non0viqpzoa5b	cmjeog36s008lon0vg5qbtymf	cmjeoamug000sonzsyzgq8mp6	2025-12-20 19:14:22.372
cmjeog3gn008ron0v941votuo	cmjeog3gn008pon0vnoeeh73a	cmjeoamug000sonzsyzgq8mp6	2025-12-20 19:14:22.727
cmjeog3q3008von0veg60gzwl	cmjeog3q2008ton0vg5lm998y	cmjeoamug000sonzsyzgq8mp6	2025-12-20 19:14:23.067
cmjeog3x0008zon0vzqnjhzpf	cmjeog3wz008xon0vx4avdazk	cmjeoamyk000uonzsxzrp21v8	2025-12-20 19:14:23.316
cmjeog4690093on0vr5fewe20	cmjeog4690091on0v2o6vkki2	cmjeoamyk000uonzsxzrp21v8	2025-12-20 19:14:23.65
cmjeog4d20097on0vy2efsine	cmjeog4d20095on0vuoytnd42	cmjeoamyk000uonzsxzrp21v8	2025-12-20 19:14:23.894
cmjeog4me009bon0vp93lpbzl	cmjeog4me0099on0vvb2yvrkm	cmjeoamyk000uonzsxzrp21v8	2025-12-20 19:14:24.23
cmjeog4wb009fon0v0d4z94ag	cmjeog4wa009don0vconlvv9g	cmjeoamyk000uonzsxzrp21v8	2025-12-20 19:14:24.587
cmjeog55g009jon0v8gbiyn80	cmjeog55g009hon0vk7rldhrk	cmjeoamyk000uonzsxzrp21v8	2025-12-20 19:14:24.916
cmjeog5gz009non0v464qagpb	cmjeog5gz009lon0v3h4eom6b	cmjeoamyk000uonzsxzrp21v8	2025-12-20 19:14:25.331
cmjeog5qe009ron0v2b9c09pb	cmjeog5qe009pon0vgaa6o6zc	cmjeoamyk000uonzsxzrp21v8	2025-12-20 19:14:25.67
cmjeog5z9009von0vppstu37e	cmjeog5z9009ton0vwv2k4zxy	cmjeoan59000wonzs035jm4zz	2025-12-20 19:14:25.989
cmjeog6b3009zon0vnexbux6u	cmjeog6b2009xon0vlgl00mod	cmjeoan59000wonzs035jm4zz	2025-12-20 19:14:26.415
cmjeog6ke00a3on0vic4ysd05	cmjeog6ke00a1on0vi27v19ka	cmjeoan59000wonzs035jm4zz	2025-12-20 19:14:26.75
cmjeog6t700a7on0vfocwyrmk	cmjeog6t600a5on0v989v8nrf	cmjeoan59000wonzs035jm4zz	2025-12-20 19:14:27.067
cmjeog74t00abon0vsv66c9mx	cmjeog74t00a9on0vsr41x5vm	cmjeoan59000wonzs035jm4zz	2025-12-20 19:14:27.485
cmjeog7e400afon0vnudbfafu	cmjeog7e400adon0vvukafmgb	cmjeoan59000wonzs035jm4zz	2025-12-20 19:14:27.82
cmjeog7n300ajon0vdcyjmavj	cmjeog7n300ahon0v34fn09ii	cmjeoan59000wonzs035jm4zz	2025-12-20 19:14:28.143
cmjeog7yt00anon0v5jkm728d	cmjeog7yt00alon0v56apgimf	cmjeoan59000wonzs035jm4zz	2025-12-20 19:14:28.565
cmjeog8a400aron0vxj34d9oh	cmjeog8a400apon0v23nh6mgs	cmjeoan9p000yonzsc3zablej	2025-12-20 19:14:28.973
cmjeog8k900avon0vthm47ohq	cmjeog8k900aton0vjy3ob05v	cmjeoan9p000yonzsc3zablej	2025-12-20 19:14:29.308
cmjeog8ta00azon0vs4i1gs68	cmjeog8ta00axon0vvmlx7xwf	cmjeoan9p000yonzsc3zablej	2025-12-20 19:14:29.662
cmjeog94p00b3on0vvq1e5drl	cmjeog94p00b1on0v65lxzbyx	cmjeoan9p000yonzsc3zablej	2025-12-20 19:14:30.073
\.


--
-- Data for Name: student_recommendations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_recommendations (id, "studentId", "assessmentId", summary, "schoolStrategies", "classroomAccommodations", "parentNextSteps", "referralGuidance", "generatedAt", "generatedBy") FROM stdin;
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (id, "districtId", "schoolId", "anonymousId", "firstName", "lastName", "gradeLevel", "birthDate", "consentGiven", "consentDate", "isAnonymous", "isActive", "createdAt", "updatedAt") FROM stdin;
cmjeoapxj0014onzsg6r38van	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-53A82375	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:11.911	2025-12-20 19:10:11.911
cmjeoaq6t0018onzsfyoavwzp	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-495EADAA	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:12.245	2025-12-20 19:10:12.245
cmjeoaqh1001conzsjdiwwgxh	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-4C9F74BB	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:12.613	2025-12-20 19:10:12.613
cmjeoaqri001gonzsrowo44o3	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-17AA243E	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:12.991	2025-12-20 19:10:12.991
cmjeoar07001konzsbzysutl6	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-D951CD28	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:13.303	2025-12-20 19:10:13.303
cmjeoarba001oonzswn7rd7s4	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-411DCEF3	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:13.703	2025-12-20 19:10:13.703
cmjeoarmd001sonzsnjqcbjlb	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-66D67DE2	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:14.101	2025-12-20 19:10:14.101
cmjeoarum001wonzs802z0j1o	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-F3CE0735	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:14.398	2025-12-20 19:10:14.398
cmjeoas4y0020onzs978c8n3w	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-6435A799	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:14.77	2025-12-20 19:10:14.77
cmjeoasfm0024onzsqxp2qg4e	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-03F553E9	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:15.154	2025-12-20 19:10:15.154
cmjeoasnx0028onzs48q6xkzi	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-4895B24B	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:15.453	2025-12-20 19:10:15.453
cmjeoasyw002conzsc21fmd35	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-130A5E01	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:15.849	2025-12-20 19:10:15.849
cmjeoat9j002gonzse4ap8tgp	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-395E56D7	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:16.232	2025-12-20 19:10:16.232
cmjeoatju002konzstubnwrbe	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-674AD02E	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:16.602	2025-12-20 19:10:16.602
cmjeoatrw002oonzsqsgdoj95	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-5BC38C29	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:16.893	2025-12-20 19:10:16.893
cmjeoau2l002sonzs9j2mjb6y	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-96C1377C	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:17.278	2025-12-20 19:10:17.278
cmjeoaucw002wonzsbgqv3l1q	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-6A23402D	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:17.648	2025-12-20 19:10:17.648
cmjeoaum10030onzs49z6o8tn	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-B9F9D281	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:17.977	2025-12-20 19:10:17.977
cmjeoauwu0034onzstq0ul8vt	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-0BF01D59	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:18.367	2025-12-20 19:10:18.367
cmjeoav7x0038onzswof0solu	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-E56639D6	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:18.765	2025-12-20 19:10:18.765
cmjeoavkk003conzsoclwltfh	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-0217952D	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:19.221	2025-12-20 19:10:19.221
cmjeoavus003gonzsq62by5k2	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-AD5FEA23	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:19.589	2025-12-20 19:10:19.589
cmjeoaw5m003konzsolm9vd2p	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-89954CFB	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:19.978	2025-12-20 19:10:19.978
cmjeoawgi003oonzs8j1ld3fz	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-F5CCB2F5	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:20.37	2025-12-20 19:10:20.37
cmjeoawsa003sonzshea23ib6	cmjeoakhr0002onzs7p8vf7p1	cmjeoaksf0004onzsiawkc7c4	STU-C3CD3FD3	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:10:20.794	2025-12-20 19:10:20.794
cmjeofli30001on0vpwhzem9s	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0001	\N	\N	4	\N	f	\N	t	t	2025-12-20 19:13:59.45	2025-12-20 19:13:59.45
cmjeoflp60005on0vgzqzyonb	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0002	\N	\N	3	\N	f	\N	t	t	2025-12-20 19:13:59.706	2025-12-20 19:13:59.706
cmjeofly50009on0vqz5hj179	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0003	\N	\N	7	\N	f	\N	t	t	2025-12-20 19:14:00.029	2025-12-20 19:14:00.029
cmjeofm5b000don0vp3yizlab	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0004	\N	\N	4	\N	f	\N	t	t	2025-12-20 19:14:00.287	2025-12-20 19:14:00.287
cmjeofmea000hon0vg5s8rxoq	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0005	\N	\N	10	\N	f	\N	t	t	2025-12-20 19:14:00.61	2025-12-20 19:14:00.61
cmjeofml3000lon0vk0wyrhe0	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0006	\N	\N	11	\N	f	\N	t	t	2025-12-20 19:14:00.855	2025-12-20 19:14:00.855
cmjeofmua000pon0ve3knxyik	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0007	\N	\N	7	\N	f	\N	t	t	2025-12-20 19:14:01.186	2025-12-20 19:14:01.186
cmjeofn3m000ton0vu75et85y	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0008	\N	\N	10	\N	f	\N	t	t	2025-12-20 19:14:01.523	2025-12-20 19:14:01.523
cmjeofnaj000xon0v4tysbmph	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0009	\N	\N	8	\N	f	\N	t	t	2025-12-20 19:14:01.771	2025-12-20 19:14:01.771
cmjeofnjn0011on0v10v0p338	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0010	\N	\N	10	\N	f	\N	t	t	2025-12-20 19:14:02.099	2025-12-20 19:14:02.099
cmjeofnqm0015on0vh8nk8f6i	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0011	\N	\N	3	\N	f	\N	t	t	2025-12-20 19:14:02.351	2025-12-20 19:14:02.351
cmjeofnzn0019on0vjt5tpqlb	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0012	\N	\N	10	\N	f	\N	t	t	2025-12-20 19:14:02.676	2025-12-20 19:14:02.676
cmjeofo6g001don0vrboys6ye	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0013	\N	\N	3	\N	f	\N	t	t	2025-12-20 19:14:02.92	2025-12-20 19:14:02.92
cmjeofog1001hon0v3a3c59bs	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0014	\N	\N	3	\N	f	\N	t	t	2025-12-20 19:14:03.265	2025-12-20 19:14:03.265
cmjeofon3001lon0vnpzkff0i	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0015	\N	\N	4	\N	f	\N	t	t	2025-12-20 19:14:03.52	2025-12-20 19:14:03.52
cmjeofowl001pon0v7w55lr2a	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0016	\N	\N	9	\N	f	\N	t	t	2025-12-20 19:14:03.861	2025-12-20 19:14:03.861
cmjeofp5y001ton0v23vr1h12	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0017	\N	\N	4	\N	f	\N	t	t	2025-12-20 19:14:04.198	2025-12-20 19:14:04.198
cmjeofpcy001xon0v1fydudtr	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0018	\N	\N	6	\N	f	\N	t	t	2025-12-20 19:14:04.45	2025-12-20 19:14:04.45
cmjeofpm70021on0vwg7qjcf3	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0019	\N	\N	3	\N	f	\N	t	t	2025-12-20 19:14:04.784	2025-12-20 19:14:04.784
cmjeofpt50025on0vyetg0b8l	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0020	\N	\N	6	\N	f	\N	t	t	2025-12-20 19:14:05.033	2025-12-20 19:14:05.033
cmjeofq2a0029on0vlob4ok5n	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0021	\N	\N	10	\N	f	\N	t	t	2025-12-20 19:14:05.362	2025-12-20 19:14:05.362
cmjeofq9b002don0v11kmcarz	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0022	\N	\N	3	\N	f	\N	t	t	2025-12-20 19:14:05.615	2025-12-20 19:14:05.615
cmjeofqhy002hon0vvkg5opys	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0023	\N	\N	6	\N	f	\N	t	t	2025-12-20 19:14:05.926	2025-12-20 19:14:05.926
cmjeofqr8002lon0vlu94izam	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0024	\N	\N	4	\N	f	\N	t	t	2025-12-20 19:14:06.26	2025-12-20 19:14:06.26
cmjeofqyi002pon0vwyka7dab	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0025	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:14:06.523	2025-12-20 19:14:06.523
cmjeofr89002ton0v4lkf4o5o	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0026	\N	\N	4	\N	f	\N	t	t	2025-12-20 19:14:06.873	2025-12-20 19:14:06.873
cmjeofrf8002xon0vea90dz3h	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0027	\N	\N	8	\N	f	\N	t	t	2025-12-20 19:14:07.125	2025-12-20 19:14:07.125
cmjeofroi0031on0vyefht9ho	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0028	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:14:07.458	2025-12-20 19:14:07.458
cmjeofrvh0035on0vg72mjfbr	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0029	\N	\N	2	\N	f	\N	t	t	2025-12-20 19:14:07.709	2025-12-20 19:14:07.709
cmjeofs4g0039on0vr7wfo434	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0030	\N	\N	10	\N	f	\N	t	t	2025-12-20 19:14:08.032	2025-12-20 19:14:08.032
cmjeofsdl003don0vm9u0554h	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0031	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:14:08.361	2025-12-20 19:14:08.361
cmjeofskk003hon0vuf1vn3z3	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0032	\N	\N	K	\N	f	\N	t	t	2025-12-20 19:14:08.612	2025-12-20 19:14:08.612
cmjeofstm003lon0vaxfe37wv	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0033	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:14:08.938	2025-12-20 19:14:08.938
cmjeoft0n003pon0vbk8cgqu5	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0034	\N	\N	K	\N	f	\N	t	t	2025-12-20 19:14:09.192	2025-12-20 19:14:09.192
cmjeoft9x003ton0vsxr2u1bw	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0035	\N	\N	8	\N	f	\N	t	t	2025-12-20 19:14:09.525	2025-12-20 19:14:09.525
cmjeoftgz003xon0v0t45aisj	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0036	\N	\N	3	\N	f	\N	t	t	2025-12-20 19:14:09.779	2025-12-20 19:14:09.779
cmjeoftps0041on0v27rnccxv	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0037	\N	\N	3	\N	f	\N	t	t	2025-12-20 19:14:10.096	2025-12-20 19:14:10.096
cmjeoftz20045on0vubhrgfmc	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0038	\N	\N	7	\N	f	\N	t	t	2025-12-20 19:14:10.431	2025-12-20 19:14:10.431
cmjeofu640049on0v838d9yve	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0039	\N	\N	12	\N	f	\N	t	t	2025-12-20 19:14:10.685	2025-12-20 19:14:10.685
cmjeofuf9004don0vrfyocpz9	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0040	\N	\N	6	\N	f	\N	t	t	2025-12-20 19:14:11.013	2025-12-20 19:14:11.013
cmjeofume004hon0vrsu37url	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0041	\N	\N	12	\N	f	\N	t	t	2025-12-20 19:14:11.27	2025-12-20 19:14:11.27
cmjeofuvr004lon0v7l68zy50	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0042	\N	\N	12	\N	f	\N	t	t	2025-12-20 19:14:11.607	2025-12-20 19:14:11.607
cmjeofv2t004pon0ver8mbolo	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0043	\N	\N	12	\N	f	\N	t	t	2025-12-20 19:14:11.862	2025-12-20 19:14:11.862
cmjeofvcf004ton0vdv67r76c	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0044	\N	\N	7	\N	f	\N	t	t	2025-12-20 19:14:12.207	2025-12-20 19:14:12.207
cmjeofvlb004xon0vcf27qotr	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0045	\N	\N	2	\N	f	\N	t	t	2025-12-20 19:14:12.527	2025-12-20 19:14:12.527
cmjeofvs90051on0v5gwhkise	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0046	\N	\N	8	\N	f	\N	t	t	2025-12-20 19:14:12.777	2025-12-20 19:14:12.777
cmjeofw1m0055on0v1gdtgxzg	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0047	\N	\N	3	\N	f	\N	t	t	2025-12-20 19:14:13.115	2025-12-20 19:14:13.115
cmjeofw8w0059on0vqxhpdy1g	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0048	\N	\N	6	\N	f	\N	t	t	2025-12-20 19:14:13.376	2025-12-20 19:14:13.376
cmjeofwij005don0vjjj7tqxe	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0049	\N	\N	4	\N	f	\N	t	t	2025-12-20 19:14:13.724	2025-12-20 19:14:13.724
cmjeofwq8005hon0vzvbl7cfx	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0050	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:14:13.974	2025-12-20 19:14:13.974
cmjeofwz8005lon0vx29tecvd	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0051	\N	\N	1	\N	f	\N	t	t	2025-12-20 19:14:14.324	2025-12-20 19:14:14.324
cmjeofx8d005pon0veucrs6i7	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0052	\N	\N	11	\N	f	\N	t	t	2025-12-20 19:14:14.654	2025-12-20 19:14:14.654
cmjeofxfa005ton0vb28vrh1e	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0053	\N	\N	4	\N	f	\N	t	t	2025-12-20 19:14:14.902	2025-12-20 19:14:14.902
cmjeofxoj005xon0v6knv9d1q	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0054	\N	\N	8	\N	f	\N	t	t	2025-12-20 19:14:15.235	2025-12-20 19:14:15.235
cmjeofxvp0061on0vgzzwik50	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0055	\N	\N	2	\N	f	\N	t	t	2025-12-20 19:14:15.493	2025-12-20 19:14:15.493
cmjeofy4k0065on0v4acvwl9m	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0056	\N	\N	8	\N	f	\N	t	t	2025-12-20 19:14:15.812	2025-12-20 19:14:15.812
cmjeofybl0069on0vuwuqb436	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0057	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:14:16.065	2025-12-20 19:14:16.065
cmjeofykx006don0voys0hvcw	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0058	\N	\N	4	\N	f	\N	t	t	2025-12-20 19:14:16.401	2025-12-20 19:14:16.401
cmjeofytt006hon0vkoywebgv	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0059	\N	\N	2	\N	f	\N	t	t	2025-12-20 19:14:16.721	2025-12-20 19:14:16.721
cmjeofz12006lon0v7xt1uizi	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0060	\N	\N	K	\N	f	\N	t	t	2025-12-20 19:14:16.983	2025-12-20 19:14:16.983
cmjeofzaa006pon0vak7k00f6	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0061	\N	\N	4	\N	f	\N	t	t	2025-12-20 19:14:17.314	2025-12-20 19:14:17.314
cmjeofzhh006ton0voqtpeok6	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0062	\N	\N	3	\N	f	\N	t	t	2025-12-20 19:14:17.574	2025-12-20 19:14:17.574
cmjeofzqw006xon0v3i0l5hbw	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0063	\N	\N	8	\N	f	\N	t	t	2025-12-20 19:14:17.913	2025-12-20 19:14:17.913
cmjeofzxp0071on0vgvohdcn6	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0064	\N	\N	11	\N	f	\N	t	t	2025-12-20 19:14:18.157	2025-12-20 19:14:18.157
cmjeog06y0075on0v9rkwz6j5	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0065	\N	\N	7	\N	f	\N	t	t	2025-12-20 19:14:18.49	2025-12-20 19:14:18.49
cmjeog0g20079on0v5u5zuiye	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0066	\N	\N	12	\N	f	\N	t	t	2025-12-20 19:14:18.818	2025-12-20 19:14:18.818
cmjeog0n2007don0vnze3xer4	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0067	\N	\N	4	\N	f	\N	t	t	2025-12-20 19:14:19.07	2025-12-20 19:14:19.07
cmjeog0wb007hon0vwbueywh1	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0068	\N	\N	12	\N	f	\N	t	t	2025-12-20 19:14:19.403	2025-12-20 19:14:19.403
cmjeog13y007lon0vua47c4gj	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0069	\N	\N	3	\N	f	\N	t	t	2025-12-20 19:14:19.679	2025-12-20 19:14:19.679
cmjeog1d6007pon0vzlr6kngf	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0070	\N	\N	10	\N	f	\N	t	t	2025-12-20 19:14:20.01	2025-12-20 19:14:20.01
cmjeog1k8007ton0vb6wm8loi	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0071	\N	\N	9	\N	f	\N	t	t	2025-12-20 19:14:20.264	2025-12-20 19:14:20.264
cmjeog1tb007xon0veinn6x9i	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0072	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:14:20.591	2025-12-20 19:14:20.591
cmjeog22a0081on0v7kmaliq1	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0073	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:14:20.915	2025-12-20 19:14:20.915
cmjeog29d0085on0vizyggju4	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0074	\N	\N	K	\N	f	\N	t	t	2025-12-20 19:14:21.17	2025-12-20 19:14:21.17
cmjeog2il0089on0vdk2m2mqb	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0075	\N	\N	9	\N	f	\N	t	t	2025-12-20 19:14:21.501	2025-12-20 19:14:21.501
cmjeog2px008don0vff4dqfbw	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0076	\N	\N	8	\N	f	\N	t	t	2025-12-20 19:14:21.765	2025-12-20 19:14:21.765
cmjeog2zc008hon0vvwvt7688	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0077	\N	\N	3	\N	f	\N	t	t	2025-12-20 19:14:22.104	2025-12-20 19:14:22.104
cmjeog36s008lon0vg5qbtymf	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0078	\N	\N	9	\N	f	\N	t	t	2025-12-20 19:14:22.372	2025-12-20 19:14:22.372
cmjeog3gn008pon0vnoeeh73a	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0079	\N	\N	11	\N	f	\N	t	t	2025-12-20 19:14:22.727	2025-12-20 19:14:22.727
cmjeog3q2008ton0vg5lm998y	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0080	\N	\N	K	\N	f	\N	t	t	2025-12-20 19:14:23.067	2025-12-20 19:14:23.067
cmjeog3wz008xon0vx4avdazk	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0081	\N	\N	2	\N	f	\N	t	t	2025-12-20 19:14:23.316	2025-12-20 19:14:23.316
cmjeog4690091on0v2o6vkki2	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0082	\N	\N	9	\N	f	\N	t	t	2025-12-20 19:14:23.65	2025-12-20 19:14:23.65
cmjeog4d20095on0vuoytnd42	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0083	\N	\N	7	\N	f	\N	t	t	2025-12-20 19:14:23.894	2025-12-20 19:14:23.894
cmjeog4me0099on0vvb2yvrkm	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0084	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:14:24.23	2025-12-20 19:14:24.23
cmjeog4wa009don0vconlvv9g	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0085	\N	\N	K	\N	f	\N	t	t	2025-12-20 19:14:24.587	2025-12-20 19:14:24.587
cmjeog55g009hon0vk7rldhrk	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0086	\N	\N	11	\N	f	\N	t	t	2025-12-20 19:14:24.916	2025-12-20 19:14:24.916
cmjeog5gz009lon0v3h4eom6b	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0087	\N	\N	9	\N	f	\N	t	t	2025-12-20 19:14:25.331	2025-12-20 19:14:25.331
cmjeog5qe009pon0vgaa6o6zc	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0088	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:14:25.67	2025-12-20 19:14:25.67
cmjeog5z9009ton0vwv2k4zxy	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0089	\N	\N	9	\N	f	\N	t	t	2025-12-20 19:14:25.989	2025-12-20 19:14:25.989
cmjeog6b2009xon0vlgl00mod	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0090	\N	\N	7	\N	f	\N	t	t	2025-12-20 19:14:26.415	2025-12-20 19:14:26.415
cmjeog6ke00a1on0vi27v19ka	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0091	\N	\N	1	\N	f	\N	t	t	2025-12-20 19:14:26.75	2025-12-20 19:14:26.75
cmjeog6t600a5on0v989v8nrf	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0092	\N	\N	4	\N	f	\N	t	t	2025-12-20 19:14:27.067	2025-12-20 19:14:27.067
cmjeog74t00a9on0vsr41x5vm	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0093	\N	\N	11	\N	f	\N	t	t	2025-12-20 19:14:27.485	2025-12-20 19:14:27.485
cmjeog7e400adon0vvukafmgb	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0094	\N	\N	8	\N	f	\N	t	t	2025-12-20 19:14:27.82	2025-12-20 19:14:27.82
cmjeog7n300ahon0v34fn09ii	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0095	\N	\N	K	\N	f	\N	t	t	2025-12-20 19:14:28.143	2025-12-20 19:14:28.143
cmjeog7yt00alon0v56apgimf	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0096	\N	\N	1	\N	f	\N	t	t	2025-12-20 19:14:28.565	2025-12-20 19:14:28.565
cmjeog8a400apon0v23nh6mgs	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0097	\N	\N	8	\N	f	\N	t	t	2025-12-20 19:14:28.973	2025-12-20 19:14:28.973
cmjeog8k900aton0vjy3ob05v	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0098	\N	\N	4	\N	f	\N	t	t	2025-12-20 19:14:29.308	2025-12-20 19:14:29.308
cmjeog8ta00axon0vvmlx7xwf	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0099	\N	\N	12	\N	f	\N	t	t	2025-12-20 19:14:29.662	2025-12-20 19:14:29.662
cmjeog94p00b1on0v65lxzbyx	cmjeoakhr0002onzs7p8vf7p1	\N	STU-0100	\N	\N	5	\N	f	\N	t	t	2025-12-20 19:14:30.073	2025-12-20 19:14:30.073
\.


--
-- Data for Name: sub_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sub_accounts (id, "userId", "managedByUserId", "organizationId", "displayName", description, "maxAssessments", "maxUsers", settings, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, "organizationId", "stripeSubscriptionId", "stripeCustomerId", status, "priceId", quantity, "currentPeriodStart", "currentPeriodEnd", "trialStart", "trialEnd", "cancelAtPeriodEnd", "cancelAt", "canceledAt", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: teacher_classrooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teacher_classrooms (id, "teacherId", "classroomId", "isPrimary", "assignedAt") FROM stdin;
cmjeomvnc0003onnpak9ipob7	cmjeomvcn0001onnpzsc6ix6a	cmjeoalon000gonzsfbaqpv3n	t	2025-12-20 19:19:39.192
\.


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teachers (id, "userId", "districtId", "employeeId", "isActive", "createdAt", "updatedAt") FROM stdin;
cmjeomvcn0001onnpzsc6ix6a	ad6660e1-309b-4e39-a439-3384df2b78bd	cmjeoakhr0002onzs7p8vf7p1	TCH-001	t	2025-12-20 19:19:38.807	2025-12-20 19:19:38.807
\.


--
-- Data for Name: telemetry_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.telemetry_events (id, user_id, event, metadata, "createdAt", "userId") FROM stdin;
2359ccc4-b264-41ce-b368-169d86d772c7	\N	billing.view	{"tab": "plan", "plan": "unknown"}	2025-12-20 19:23:41.289	d778315f-3864-444c-87a8-74f322d0dad8
2f9981ec-4167-40e6-9664-1ef44bb2cc14	\N	billing.view	{"tab": "plan", "plan": "unknown"}	2025-12-20 19:23:41.385	d778315f-3864-444c-87a8-74f322d0dad8
321e28f0-a660-4942-a265-f5bb284bac68	\N	billing.view	{"tab": "plan", "plan": "free"}	2025-12-20 19:23:43.256	d778315f-3864-444c-87a8-74f322d0dad8
d937dce3-d000-412f-90ed-6177a7de9ce6	\N	upsell.panel_view	{"plan": "free", "remaining": 0, "childrenCount": 0}	2025-12-20 19:29:12.438	7a79e16b-242f-4a34-b660-45d76273807a
327d2b71-c391-4d53-a980-c37ba2c79ff7	\N	upsell.panel_view	{"plan": "free", "remaining": 0, "childrenCount": 0}	2025-12-20 19:29:12.44	7a79e16b-242f-4a34-b660-45d76273807a
dd5f5767-81f9-4020-9b6c-3804ba47a682	\N	upsell.panel_view	{"plan": "free", "remaining": 0, "childrenCount": 0}	2025-12-20 19:29:12.463	7a79e16b-242f-4a34-b660-45d76273807a
2f02ce95-b775-4b7b-9f9b-21d086218139	\N	upsell.panel_view	{"plan": "free", "remaining": 0, "childrenCount": 0}	2025-12-20 19:29:12.621	7a79e16b-242f-4a34-b660-45d76273807a
94f8df1e-61ee-498b-8824-ed5b3a695556	\N	upsell.panel_view	{"plan": "free", "remaining": 0, "childrenCount": 0}	2025-12-20 19:29:40.142	7a79e16b-242f-4a34-b660-45d76273807a
60178337-72f0-4a09-92b0-dfcecab79b88	\N	upsell.panel_view	{"plan": "free", "remaining": 0, "childrenCount": 0}	2025-12-20 19:29:40.563	7a79e16b-242f-4a34-b660-45d76273807a
6b60b40d-8c75-475a-9732-f75b87cc3e11	\N	upsell.panel_view	{"plan": "free", "remaining": 0, "childrenCount": 0}	2025-12-20 19:29:40.715	7a79e16b-242f-4a34-b660-45d76273807a
40720c36-ca94-4a1a-89b4-48fead104131	\N	upsell.panel_view	{"plan": "free", "remaining": 0, "childrenCount": 0}	2025-12-20 19:29:40.727	7a79e16b-242f-4a34-b660-45d76273807a
\.


--
-- Data for Name: termination_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.termination_rules (id, "questionSetId", name, description, "minimumYesToContinue", "checkAfterQuestion", "isActive", "createdAt") FROM stdin;
\.


--
-- Data for Name: usage_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usage_metrics (id, "userId", date, assessments, "pdfReports", "apiCalls") FROM stdin;
\.


--
-- Data for Name: user_licenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_licenses (id, "userId", "licenseId", "assignedAt", "assignedBy", "isActive", "assessmentsAllowed", "assessmentsUsed", "conversationalReportsAllowed", "conversationalReportsUsed", "lastCreditsRefreshedAt") FROM stdin;
\.


--
-- Data for Name: user_upsell_state; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_upsell_state (id, "userId", "ribbonSnoozedUntil", "ribbonSnoozedAt", "ribbonSnoozeSource", "anonymousModeDefault", "pausedUntil", "pausedAt", "pauseCount12m", "pauseHistory", "pendingAction", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, name, password, role, "createdAt", "updatedAt", "isActive", "lastLoginAt", "firstPaidReportAt", "organizationId", "parentUserId", "onboardingCompleted", "onboardingStep", "onboardingSkipped", "stripeCustomerId", "avatarUrl", "emailVerified", "emailVerificationToken", "emailVerificationTokenExpiresAt", "pendingEmail", credits, "isDeactivated", "deactivatedAt", "deletionRequestedAt") FROM stdin;
694b92f6-5540-45b0-bc7a-a7ff5f1e9a30	admin@test.com	District Administrator	managed_by_supabase	DISTRICT_ADMIN	2025-12-20 19:10:10.4	2025-12-20 19:10:10.4	t	\N	\N	cmjeoak8u0000onzshk0xg7km	\N	f	0	f	\N	\N	t	\N	\N	\N	0	f	\N	\N
d778315f-3864-444c-87a8-74f322d0dad8	district@test.com	District Administrator	managed_by_supabase	DISTRICT_ADMIN	2025-12-20 19:19:38.32	2025-12-20 19:19:38.32	t	\N	\N	cmjeoak8u0000onzshk0xg7km	\N	f	0	f	\N	\N	t	\N	\N	\N	0	f	\N	\N
ad6660e1-309b-4e39-a439-3384df2b78bd	teacher@test.com	Sample Teacher	managed_by_supabase	TEACHER	2025-12-20 19:19:38.655	2025-12-20 19:19:38.655	t	\N	\N	cmjeoak8u0000onzshk0xg7km	\N	f	0	f	\N	\N	t	\N	\N	\N	0	f	\N	\N
7a79e16b-242f-4a34-b660-45d76273807a	tjhixon@gmail.com	Jack Hixon	managed_by_supabase	SUPER_ADMIN	2025-12-20 19:28:39.993	2025-12-20 19:29:20.045	t	\N	\N	\N	\N	f	0	f	\N	\N	t	\N	\N	\N	0	f	\N	\N
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-10-06 11:22:50
20211116045059	2025-10-06 11:22:52
20211116050929	2025-10-06 11:22:55
20211116051442	2025-10-06 11:22:57
20211116212300	2025-10-06 11:22:59
20211116213355	2025-10-06 11:23:01
20211116213934	2025-10-06 11:23:03
20211116214523	2025-10-06 11:23:06
20211122062447	2025-10-06 11:23:08
20211124070109	2025-10-06 11:23:11
20211202204204	2025-10-06 11:23:13
20211202204605	2025-10-06 11:23:15
20211210212804	2025-10-06 11:23:22
20211228014915	2025-10-06 11:23:24
20220107221237	2025-10-06 11:23:26
20220228202821	2025-10-06 11:23:28
20220312004840	2025-10-06 11:23:30
20220603231003	2025-10-06 11:23:34
20220603232444	2025-10-06 11:23:36
20220615214548	2025-10-06 11:23:38
20220712093339	2025-10-06 11:23:40
20220908172859	2025-10-06 11:23:42
20220916233421	2025-10-06 11:23:44
20230119133233	2025-10-06 11:23:47
20230128025114	2025-10-06 11:23:50
20230128025212	2025-10-06 11:23:52
20230227211149	2025-10-06 11:23:54
20230228184745	2025-10-06 11:23:56
20230308225145	2025-10-06 11:23:58
20230328144023	2025-10-06 11:24:00
20231018144023	2025-10-06 11:24:03
20231204144023	2025-10-06 11:24:06
20231204144024	2025-10-06 11:24:08
20231204144025	2025-10-06 11:24:10
20240108234812	2025-10-06 11:24:12
20240109165339	2025-10-06 11:24:14
20240227174441	2025-10-06 11:24:18
20240311171622	2025-10-06 11:24:21
20240321100241	2025-10-06 11:24:26
20240401105812	2025-10-06 11:24:31
20240418121054	2025-10-06 11:24:34
20240523004032	2025-10-06 11:24:42
20240618124746	2025-10-06 11:24:44
20240801235015	2025-10-06 11:24:46
20240805133720	2025-10-06 11:24:48
20240827160934	2025-10-06 11:24:50
20240919163303	2025-10-06 11:24:53
20240919163305	2025-10-06 11:24:55
20241019105805	2025-10-06 11:24:58
20241030150047	2025-10-06 11:25:05
20241108114728	2025-10-06 11:25:08
20241121104152	2025-10-06 11:25:11
20241130184212	2025-10-06 11:25:13
20241220035512	2025-10-06 11:25:15
20241220123912	2025-10-06 11:25:17
20241224161212	2025-10-06 11:25:19
20250107150512	2025-10-06 11:25:21
20250110162412	2025-10-06 11:25:24
20250123174212	2025-10-06 11:25:26
20250128220012	2025-10-06 11:25:28
20250506224012	2025-10-06 11:25:29
20250523164012	2025-10-06 11:25:31
20250714121412	2025-10-06 11:25:34
20250905041441	2025-10-06 11:25:36
20251103001201	2025-12-20 16:03:19
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
backup	backup	\N	2025-10-22 17:16:16.159336+00	2025-10-22 17:16:16.159336+00	f	f	\N	\N	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-10-06 11:22:47.766383
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-10-06 11:22:47.786392
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-10-06 11:22:47.790398
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-10-06 11:22:47.816107
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-10-06 11:22:47.852442
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-10-06 11:22:47.856489
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-10-06 11:22:47.865707
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-10-06 11:22:47.869513
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-10-06 11:22:47.878378
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-10-06 11:22:47.882135
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-10-06 11:22:47.885944
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-10-06 11:22:47.889759
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-10-06 11:22:47.907103
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-10-06 11:22:47.9108
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-10-06 11:22:47.914738
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-10-06 11:22:47.936143
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-10-06 11:22:47.940621
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-10-06 11:22:47.943978
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-10-06 11:22:47.947868
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-10-06 11:22:47.952655
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-10-06 11:22:47.956083
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-10-06 11:22:47.962557
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-10-06 11:22:47.977965
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-10-06 11:22:47.992909
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-10-06 11:22:47.996927
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-10-06 11:22:48.002977
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-10-06 11:22:48.007118
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-10-06 11:22:48.019946
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-10-06 11:22:50.79675
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-10-06 11:22:50.81819
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-10-06 11:22:50.849776
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-10-06 11:22:50.861186
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-10-06 11:22:50.890699
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-10-06 11:22:50.898596
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-10-06 11:22:50.901032
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-10-06 11:22:50.907194
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-10-06 11:22:50.946384
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-10-06 11:22:50.962061
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-10-06 11:22:50.969401
39	add-search-v2-sort-support	39cf7d1e6bf515f4b02e41237aba845a7b492853	2025-10-06 11:22:50.977412
40	fix-prefix-race-conditions-optimized	fd02297e1c67df25a9fc110bf8c8a9af7fb06d1f	2025-10-06 11:22:50.982625
41	add-object-level-update-trigger	44c22478bf01744b2129efc480cd2edc9a7d60e9	2025-10-06 11:22:51.001662
42	rollback-prefix-triggers	f2ab4f526ab7f979541082992593938c05ee4b47	2025-10-06 11:22:51.013099
43	fix-object-level	ab837ad8f1c7d00cc0b7310e989a23388ff29fc6	2025-10-06 11:22:51.019865
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2025-12-20 16:03:20.150931
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2025-12-20 16:03:20.161447
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2025-12-20 16:03:20.226611
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2025-12-20 16:03:20.230871
48	iceberg-catalog-ids	2666dff93346e5d04e0a878416be1d5fec345d6f	2025-12-20 16:03:20.233756
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2025-12-20 16:03:20.266755
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 304, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: AffiliateAttribution AffiliateAttribution_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AffiliateAttribution"
    ADD CONSTRAINT "AffiliateAttribution_pkey" PRIMARY KEY (id);


--
-- Name: AffiliateClick AffiliateClick_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AffiliateClick"
    ADD CONSTRAINT "AffiliateClick_pkey" PRIMARY KEY (id);


--
-- Name: AffiliateCommission AffiliateCommission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AffiliateCommission"
    ADD CONSTRAINT "AffiliateCommission_pkey" PRIMARY KEY (id);


--
-- Name: AffiliateNotificationPreferences AffiliateNotificationPreferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AffiliateNotificationPreferences"
    ADD CONSTRAINT "AffiliateNotificationPreferences_pkey" PRIMARY KEY (id);


--
-- Name: AffiliatePayoutPreferences AffiliatePayoutPreferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AffiliatePayoutPreferences"
    ADD CONSTRAINT "AffiliatePayoutPreferences_pkey" PRIMARY KEY (id);


--
-- Name: AffiliatePayout AffiliatePayout_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AffiliatePayout"
    ADD CONSTRAINT "AffiliatePayout_pkey" PRIMARY KEY (id);


--
-- Name: AffiliateReferrer AffiliateReferrer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AffiliateReferrer"
    ADD CONSTRAINT "AffiliateReferrer_pkey" PRIMARY KEY (id);


--
-- Name: AuthorizationCode AuthorizationCode_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuthorizationCode"
    ADD CONSTRAINT "AuthorizationCode_pkey" PRIMARY KEY (code);


--
-- Name: BannedDevice BannedDevice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BannedDevice"
    ADD CONSTRAINT "BannedDevice_pkey" PRIMARY KEY ("deviceId");


--
-- Name: BannedEmail BannedEmail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BannedEmail"
    ADD CONSTRAINT "BannedEmail_pkey" PRIMARY KEY (email);


--
-- Name: BannedUser BannedUser_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BannedUser"
    ADD CONSTRAINT "BannedUser_pkey" PRIMARY KEY ("userId");


--
-- Name: ChatGPTAssessmentResult ChatGPTAssessmentResult_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatGPTAssessmentResult"
    ADD CONSTRAINT "ChatGPTAssessmentResult_pkey" PRIMARY KEY (id);


--
-- Name: CreditTransaction CreditTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CreditTransaction"
    ADD CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY (id);


--
-- Name: EmailTemplateVersion EmailTemplateVersion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailTemplateVersion"
    ADD CONSTRAINT "EmailTemplateVersion_pkey" PRIMARY KEY (id);


--
-- Name: EmailTemplate EmailTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailTemplate"
    ADD CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY (id);


--
-- Name: MagicLinkToken MagicLinkToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MagicLinkToken"
    ADD CONSTRAINT "MagicLinkToken_pkey" PRIMARY KEY (email);


--
-- Name: OAuthToken OAuthToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OAuthToken"
    ADD CONSTRAINT "OAuthToken_pkey" PRIMARY KEY (id);


--
-- Name: PDFStyle PDFStyle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PDFStyle"
    ADD CONSTRAINT "PDFStyle_pkey" PRIMARY KEY (id);


--
-- Name: TrialSession TrialSession_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TrialSession"
    ADD CONSTRAINT "TrialSession_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ai_reports ai_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_reports
    ADD CONSTRAINT ai_reports_pkey PRIMARY KEY (id);


--
-- Name: assessment_template_domains assessment_template_domains_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_template_domains
    ADD CONSTRAINT assessment_template_domains_pkey PRIMARY KEY (id);


--
-- Name: assessment_template_versions assessment_template_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_template_versions
    ADD CONSTRAINT assessment_template_versions_pkey PRIMARY KEY (id);


--
-- Name: assessment_templates assessment_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_templates
    ADD CONSTRAINT assessment_templates_pkey PRIMARY KEY (id);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: chat_sessions chat_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);


--
-- Name: child_profiles child_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.child_profiles
    ADD CONSTRAINT child_profiles_pkey PRIMARY KEY (id);


--
-- Name: classrooms classrooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classrooms
    ADD CONSTRAINT classrooms_pkey PRIMARY KEY (id);


--
-- Name: conversational_sessions conversational_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversational_sessions
    ADD CONSTRAINT conversational_sessions_pkey PRIMARY KEY (id);


--
-- Name: conversational_submissions conversational_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversational_submissions
    ADD CONSTRAINT conversational_submissions_pkey PRIMARY KEY (id);


--
-- Name: district_audit_logs district_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.district_audit_logs
    ADD CONSTRAINT district_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (id);


--
-- Name: document_chunks document_chunks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_chunks
    ADD CONSTRAINT document_chunks_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: domain_template_versions domain_template_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domain_template_versions
    ADD CONSTRAINT domain_template_versions_pkey PRIMARY KEY (id);


--
-- Name: domain_templates domain_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domain_templates
    ADD CONSTRAINT domain_templates_pkey PRIMARY KEY (id);


--
-- Name: email_logs email_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_pkey PRIMARY KEY (id);


--
-- Name: feature_flags feature_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feature_flags
    ADD CONSTRAINT feature_flags_pkey PRIMARY KEY (id);


--
-- Name: licenses licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_pkey PRIMARY KEY (id);


--
-- Name: login_tokens login_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_tokens
    ADD CONSTRAINT login_tokens_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: passkey_challenges passkey_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.passkey_challenges
    ADD CONSTRAINT passkey_challenges_pkey PRIMARY KEY (id);


--
-- Name: passkeys passkeys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.passkeys
    ADD CONSTRAINT passkeys_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: platform_settings platform_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_pkey PRIMARY KEY (id);


--
-- Name: question_responses question_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_responses
    ADD CONSTRAINT question_responses_pkey PRIMARY KEY (id);


--
-- Name: question_sets question_sets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_sets
    ADD CONSTRAINT question_sets_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: recommendations recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT recommendations_pkey PRIMARY KEY (id);


--
-- Name: resource_library resource_library_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_library
    ADD CONSTRAINT resource_library_pkey PRIMARY KEY (id);


--
-- Name: schools schools_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_pkey PRIMARY KEY (id);


--
-- Name: scores scores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT scores_pkey PRIMARY KEY (id);


--
-- Name: ses_monthly_totals ses_monthly_totals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ses_monthly_totals
    ADD CONSTRAINT ses_monthly_totals_pkey PRIMARY KEY (id);


--
-- Name: ses_usage ses_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ses_usage
    ADD CONSTRAINT ses_usage_pkey PRIMARY KEY (id);


--
-- Name: shareable_links shareable_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shareable_links
    ADD CONSTRAINT shareable_links_pkey PRIMARY KEY (id);


--
-- Name: snapshot_full_reports snapshot_full_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snapshot_full_reports
    ADD CONSTRAINT snapshot_full_reports_pkey PRIMARY KEY (id);


--
-- Name: snapshot_leads snapshot_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snapshot_leads
    ADD CONSTRAINT snapshot_leads_pkey PRIMARY KEY (id);


--
-- Name: snapshot_orders snapshot_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snapshot_orders
    ADD CONSTRAINT snapshot_orders_pkey PRIMARY KEY (id);


--
-- Name: snapshot_sessions snapshot_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snapshot_sessions
    ADD CONSTRAINT snapshot_sessions_pkey PRIMARY KEY (id);


--
-- Name: snapshot_trials snapshot_trials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snapshot_trials
    ADD CONSTRAINT snapshot_trials_pkey PRIMARY KEY (id);


--
-- Name: student_assessments student_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_assessments
    ADD CONSTRAINT student_assessments_pkey PRIMARY KEY (id);


--
-- Name: student_classrooms student_classrooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_classrooms
    ADD CONSTRAINT student_classrooms_pkey PRIMARY KEY (id);


--
-- Name: student_recommendations student_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_recommendations
    ADD CONSTRAINT student_recommendations_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: sub_accounts sub_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_accounts
    ADD CONSTRAINT sub_accounts_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: teacher_classrooms teacher_classrooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_classrooms
    ADD CONSTRAINT teacher_classrooms_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- Name: telemetry_events telemetry_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telemetry_events
    ADD CONSTRAINT telemetry_events_pkey PRIMARY KEY (id);


--
-- Name: termination_rules termination_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.termination_rules
    ADD CONSTRAINT termination_rules_pkey PRIMARY KEY (id);


--
-- Name: usage_metrics usage_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usage_metrics
    ADD CONSTRAINT usage_metrics_pkey PRIMARY KEY (id);


--
-- Name: user_licenses user_licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_licenses
    ADD CONSTRAINT user_licenses_pkey PRIMARY KEY (id);


--
-- Name: user_upsell_state user_upsell_state_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_upsell_state
    ADD CONSTRAINT user_upsell_state_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: AffiliateAttribution_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AffiliateAttribution_createdAt_idx" ON public."AffiliateAttribution" USING btree ("createdAt");


--
-- Name: AffiliateAttribution_prospectUserId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AffiliateAttribution_prospectUserId_key" ON public."AffiliateAttribution" USING btree ("prospectUserId");


--
-- Name: AffiliateAttribution_refCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AffiliateAttribution_refCode_idx" ON public."AffiliateAttribution" USING btree ("refCode");


--
-- Name: AffiliateClick_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AffiliateClick_createdAt_idx" ON public."AffiliateClick" USING btree ("createdAt");


--
-- Name: AffiliateClick_refCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AffiliateClick_refCode_idx" ON public."AffiliateClick" USING btree ("refCode");


--
-- Name: AffiliateClick_sessionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AffiliateClick_sessionId_idx" ON public."AffiliateClick" USING btree ("sessionId");


--
-- Name: AffiliateCommission_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AffiliateCommission_createdAt_idx" ON public."AffiliateCommission" USING btree ("createdAt");


--
-- Name: AffiliateCommission_holdUntil_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AffiliateCommission_holdUntil_idx" ON public."AffiliateCommission" USING btree ("holdUntil");


--
-- Name: AffiliateCommission_orderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AffiliateCommission_orderId_key" ON public."AffiliateCommission" USING btree ("orderId");


--
-- Name: AffiliateCommission_referrerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AffiliateCommission_referrerId_idx" ON public."AffiliateCommission" USING btree ("referrerId");


--
-- Name: AffiliateCommission_referrerId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AffiliateCommission_referrerId_status_idx" ON public."AffiliateCommission" USING btree ("referrerId", status);


--
-- Name: AffiliateCommission_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AffiliateCommission_status_idx" ON public."AffiliateCommission" USING btree (status);


--
-- Name: AffiliateNotificationPreferences_referrerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AffiliateNotificationPreferences_referrerId_idx" ON public."AffiliateNotificationPreferences" USING btree ("referrerId");


--
-- Name: AffiliateNotificationPreferences_referrerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AffiliateNotificationPreferences_referrerId_key" ON public."AffiliateNotificationPreferences" USING btree ("referrerId");


--
-- Name: AffiliatePayoutPreferences_referrerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AffiliatePayoutPreferences_referrerId_idx" ON public."AffiliatePayoutPreferences" USING btree ("referrerId");


--
-- Name: AffiliatePayoutPreferences_referrerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AffiliatePayoutPreferences_referrerId_key" ON public."AffiliatePayoutPreferences" USING btree ("referrerId");


--
-- Name: AffiliatePayout_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AffiliatePayout_createdAt_idx" ON public."AffiliatePayout" USING btree ("createdAt");


--
-- Name: AffiliatePayout_estimatedArrivalDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AffiliatePayout_estimatedArrivalDate_idx" ON public."AffiliatePayout" USING btree ("estimatedArrivalDate");


--
-- Name: AffiliatePayout_referrerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AffiliatePayout_referrerId_idx" ON public."AffiliatePayout" USING btree ("referrerId");


--
-- Name: AffiliatePayout_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AffiliatePayout_status_idx" ON public."AffiliatePayout" USING btree (status);


--
-- Name: AffiliateReferrer_refCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AffiliateReferrer_refCode_key" ON public."AffiliateReferrer" USING btree ("refCode");


--
-- Name: AffiliateReferrer_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AffiliateReferrer_status_idx" ON public."AffiliateReferrer" USING btree (status);


--
-- Name: AffiliateReferrer_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AffiliateReferrer_userId_key" ON public."AffiliateReferrer" USING btree ("userId");


--
-- Name: AuthorizationCode_clientId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuthorizationCode_clientId_idx" ON public."AuthorizationCode" USING btree ("clientId");


--
-- Name: AuthorizationCode_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuthorizationCode_expiresAt_idx" ON public."AuthorizationCode" USING btree ("expiresAt");


--
-- Name: ChatGPTAssessmentResult_assessmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChatGPTAssessmentResult_assessmentId_idx" ON public."ChatGPTAssessmentResult" USING btree ("assessmentId");


--
-- Name: ChatGPTAssessmentResult_percentile_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChatGPTAssessmentResult_percentile_idx" ON public."ChatGPTAssessmentResult" USING btree (percentile);


--
-- Name: CreditTransaction_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CreditTransaction_createdAt_idx" ON public."CreditTransaction" USING btree ("createdAt");


--
-- Name: CreditTransaction_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CreditTransaction_type_idx" ON public."CreditTransaction" USING btree (type);


--
-- Name: CreditTransaction_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CreditTransaction_userId_idx" ON public."CreditTransaction" USING btree ("userId");


--
-- Name: EmailTemplateVersion_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmailTemplateVersion_createdAt_idx" ON public."EmailTemplateVersion" USING btree ("createdAt");


--
-- Name: EmailTemplateVersion_templateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmailTemplateVersion_templateId_idx" ON public."EmailTemplateVersion" USING btree ("templateId");


--
-- Name: EmailTemplateVersion_templateId_version_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EmailTemplateVersion_templateId_version_key" ON public."EmailTemplateVersion" USING btree ("templateId", version);


--
-- Name: EmailTemplate_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmailTemplate_category_idx" ON public."EmailTemplate" USING btree (category);


--
-- Name: EmailTemplate_createdById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmailTemplate_createdById_idx" ON public."EmailTemplate" USING btree ("createdById");


--
-- Name: EmailTemplate_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmailTemplate_isActive_idx" ON public."EmailTemplate" USING btree ("isActive");


--
-- Name: EmailTemplate_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EmailTemplate_name_key" ON public."EmailTemplate" USING btree (name);


--
-- Name: EmailTemplate_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EmailTemplate_slug_key" ON public."EmailTemplate" USING btree (slug);


--
-- Name: EmailTemplate_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmailTemplate_type_idx" ON public."EmailTemplate" USING btree (type);


--
-- Name: MagicLinkToken_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MagicLinkToken_expiresAt_idx" ON public."MagicLinkToken" USING btree ("expiresAt");


--
-- Name: MagicLinkToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MagicLinkToken_token_key" ON public."MagicLinkToken" USING btree (token);


--
-- Name: MagicLinkToken_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MagicLinkToken_userId_idx" ON public."MagicLinkToken" USING btree ("userId");


--
-- Name: OAuthToken_accessToken_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OAuthToken_accessToken_idx" ON public."OAuthToken" USING btree ("accessToken");


--
-- Name: OAuthToken_accessToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "OAuthToken_accessToken_key" ON public."OAuthToken" USING btree ("accessToken");


--
-- Name: OAuthToken_clientId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OAuthToken_clientId_idx" ON public."OAuthToken" USING btree ("clientId");


--
-- Name: OAuthToken_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OAuthToken_expiresAt_idx" ON public."OAuthToken" USING btree ("expiresAt");


--
-- Name: OAuthToken_refreshToken_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OAuthToken_refreshToken_idx" ON public."OAuthToken" USING btree ("refreshToken");


--
-- Name: OAuthToken_refreshToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "OAuthToken_refreshToken_key" ON public."OAuthToken" USING btree ("refreshToken");


--
-- Name: PDFStyle_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PDFStyle_name_key" ON public."PDFStyle" USING btree (name);


--
-- Name: TrialSession_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TrialSession_createdAt_idx" ON public."TrialSession" USING btree ("createdAt");


--
-- Name: TrialSession_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TrialSession_status_idx" ON public."TrialSession" USING btree (status);


--
-- Name: ai_reports_assessmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ai_reports_assessmentId_idx" ON public.ai_reports USING btree ("assessmentId");


--
-- Name: ai_reports_assessmentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ai_reports_assessmentId_key" ON public.ai_reports USING btree ("assessmentId");


--
-- Name: ai_reports_generatedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ai_reports_generatedAt_idx" ON public.ai_reports USING btree ("generatedAt");


--
-- Name: ai_reports_generatedByUserId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ai_reports_generatedByUserId_idx" ON public.ai_reports USING btree ("generatedByUserId");


--
-- Name: assessment_template_domains_assessmentTemplateId_domainTemp_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "assessment_template_domains_assessmentTemplateId_domainTemp_key" ON public.assessment_template_domains USING btree ("assessmentTemplateId", "domainTemplateId");


--
-- Name: assessment_template_domains_assessmentTemplateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "assessment_template_domains_assessmentTemplateId_idx" ON public.assessment_template_domains USING btree ("assessmentTemplateId");


--
-- Name: assessment_template_domains_domainTemplateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "assessment_template_domains_domainTemplateId_idx" ON public.assessment_template_domains USING btree ("domainTemplateId");


--
-- Name: assessment_template_versions_assessmentTemplateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "assessment_template_versions_assessmentTemplateId_idx" ON public.assessment_template_versions USING btree ("assessmentTemplateId");


--
-- Name: assessment_template_versions_assessmentTemplateId_version_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "assessment_template_versions_assessmentTemplateId_version_key" ON public.assessment_template_versions USING btree ("assessmentTemplateId", version);


--
-- Name: assessment_templates_createdById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "assessment_templates_createdById_idx" ON public.assessment_templates USING btree ("createdById");


--
-- Name: assessment_templates_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "assessment_templates_isActive_idx" ON public.assessment_templates USING btree ("isActive");


--
-- Name: assessment_templates_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX assessment_templates_slug_idx ON public.assessment_templates USING btree (slug);


--
-- Name: assessment_templates_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX assessment_templates_slug_key ON public.assessment_templates USING btree (slug);


--
-- Name: assessments_assessmentTemplateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "assessments_assessmentTemplateId_idx" ON public.assessments USING btree ("assessmentTemplateId");


--
-- Name: assessments_hasEnhancedReport_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "assessments_hasEnhancedReport_idx" ON public.assessments USING btree ("hasEnhancedReport");


--
-- Name: assessments_mode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX assessments_mode_idx ON public.assessments USING btree (mode);


--
-- Name: assessments_sessionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "assessments_sessionId_idx" ON public.assessments USING btree ("sessionId");


--
-- Name: assessments_shortId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "assessments_shortId_idx" ON public.assessments USING btree ("shortId");


--
-- Name: assessments_shortId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "assessments_shortId_key" ON public.assessments USING btree ("shortId");


--
-- Name: assessments_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX assessments_status_idx ON public.assessments USING btree (status);


--
-- Name: assessments_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "assessments_userId_idx" ON public.assessments USING btree ("userId");


--
-- Name: chat_messages_assessmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "chat_messages_assessmentId_idx" ON public.chat_messages USING btree ("assessmentId");


--
-- Name: chat_messages_sessionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "chat_messages_sessionId_idx" ON public.chat_messages USING btree ("sessionId");


--
-- Name: chat_sessions_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX chat_sessions_type_idx ON public.chat_sessions USING btree (type);


--
-- Name: chat_sessions_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "chat_sessions_userId_idx" ON public.chat_sessions USING btree ("userId");


--
-- Name: classrooms_schoolId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "classrooms_schoolId_idx" ON public.classrooms USING btree ("schoolId");


--
-- Name: conversational_sessions_assessmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "conversational_sessions_assessmentId_idx" ON public.conversational_sessions USING btree ("assessmentId");


--
-- Name: conversational_sessions_assessmentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "conversational_sessions_assessmentId_key" ON public.conversational_sessions USING btree ("assessmentId");


--
-- Name: conversational_sessions_isComplete_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "conversational_sessions_isComplete_idx" ON public.conversational_sessions USING btree ("isComplete");


--
-- Name: conversational_sessions_updatedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "conversational_sessions_updatedAt_idx" ON public.conversational_sessions USING btree ("updatedAt");


--
-- Name: conversational_sessions_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "conversational_sessions_userId_idx" ON public.conversational_sessions USING btree ("userId");


--
-- Name: conversational_submissions_questionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "conversational_submissions_questionId_idx" ON public.conversational_submissions USING btree ("questionId");


--
-- Name: conversational_submissions_sessionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "conversational_submissions_sessionId_idx" ON public.conversational_submissions USING btree ("sessionId");


--
-- Name: conversational_submissions_sessionId_questionId_userRespons_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "conversational_submissions_sessionId_questionId_userRespons_key" ON public.conversational_submissions USING btree ("sessionId", "questionId", "userResponse");


--
-- Name: conversational_submissions_submittedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "conversational_submissions_submittedAt_idx" ON public.conversational_submissions USING btree ("submittedAt");


--
-- Name: district_audit_logs_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX district_audit_logs_action_idx ON public.district_audit_logs USING btree (action);


--
-- Name: district_audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "district_audit_logs_createdAt_idx" ON public.district_audit_logs USING btree ("createdAt");


--
-- Name: district_audit_logs_districtId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "district_audit_logs_districtId_idx" ON public.district_audit_logs USING btree ("districtId");


--
-- Name: district_audit_logs_studentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "district_audit_logs_studentId_idx" ON public.district_audit_logs USING btree ("studentId");


--
-- Name: district_audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "district_audit_logs_userId_idx" ON public.district_audit_logs USING btree ("userId");


--
-- Name: districts_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX districts_code_idx ON public.districts USING btree (code);


--
-- Name: districts_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX districts_code_key ON public.districts USING btree (code);


--
-- Name: districts_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "districts_organizationId_idx" ON public.districts USING btree ("organizationId");


--
-- Name: document_chunks_documentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "document_chunks_documentId_idx" ON public.document_chunks USING btree ("documentId");


--
-- Name: document_chunks_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "document_chunks_userId_idx" ON public.document_chunks USING btree ("userId");


--
-- Name: documents_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX documents_category_idx ON public.documents USING btree (category);


--
-- Name: documents_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "documents_userId_idx" ON public.documents USING btree ("userId");


--
-- Name: domain_template_versions_domainTemplateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "domain_template_versions_domainTemplateId_idx" ON public.domain_template_versions USING btree ("domainTemplateId");


--
-- Name: domain_template_versions_domainTemplateId_version_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "domain_template_versions_domainTemplateId_version_key" ON public.domain_template_versions USING btree ("domainTemplateId", version);


--
-- Name: domain_templates_createdById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "domain_templates_createdById_idx" ON public.domain_templates USING btree ("createdById");


--
-- Name: domain_templates_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX domain_templates_slug_idx ON public.domain_templates USING btree (slug);


--
-- Name: domain_templates_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX domain_templates_slug_key ON public.domain_templates USING btree (slug);


--
-- Name: email_logs_emailType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "email_logs_emailType_idx" ON public.email_logs USING btree ("emailType");


--
-- Name: email_logs_recipientEmail_sentAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "email_logs_recipientEmail_sentAt_idx" ON public.email_logs USING btree ("recipientEmail", "sentAt");


--
-- Name: email_logs_sentAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "email_logs_sentAt_idx" ON public.email_logs USING btree ("sentAt");


--
-- Name: email_logs_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX email_logs_status_idx ON public.email_logs USING btree (status);


--
-- Name: email_logs_templateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "email_logs_templateId_idx" ON public.email_logs USING btree ("templateId");


--
-- Name: email_logs_userId_sentAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "email_logs_userId_sentAt_idx" ON public.email_logs USING btree ("userId", "sentAt");


--
-- Name: feature_flags_isEnabled_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "feature_flags_isEnabled_idx" ON public.feature_flags USING btree ("isEnabled");


--
-- Name: feature_flags_key_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX feature_flags_key_idx ON public.feature_flags USING btree (key);


--
-- Name: feature_flags_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX feature_flags_key_key ON public.feature_flags USING btree (key);


--
-- Name: feature_flags_scope_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX feature_flags_scope_idx ON public.feature_flags USING btree (scope);


--
-- Name: licenses_licenseKey_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "licenses_licenseKey_idx" ON public.licenses USING btree ("licenseKey");


--
-- Name: licenses_licenseKey_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "licenses_licenseKey_key" ON public.licenses USING btree ("licenseKey");


--
-- Name: licenses_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX licenses_status_idx ON public.licenses USING btree (status);


--
-- Name: login_tokens_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "login_tokens_expiresAt_idx" ON public.login_tokens USING btree ("expiresAt");


--
-- Name: login_tokens_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX login_tokens_token_idx ON public.login_tokens USING btree (token);


--
-- Name: login_tokens_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX login_tokens_token_key ON public.login_tokens USING btree (token);


--
-- Name: login_tokens_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "login_tokens_userId_idx" ON public.login_tokens USING btree ("userId");


--
-- Name: notification_preferences_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notification_preferences_userId_idx" ON public.notification_preferences USING btree ("userId");


--
-- Name: notification_preferences_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "notification_preferences_userId_key" ON public.notification_preferences USING btree ("userId");


--
-- Name: organizations_customDomain_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "organizations_customDomain_key" ON public.organizations USING btree ("customDomain");


--
-- Name: passkey_challenges_challenge_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX passkey_challenges_challenge_idx ON public.passkey_challenges USING btree (challenge);


--
-- Name: passkey_challenges_challenge_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX passkey_challenges_challenge_key ON public.passkey_challenges USING btree (challenge);


--
-- Name: passkey_challenges_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "passkey_challenges_expiresAt_idx" ON public.passkey_challenges USING btree ("expiresAt");


--
-- Name: passkey_challenges_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "passkey_challenges_userId_idx" ON public.passkey_challenges USING btree ("userId");


--
-- Name: passkeys_credentialId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "passkeys_credentialId_idx" ON public.passkeys USING btree ("credentialId");


--
-- Name: passkeys_credentialId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "passkeys_credentialId_key" ON public.passkeys USING btree ("credentialId");


--
-- Name: passkeys_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "passkeys_userId_idx" ON public.passkeys USING btree ("userId");


--
-- Name: payments_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_status_idx ON public.payments USING btree (status);


--
-- Name: payments_stripePaymentIntentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "payments_stripePaymentIntentId_key" ON public.payments USING btree ("stripePaymentIntentId");


--
-- Name: payments_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "payments_userId_idx" ON public.payments USING btree ("userId");


--
-- Name: question_responses_assessmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "question_responses_assessmentId_idx" ON public.question_responses USING btree ("assessmentId");


--
-- Name: question_responses_assessmentId_questionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "question_responses_assessmentId_questionId_key" ON public.question_responses USING btree ("assessmentId", "questionId");


--
-- Name: question_sets_domain_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "question_sets_domain_isActive_idx" ON public.question_sets USING btree (domain, "isActive");


--
-- Name: question_sets_domain_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX question_sets_domain_key ON public.question_sets USING btree (domain);


--
-- Name: questions_isTrial_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "questions_isTrial_idx" ON public.questions USING btree ("isTrial");


--
-- Name: questions_questionSetId_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "questions_questionSetId_isActive_idx" ON public.questions USING btree ("questionSetId", "isActive");


--
-- Name: questions_questionSetId_order_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "questions_questionSetId_order_key" ON public.questions USING btree ("questionSetId", "order");


--
-- Name: recommendations_assessmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "recommendations_assessmentId_idx" ON public.recommendations USING btree ("assessmentId");


--
-- Name: recommendations_isBookmarked_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "recommendations_isBookmarked_idx" ON public.recommendations USING btree ("isBookmarked");


--
-- Name: recommendations_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "recommendations_userId_idx" ON public.recommendations USING btree ("userId");


--
-- Name: resource_library_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX resource_library_category_idx ON public.resource_library USING btree (category);


--
-- Name: resource_library_createdBy_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "resource_library_createdBy_idx" ON public.resource_library USING btree ("createdBy");


--
-- Name: resource_library_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "resource_library_isActive_idx" ON public.resource_library USING btree ("isActive");


--
-- Name: schools_districtId_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "schools_districtId_code_key" ON public.schools USING btree ("districtId", code);


--
-- Name: schools_districtId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "schools_districtId_idx" ON public.schools USING btree ("districtId");


--
-- Name: scores_assessmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "scores_assessmentId_idx" ON public.scores USING btree ("assessmentId");


--
-- Name: scores_domainTemplateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "scores_domainTemplateId_idx" ON public.scores USING btree ("domainTemplateId");


--
-- Name: ses_monthly_totals_month_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ses_monthly_totals_month_idx ON public.ses_monthly_totals USING btree (month);


--
-- Name: ses_monthly_totals_month_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ses_monthly_totals_month_key ON public.ses_monthly_totals USING btree (month);


--
-- Name: ses_usage_sentAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ses_usage_sentAt_idx" ON public.ses_usage USING btree ("sentAt");


--
-- Name: shareable_links_assessmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "shareable_links_assessmentId_idx" ON public.shareable_links USING btree ("assessmentId");


--
-- Name: shareable_links_createdById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "shareable_links_createdById_idx" ON public.shareable_links USING btree ("createdById");


--
-- Name: shareable_links_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "shareable_links_isActive_idx" ON public.shareable_links USING btree ("isActive");


--
-- Name: shareable_links_shareCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "shareable_links_shareCode_idx" ON public.shareable_links USING btree ("shareCode");


--
-- Name: shareable_links_shareCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "shareable_links_shareCode_key" ON public.shareable_links USING btree ("shareCode");


--
-- Name: snapshot_full_reports_orderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "snapshot_full_reports_orderId_key" ON public.snapshot_full_reports USING btree ("orderId");


--
-- Name: snapshot_leads_session_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX snapshot_leads_session_email_idx ON public.snapshot_leads USING btree ("sessionId", email);


--
-- Name: snapshot_orders_lead_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX snapshot_orders_lead_idx ON public.snapshot_orders USING btree ("leadId");


--
-- Name: snapshot_orders_session_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX snapshot_orders_session_idx ON public.snapshot_orders USING btree ("sessionId");


--
-- Name: snapshot_trials_session_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX snapshot_trials_session_idx ON public.snapshot_trials USING btree ("sessionId");


--
-- Name: student_assessments_assessmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "student_assessments_assessmentId_idx" ON public.student_assessments USING btree ("assessmentId");


--
-- Name: student_assessments_assessmentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "student_assessments_assessmentId_key" ON public.student_assessments USING btree ("assessmentId");


--
-- Name: student_assessments_isTrial_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "student_assessments_isTrial_idx" ON public.student_assessments USING btree ("isTrial");


--
-- Name: student_assessments_studentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "student_assessments_studentId_idx" ON public.student_assessments USING btree ("studentId");


--
-- Name: student_classrooms_classroomId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "student_classrooms_classroomId_idx" ON public.student_classrooms USING btree ("classroomId");


--
-- Name: student_classrooms_studentId_classroomId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "student_classrooms_studentId_classroomId_key" ON public.student_classrooms USING btree ("studentId", "classroomId");


--
-- Name: student_classrooms_studentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "student_classrooms_studentId_idx" ON public.student_classrooms USING btree ("studentId");


--
-- Name: student_recommendations_assessmentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "student_recommendations_assessmentId_idx" ON public.student_recommendations USING btree ("assessmentId");


--
-- Name: student_recommendations_studentId_assessmentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "student_recommendations_studentId_assessmentId_key" ON public.student_recommendations USING btree ("studentId", "assessmentId");


--
-- Name: student_recommendations_studentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "student_recommendations_studentId_idx" ON public.student_recommendations USING btree ("studentId");


--
-- Name: students_anonymousId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "students_anonymousId_idx" ON public.students USING btree ("anonymousId");


--
-- Name: students_anonymousId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "students_anonymousId_key" ON public.students USING btree ("anonymousId");


--
-- Name: students_districtId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "students_districtId_idx" ON public.students USING btree ("districtId");


--
-- Name: students_schoolId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "students_schoolId_idx" ON public.students USING btree ("schoolId");


--
-- Name: sub_accounts_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sub_accounts_isActive_idx" ON public.sub_accounts USING btree ("isActive");


--
-- Name: sub_accounts_managedByUserId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sub_accounts_managedByUserId_idx" ON public.sub_accounts USING btree ("managedByUserId");


--
-- Name: sub_accounts_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sub_accounts_organizationId_idx" ON public.sub_accounts USING btree ("organizationId");


--
-- Name: sub_accounts_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "sub_accounts_userId_key" ON public.sub_accounts USING btree ("userId");


--
-- Name: subscriptions_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "subscriptions_organizationId_idx" ON public.subscriptions USING btree ("organizationId");


--
-- Name: subscriptions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscriptions_status_idx ON public.subscriptions USING btree (status);


--
-- Name: subscriptions_stripeSubscriptionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON public.subscriptions USING btree ("stripeSubscriptionId");


--
-- Name: teacher_classrooms_classroomId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "teacher_classrooms_classroomId_idx" ON public.teacher_classrooms USING btree ("classroomId");


--
-- Name: teacher_classrooms_teacherId_classroomId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "teacher_classrooms_teacherId_classroomId_key" ON public.teacher_classrooms USING btree ("teacherId", "classroomId");


--
-- Name: teacher_classrooms_teacherId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "teacher_classrooms_teacherId_idx" ON public.teacher_classrooms USING btree ("teacherId");


--
-- Name: teachers_districtId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "teachers_districtId_idx" ON public.teachers USING btree ("districtId");


--
-- Name: teachers_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "teachers_userId_idx" ON public.teachers USING btree ("userId");


--
-- Name: teachers_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "teachers_userId_key" ON public.teachers USING btree ("userId");


--
-- Name: telemetry_events_event_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX telemetry_events_event_idx ON public.telemetry_events USING btree (event);


--
-- Name: telemetry_events_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX telemetry_events_user_id_idx ON public.telemetry_events USING btree (user_id);


--
-- Name: telemetry_events_userid_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX telemetry_events_userid_idx ON public.telemetry_events USING btree ("userId");


--
-- Name: termination_rules_questionSetId_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "termination_rules_questionSetId_isActive_idx" ON public.termination_rules USING btree ("questionSetId", "isActive");


--
-- Name: usage_metrics_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX usage_metrics_date_idx ON public.usage_metrics USING btree (date);


--
-- Name: usage_metrics_userId_date_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "usage_metrics_userId_date_key" ON public.usage_metrics USING btree ("userId", date);


--
-- Name: usage_metrics_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "usage_metrics_userId_idx" ON public.usage_metrics USING btree ("userId");


--
-- Name: user_licenses_licenseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_licenses_licenseId_idx" ON public.user_licenses USING btree ("licenseId");


--
-- Name: user_licenses_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_licenses_userId_idx" ON public.user_licenses USING btree ("userId");


--
-- Name: user_licenses_userId_licenseId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_licenses_userId_licenseId_key" ON public.user_licenses USING btree ("userId", "licenseId");


--
-- Name: user_upsell_state_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_upsell_state_user_id_idx ON public.user_upsell_state USING btree ("userId");


--
-- Name: user_upsell_state_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_upsell_state_user_id_key ON public.user_upsell_state USING btree ("userId");


--
-- Name: users_emailVerificationToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "users_emailVerificationToken_key" ON public.users USING btree ("emailVerificationToken");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "users_organizationId_idx" ON public.users USING btree ("organizationId");


--
-- Name: users_parentUserId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "users_parentUserId_idx" ON public.users USING btree ("parentUserId");


--
-- Name: users_stripeCustomerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON public.users USING btree ("stripeCustomerId");


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: AffiliateCommission AffiliateCommission_referrerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AffiliateCommission"
    ADD CONSTRAINT "AffiliateCommission_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES public."AffiliateReferrer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AffiliateNotificationPreferences AffiliateNotificationPreferences_referrerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AffiliateNotificationPreferences"
    ADD CONSTRAINT "AffiliateNotificationPreferences_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES public."AffiliateReferrer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AffiliatePayoutPreferences AffiliatePayoutPreferences_referrerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AffiliatePayoutPreferences"
    ADD CONSTRAINT "AffiliatePayoutPreferences_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES public."AffiliateReferrer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AffiliatePayout AffiliatePayout_referrerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AffiliatePayout"
    ADD CONSTRAINT "AffiliatePayout_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES public."AffiliateReferrer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AffiliateReferrer AffiliateReferrer_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AffiliateReferrer"
    ADD CONSTRAINT "AffiliateReferrer_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CreditTransaction CreditTransaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CreditTransaction"
    ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EmailTemplateVersion EmailTemplateVersion_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailTemplateVersion"
    ADD CONSTRAINT "EmailTemplateVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EmailTemplateVersion EmailTemplateVersion_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailTemplateVersion"
    ADD CONSTRAINT "EmailTemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."EmailTemplate"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EmailTemplate EmailTemplate_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailTemplate"
    ADD CONSTRAINT "EmailTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EmailTemplate EmailTemplate_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailTemplate"
    ADD CONSTRAINT "EmailTemplate_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."EmailTemplate"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MagicLinkToken MagicLinkToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MagicLinkToken"
    ADD CONSTRAINT "MagicLinkToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ai_reports ai_reports_assessmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_reports
    ADD CONSTRAINT "ai_reports_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES public.assessments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ai_reports ai_reports_generatedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_reports
    ADD CONSTRAINT "ai_reports_generatedByUserId_fkey" FOREIGN KEY ("generatedByUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: assessment_template_domains assessment_template_domains_assessmentTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_template_domains
    ADD CONSTRAINT "assessment_template_domains_assessmentTemplateId_fkey" FOREIGN KEY ("assessmentTemplateId") REFERENCES public.assessment_templates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assessment_template_domains assessment_template_domains_domainTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_template_domains
    ADD CONSTRAINT "assessment_template_domains_domainTemplateId_fkey" FOREIGN KEY ("domainTemplateId") REFERENCES public.domain_templates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assessment_template_versions assessment_template_versions_assessmentTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_template_versions
    ADD CONSTRAINT "assessment_template_versions_assessmentTemplateId_fkey" FOREIGN KEY ("assessmentTemplateId") REFERENCES public.assessment_templates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assessment_template_versions assessment_template_versions_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_template_versions
    ADD CONSTRAINT "assessment_template_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: assessment_templates assessment_templates_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_templates
    ADD CONSTRAINT "assessment_templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: assessments assessments_assessmentTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT "assessments_assessmentTemplateId_fkey" FOREIGN KEY ("assessmentTemplateId") REFERENCES public.assessment_templates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: assessments assessments_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT "assessments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_assessmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT "chat_messages_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES public.assessments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT "chat_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public.chat_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: chat_sessions chat_sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT "chat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: classrooms classrooms_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classrooms
    ADD CONSTRAINT "classrooms_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversational_sessions conversational_sessions_assessmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversational_sessions
    ADD CONSTRAINT "conversational_sessions_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES public.assessments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversational_sessions conversational_sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversational_sessions
    ADD CONSTRAINT "conversational_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversational_submissions conversational_submissions_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversational_submissions
    ADD CONSTRAINT "conversational_submissions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public.conversational_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: district_audit_logs district_audit_logs_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.district_audit_logs
    ADD CONSTRAINT "district_audit_logs_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public.districts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: district_audit_logs district_audit_logs_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.district_audit_logs
    ADD CONSTRAINT "district_audit_logs_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: districts districts_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT "districts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: document_chunks document_chunks_documentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_chunks
    ADD CONSTRAINT "document_chunks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public.documents(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: documents documents_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: domain_template_versions domain_template_versions_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domain_template_versions
    ADD CONSTRAINT "domain_template_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: domain_template_versions domain_template_versions_domainTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domain_template_versions
    ADD CONSTRAINT "domain_template_versions_domainTemplateId_fkey" FOREIGN KEY ("domainTemplateId") REFERENCES public.domain_templates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: domain_templates domain_templates_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domain_templates
    ADD CONSTRAINT "domain_templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: email_logs email_logs_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT "email_logs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."EmailTemplate"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: email_logs email_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT "email_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assessments fk_assessment_childprofile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT fk_assessment_childprofile FOREIGN KEY (childprofileid) REFERENCES public.child_profiles(id);


--
-- Name: child_profiles fk_childprofile_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.child_profiles
    ADD CONSTRAINT fk_childprofile_user FOREIGN KEY (userid) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: licenses licenses_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT "licenses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: login_tokens login_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_tokens
    ADD CONSTRAINT "login_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_preferences notification_preferences_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: passkeys passkeys_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.passkeys
    ADD CONSTRAINT "passkeys_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: platform_settings platform_settings_globalRegularAssessmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT "platform_settings_globalRegularAssessmentId_fkey" FOREIGN KEY ("globalRegularAssessmentId") REFERENCES public.assessment_templates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: platform_settings platform_settings_globalTrialAssessmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT "platform_settings_globalTrialAssessmentId_fkey" FOREIGN KEY ("globalTrialAssessmentId") REFERENCES public.assessment_templates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: question_responses question_responses_assessmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_responses
    ADD CONSTRAINT "question_responses_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES public.assessments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: questions questions_questionSetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "questions_questionSetId_fkey" FOREIGN KEY ("questionSetId") REFERENCES public.question_sets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recommendations recommendations_assessmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT "recommendations_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES public.assessments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recommendations recommendations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT "recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: resource_library resource_library_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_library
    ADD CONSTRAINT "resource_library_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: schools schools_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT "schools_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public.districts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: scores scores_assessmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT "scores_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES public.assessments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: scores scores_domainTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT "scores_domainTemplateId_fkey" FOREIGN KEY ("domainTemplateId") REFERENCES public.domain_templates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: shareable_links shareable_links_assessmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shareable_links
    ADD CONSTRAINT "shareable_links_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES public.assessments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shareable_links shareable_links_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shareable_links
    ADD CONSTRAINT "shareable_links_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: snapshot_full_reports snapshot_full_reports_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snapshot_full_reports
    ADD CONSTRAINT "snapshot_full_reports_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.snapshot_orders(id) ON DELETE CASCADE;


--
-- Name: snapshot_leads snapshot_leads_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snapshot_leads
    ADD CONSTRAINT "snapshot_leads_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public.snapshot_sessions(id) ON DELETE CASCADE;


--
-- Name: snapshot_orders snapshot_orders_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snapshot_orders
    ADD CONSTRAINT "snapshot_orders_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.snapshot_leads(id) ON DELETE SET NULL;


--
-- Name: snapshot_orders snapshot_orders_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snapshot_orders
    ADD CONSTRAINT "snapshot_orders_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public.snapshot_sessions(id) ON DELETE SET NULL;


--
-- Name: snapshot_trials snapshot_trials_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.snapshot_trials
    ADD CONSTRAINT "snapshot_trials_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public.snapshot_sessions(id) ON DELETE CASCADE;


--
-- Name: student_assessments student_assessments_assessmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_assessments
    ADD CONSTRAINT "student_assessments_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES public.assessments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_assessments student_assessments_shareLinkId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_assessments
    ADD CONSTRAINT "student_assessments_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES public.shareable_links(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: student_assessments student_assessments_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_assessments
    ADD CONSTRAINT "student_assessments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_classrooms student_classrooms_classroomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_classrooms
    ADD CONSTRAINT "student_classrooms_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES public.classrooms(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_classrooms student_classrooms_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_classrooms
    ADD CONSTRAINT "student_classrooms_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_recommendations student_recommendations_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_recommendations
    ADD CONSTRAINT "student_recommendations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: students students_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "students_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public.districts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: students students_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "students_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public.schools(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sub_accounts sub_accounts_managedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_accounts
    ADD CONSTRAINT "sub_accounts_managedByUserId_fkey" FOREIGN KEY ("managedByUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sub_accounts sub_accounts_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_accounts
    ADD CONSTRAINT "sub_accounts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sub_accounts sub_accounts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_accounts
    ADD CONSTRAINT "sub_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_classrooms teacher_classrooms_classroomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_classrooms
    ADD CONSTRAINT "teacher_classrooms_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES public.classrooms(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teacher_classrooms teacher_classrooms_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_classrooms
    ADD CONSTRAINT "teacher_classrooms_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public.teachers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teachers teachers_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT "teachers_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public.districts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teachers teachers_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT "teachers_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: telemetry_events telemetry_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telemetry_events
    ADD CONSTRAINT telemetry_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: telemetry_events telemetry_events_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.telemetry_events
    ADD CONSTRAINT telemetry_events_userid_fkey FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: termination_rules termination_rules_questionSetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.termination_rules
    ADD CONSTRAINT "termination_rules_questionSetId_fkey" FOREIGN KEY ("questionSetId") REFERENCES public.question_sets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: usage_metrics usage_metrics_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usage_metrics
    ADD CONSTRAINT "usage_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_licenses user_licenses_licenseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_licenses
    ADD CONSTRAINT "user_licenses_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES public.licenses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_licenses user_licenses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_licenses
    ADD CONSTRAINT "user_licenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_upsell_state user_upsell_state_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_upsell_state
    ADD CONSTRAINT user_upsell_state_user_id_fkey FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_parentUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: user_licenses Admins can manage org user licenses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage org user licenses" ON public.user_licenses TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.users admin
     JOIN public.users license_owner ON ((user_licenses."userId" = license_owner.id)))
  WHERE ((admin.id = (auth.uid())::text) AND (admin.role = ANY (ARRAY['ADMIN'::public."Role", 'SUPER_ADMIN'::public."Role", 'DISTRICT_ADMIN'::public."Role"])) AND ((admin."organizationId" = license_owner."organizationId") OR (admin.role = 'SUPER_ADMIN'::public."Role"))))));


--
-- Name: user_licenses Service role has full access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Service role has full access" ON public.user_licenses TO service_role USING (true) WITH CHECK (true);


--
-- Name: user_licenses Users can read their own licenses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can read their own licenses" ON public.user_licenses FOR SELECT TO authenticated USING (("userId" = (auth.uid())::text));


--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT USAGE ON SCHEMA storage TO anon;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT USAGE ON SCHEMA storage TO authenticated;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT USAGE ON SCHEMA storage TO service_role;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT USAGE ON SCHEMA storage TO supabase_storage_admin;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT USAGE ON SCHEMA storage TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;
SET SESSION AUTHORIZATION postgres;
GRANT USAGE ON SCHEMA vault TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.flow_state TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.identities TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.instances TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_client_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_client_states TO postgres;
GRANT ALL ON TABLE auth.oauth_client_states TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.saml_providers TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.sessions TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.sso_domains TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.sso_providers TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT ON TABLE auth.users TO dashboard_user;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE user_licenses; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.user_licenses TO authenticated;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.buckets FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON TABLE storage.buckets TO anon;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON TABLE storage.buckets TO authenticated;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON TABLE storage.buckets TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.objects FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON TABLE storage.objects TO anon;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON TABLE storage.objects TO authenticated;
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION postgres;
GRANT ALL ON TABLE storage.objects TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE prefixes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.prefixes TO service_role;
GRANT ALL ON TABLE storage.prefixes TO authenticated;
GRANT ALL ON TABLE storage.prefixes TO anon;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;
SET SESSION AUTHORIZATION postgres;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;
RESET SESSION AUTHORIZATION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,USAGE ON SEQUENCES TO postgres;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO postgres;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict bMPuzyxaXsxn6vOvjJ0ucq6UznFlvt9Yh02TxANHMMd91srCSeCWeYq8Epdofh8

