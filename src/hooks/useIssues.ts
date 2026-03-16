"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Issue {
  id: string;
  user_id: string;
  project_id: string;
  issue_title: string;
  description: string;
  issue_type: string;
  severity: string;
  status: string;
  reported_by: string;
  assigned_to: string;
  reported_date: string;
  resolved_date: string;
  resolution_notes: string;
  created_at: string;
  updated_at: string;
}

export function useIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const { data, error } = await supabase
          .from('project_issues')
          .select('*')
          .eq('status', 'open')
          .order('reported_date', { ascending: false });

        if (error) throw error;
        setIssues(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  return { issues, loading, error };
}