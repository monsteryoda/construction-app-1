"use client";

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hammer, Plus, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Machinery {
  id: string;
  user_id: string;
  ref: string;
  no: string;
  plant_machinery: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function Machinery() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [machineryList, setMachineryList] = useState<Machinery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    ref: '',
    no: '',
    plantMachinery: '',
  });

  // Fetch machinery data from database
  useEffect(() => {
    fetchMachinery();
  }, []);

  const fetchMachinery = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to view machinery');
        return;
      }

      const { data, error } = await supabase
        .from('machinery')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMachineryList(data || []);
    } catch (error) {
      console.error('Error fetching machinery:', error);
      toast.error('Failed to load machinery data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to add equipment');
        return;
      }

      const { error } = await supabase
        .from('machinery')
        .insert([{
          user_id: user.id,
          ref: formData.ref,
          no: formData.no,
          plant_machinery: formData.plantMachinery,
          status: 'Available',
        }]);

      if (error) throw error;

      toast.success('Equipment added successfully!');
      setShowAddModal(false);
      setFormData({
        ref: '',
        no: '',
        plantMachinery: '',
      });
      fetchMachinery();
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast.error('Failed to add equipment');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('machinery')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast.success('Status updated successfully!');
      fetchMachinery();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Filter machinery based on search term
  const filteredMachinery = machineryList.filter(item =>
    item.plant_machinery.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ref.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const isAvailable = status === 'Available';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        isAvailable 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {status}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Machinery</h1>
              <p className="text-slate-500">Manage construction equipment and machinery</p>
            </div>
            <Button className="gap-2" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" />
              Add Equipment
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search equipment by name or ref..."
                className="flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ref</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Plant & Machinery</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredMachinery.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        No equipment found. Add your first equipment!
                      </td>
                    </tr>
                  ) : (
                    filteredMachinery.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{item.no}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.ref}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                              <Hammer className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-900">{item.plant_machinery}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            {getStatusBadge(item.status)}
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`status-${item.id}`}
                                  checked={item.status === 'Available'}
                                  onChange={() => updateStatus(item.id, 'Available')}
                                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                />
                                <span className="text-sm text-slate-600">Have</span>
                              </label>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`status-${item.id}`}
                                  checked={item.status === 'Not Available'}
                                  onChange={() => updateStatus(item.id, 'Not Available')}
                                  className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                />
                                <span className="text-sm text-slate-600">Not Have</span>
                              </label>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add Equipment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Add Equipment</h2>
                    <p className="text-slate-500">Add new machinery or equipment to your inventory</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Reference Number */}
                    <div className="space-y-2">
                      <Label htmlFor="ref">Reference Number *</Label>
                      <Input
                        id="ref"
                        placeholder="REF-001"
                        value={formData.ref}
                        onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                        required
                      />
                    </div>

                    {/* Equipment Number */}
                    <div className="space-y-2">
                      <Label htmlFor="no">Equipment Number *</Label>
                      <Input
                        id="no"
                        placeholder="001"
                        value={formData.no}
                        onChange={(e) => setFormData({ ...formData, no: e.target.value })}
                        required
                      />
                    </div>

                    {/* Plant & Machinery Name */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="plantMachinery">Plant & Machinery Name *</Label>
                      <Input
                        id="plantMachinery"
                        placeholder="e.g., Excavator CAT 320"
                        value={formData.plantMachinery}
                        onChange={(e) => setFormData({ ...formData, plantMachinery: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="gap-2" disabled={loading}>
                      <Hammer className="w-4 h-4" />
                      {loading ? 'Adding...' : 'Add Equipment'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}