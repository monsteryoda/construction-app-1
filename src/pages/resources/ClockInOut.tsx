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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ClockRecord {
  id: string;
  user_id: string;
  worker_id: string;
  worker_name: string;
  action: 'clock_in' | 'clock_out';
  clocked_at: string;
}

interface Worker {
  id: string;
  name: string;
  ic_number: string;
  position: string;
  contact: string;
  status: string;
  location: string;
}

export default function ClockInOut() {
  const { user } = useAuth();
  const [clockRecords, setClockRecords] = useState<ClockRecord[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [todayClockIn, setTodayClockIn] = useState<string | null>(null);
  const [todayClockOut, setTodayClockOut] = useState<string | null>(null);
  const [isClocking, setIsClocking] = useState(false);

  useEffect(() => {
    fetchClockRecords();
    fetchWorkers();
    checkTodayClockStatus();
  }, []);

  const fetchWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('status', 'Active')
        .order('name');

      if (error) {
        console.error('Error fetching workers:', error);
        toast.error('Failed to fetch workers');
      } else {
        setWorkers(data || []);
        if (data && data.length > 0 && !selectedWorker) {
          setSelectedWorker(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
      toast.error('Failed to fetch workers');
    }
  };

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
        .eq('worker_id', selectedWorker)
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

  const handleWorkerChange = (value: string) => {
    setSelectedWorker(value);
    checkTodayClockStatus();
  };

  const handleClockInOut = async (action: 'clock_in' | 'clock_out') => {
    if (!selectedWorker) {
      toast.error('Please select a worker first');
      return;
    }

    setIsClocking(true);

    try {
      const worker = workers.find(w => w.id === selectedWorker);
      
      const { error } = await supabase
        .from('clock_records')
        .insert([{
          user_id: user?.id,
          worker_id: selectedWorker,
          worker_name: worker?.name || 'Unknown Worker',
          action,
          clocked_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      toast.success(
        action === 'clock_in' 
          ? `Successfully clocked in ${worker?.name}` 
          : `Successfully clocked out ${worker?.name}`
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

  const selectedWorkerData = workers.find(w => w.id === selectedWorker);
  const canClockIn = todayClockIn && !todayClockOut;
  const canClockOut = todayClockIn && !todayClockOut;

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Clock In/Out</h1>
          <p className="text-slate-500">Track your daily attendance</p>
        </div>

        {/* Worker Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Select Worker
            </CardTitle>
            <CardDescription>Choose which worker to clock in/out</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Select value={selectedWorker} onValueChange={handleWorkerChange}>
                <SelectTrigger className="w-full md:w-[400px]">
                  <SelectValue placeholder="Select a worker" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{worker.name}</span>
                        <span className="text-xs text-slate-500">
                          {worker.position} • {worker.ic_number}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedWorkerData && (
                <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                  <span>Location:</span>
                  <span className="font-medium">{selectedWorkerData.location || 'N/A'}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                  <p className="text-sm text-slate-600">
                    {selectedWorkerData?.name}
                  </p>
                </div>
              ) : (
                <Button 
                  className="gap-2" 
                  onClick={() => handleClockInOut('clock_in')}
                  disabled={isClocking || !selectedWorker}
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
                  <p className="text-sm text-slate-600">
                    {selectedWorkerData?.name}
                  </p>
                </div>
              ) : (
                <Button 
                  className="gap-2" 
                  onClick={() => handleClockInOut('clock_out')}
                  disabled={!canClockOut || isClocking || !selectedWorker}
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