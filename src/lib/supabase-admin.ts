import { createClient } from '@supabase/supabase-js'

// SERVER SIDE ONLY
// Never import this file in any component with 'use client'
// Only import in files inside src/app/api/

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
