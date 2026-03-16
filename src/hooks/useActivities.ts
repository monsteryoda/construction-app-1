"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Activity {
  id: string;
  user_id: string;
  project_id: string;
  activity_name: string;
  description: string;
  activity_date: string;
  status: string;
  priority: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  end_date: string;
}

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from('project_activities')
          .select('*')
          .eq('status', 'pending')
          .order('activity_date', { ascending: true });

        if (error) throw error;
        setActivities(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return { activities, loading, error };
}