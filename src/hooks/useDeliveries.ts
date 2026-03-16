"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Delivery {
  id: string;
  user_id: string;
  project_id: string;
  delivery_item: string;
  description: string;
  delivery_date: string;
  expected_date: string;
  status: string;
  quantity: number;
  unit: string;
  supplier: string;
  created_at: string;
  updated_at: string;
}

export function useDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const { data, error } = await supabase
          .from('project_deliveries')
          .select('*')
          .in('status', ['pending', 'scheduled'])
          .order('expected_date', { ascending: true });

        if (error) throw error;
        setDeliveries(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  return { deliveries, loading, error };
}