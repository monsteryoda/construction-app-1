import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle, Search, UserCheck, Clock as ClockIcon, History } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ClockRecord {
  id: string;
  user_id: string;
  worker_id: string;
  worker_name: string;
  action: 'clock_in' | 'clock_out';
  clocked_at: string;
}

export default function ClockInOut() {
  const { user } = useAuth();
  const [clockRecords, setClockRecords] = useState<ClockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayClockIn, setTodayClockIn] = useState<string | null>(null);
  const [todayClockOut, setTodayClockOut] = useState<string | null>(null);
  const [isClocking, setIsClocking] = useState(false);

  useEffect(() => {
    fetchClockRecords();
    checkTodayClockStatus();
  }, []);

  const fetchClockRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clock_records')
        .select('*')
        .order('clocked_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching clock records:', error);
        toast.error('Failed to fetch clock records');
      } else {
        setClockRecords(data || []);
      }
    } catch (error) {
      console.error('Error fetching clock records:', error);
      toast.error('Failed to fetch clock records');
    } finally {
      setLoading(false);
    }
  };

  const checkTodayClockStatus = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    try {
      const { data, error } = await supabase
        .from('clock_records')
        .select('action, clocked_at')
        .eq('user_id', user?.id)
        .gte('clocked_at', `${today}T00:00:00Z`)
        .lte('clocked_at', `${today}T23:59:59Z`);

      if (error) {
        console.error('Error checking today clock status:', error);
        return;
      }

      const todayRecords = data || [];
      const clockIn = todayRecords.find(r => r.action === 'clock_in');
      const clockOut = todayRecords.find(r => r.action === 'clock_out');

      setTodayClockIn(clockIn?.clocked_at || null);
      setTodayClockOut(clockOut?.clocked_at || null);
    } catch (error) {
      console.error('Error checking today clock status:', error);
    }
  };

  const handleClockInOut = async (action: 'clock_in' | 'clock_out') => {
    setIsClocking(true);

    try {
      const { error } = await supabase
        .from('clock_records')
        .insert([{
          user_id: user?.id,
          worker_id: user?.id,
          worker_name: user?.email || 'Unknown User',
          action,
          clocked_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      toast.success(
        action === 'clock_in' 
          ? 'Successfully clocked in' 
          : 'Successfully clocked out'
      );

      checkTodayClockStatus();
      fetchClockRecords();
    } catch (error) {
      console.error('Error clocking in/out:', error);
      toast.error('Failed to clock in/out');
    } finally {
      setIsClocking(false);
    }
  };

  const canClockIn = todayClockIn && !todayClockOut;
  const canClockOut = todayClockIn && !todayClockOut;

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Clock In/Out</h1>
          <p className="text-slate-500">Track your daily attendance</p>
        </div>

        {/* Today's Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className={canClockIn ? 'border-green-200 bg-green-50' : 'border-slate-200'}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clock In</CardTitle>
              <Clock className={`h-4 w-4 ${canClockIn ? 'text-green-600' : 'text-slate-400'}`} />
            </CardHeader>
            <CardContent>
              {todayClockIn ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Clocked in at</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {format(new Date(todayClockIn), 'HH:mm')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(todayClockIn), 'MMM dd, yyyy')}
                  </p>
                </div>
              ) : (
                <Button 
                  className="gap-2" 
                  onClick={() => handleClockInOut('clock_in')}
                  disabled={isClocking}
                >
                  <Clock className="w-4 h-4" />
                  {isClocking ? 'Clocking In...' : 'Clock In Now'}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className={canClockOut ? 'border-blue-200 bg-blue-50' : 'border-slate-200'}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clock Out</CardTitle>
              <Clock className={`h-4 w-4 ${canClockOut ? 'text-blue-600' : 'text-slate-400'}`} />
            </CardHeader>
            <CardContent>
              {todayClockOut ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Clocked out at</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {format(new Date(todayClockOut), 'HH:mm')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(todayClockOut), 'MMM dd, yyyy')}
                  </p>
                </div>
              ) : (
                <Button 
                  className="gap-2" 
                  onClick={() => handleClockInOut('clock_out')}
                  disabled={!canClockOut || isClocking}
                >
                  <Clock className="w-4 h-4" />
                  {isClocking ? 'Clocking Out...' : 'Clock Out Now'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Clock Activity
            </CardTitle>
            <CardDescription>Your recent clock in/out records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading records...</div>
              ) : clockRecords.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No clock records found. Start by clocking in for today.
                </div>
              ) : (
                clockRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        record.action === 'clock_in' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {record.action === 'clock_in' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{record.worker_name}</p>
                        <p className="text-sm text-slate-500">
                          {format(new Date(record.clocked_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={record.action === 'clock_in' ? 'default' : 'secondary'}>
                      {record.action === 'clock_in' ? 'Clock In' : 'Clock Out'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}