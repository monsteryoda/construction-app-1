import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, HelpCircle, Video } from 'lucide-react';

export default function Documentation() {
  const docs = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of BuildManager',
      icon: BookOpen,
      color: 'text-blue-600',
    },
    {
      title: 'User Guide',
      description: 'Complete user documentation',
      icon: FileText,
      color: 'text-green-600',
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step tutorials',
      icon: Video,
      color: 'text-purple-600',
    },
    {
      title: 'FAQ',
      description: 'Frequently asked questions',
      icon: HelpCircle,
      color: 'text-amber-600',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Documentation</h1>
          <p className="text-slate-500">Find answers and learn how to use BuildManager</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docs.map((doc) => (
            <Card key={doc.title} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <doc.icon className={`w-6 h-6 ${doc.color}`} />
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                </div>
                <CardDescription>{doc.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Read More →
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}