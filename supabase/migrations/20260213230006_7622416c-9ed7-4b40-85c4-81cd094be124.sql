
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule fetch-news every 60 minutes
SELECT cron.schedule(
  'fetch-political-news',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://vbwodbgrfxhsdlclodrp.supabase.co/functions/v1/fetch-news',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZid29kYmdyZnhoc2RsY2xvZHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTAzNTksImV4cCI6MjA4NjU2NjM1OX0.y2k6J8aQLHKAPUXFU_JY9JIqLZJweMIFJaTNBdxv9f4"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
