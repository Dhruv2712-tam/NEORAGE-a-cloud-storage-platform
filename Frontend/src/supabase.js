import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://galsqaxpocrgqhzeynjz.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbHNxYXhwb2NyZ3FoemV5bmp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNTk5MjcsImV4cCI6MjA4NzgzNTkyN30.VZIFySlhkploRH2aBNuETG69bJ61u_l_ZVBDnJFBS54"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)