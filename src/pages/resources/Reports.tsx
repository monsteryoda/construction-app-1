import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, Download, Calendar } from 'lucide-react';

export default function Reports() {
  const reports = [
    {
      title: 'Project Summary Report',
      description: 'Overview of all active projects',
      icon: FileSpreadsheet,
      lastUpdated: '2024-01-15',
    },
    {
      title: 'Activity Progress Report',
      description: 'Status of all project activities',
      icon: FileSpreadsheet,
      lastUpdated: '2024-01-14',
    },
    {
      title: 'Delivery Status Report',
      description: 'Current delivery tracking',
      icon: FileSpreadsheet,
      lastUpdated: '2024-01-13',
    },
    {
      title: 'Issue Tracking Report',
      description: 'Open and resolved issues',
      icon: FileSpreadsheet,
      lastUpdated: '2024-01-12',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500">View and download project reports</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {reports.map((report, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <report.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{report.title}</h3>
                      <p className="text-sm text-slate-500">{report.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-400">Last updated: {report.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}