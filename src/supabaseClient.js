import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rmirwfiusuomcodrharr.supabase.co'

const supabaseAnonKey = 'sb_publishable_fkPCYSgMFeizZOk4O250ow_bwF-4aXC'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)