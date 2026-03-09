import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bktxmvjinvugvbegqsro.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdHhtdmppbnZ1Z3ZiZWdxc3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTgxNDYsImV4cCI6MjA4ODU3NDE0Nn0.Nu411Dr15Ddp8XQveAdYPeOaiGyRKPeS0mHAfCSftAs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);