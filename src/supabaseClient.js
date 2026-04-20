import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  "https://rmirwfiusuomcodrharr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtaXJ3Zml1c3VvbWNvZHJoYXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODM3MjYsImV4cCI6MjA5MTg1OTcyNn0.-RHRoeQrv8smK0wRQt5bVarBXGyxCR8Z_VVorZs3j5w"
)