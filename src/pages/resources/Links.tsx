import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link as LinkIcon, ExternalLink } from 'lucide-react';

export default function Links() {
  const externalLinks = [
    {
      title: 'Supabase Documentation',
      url: 'https://supabase.com/docs',
      description: 'Database and authentication docs',
      category: 'Development',
    },
    {
      title: 'React Router',
      url: 'https://reactrouter.com/',
      description: 'Routing library documentation',
      category: 'Development',
    },
    {
      title: 'Tailwind CSS',
      url: 'https://tailwindcss.com/',
      description: 'Utility-first CSS framework',
      category: 'Design',
    },
    {
      title: 'shadcn/ui',
      url: 'https://ui.shadcn.com/',
      description: 'Beautifully designed components',
      category: 'Design',
    },
    {
      title: 'Lucide Icons',
      url: 'https://lucide.dev/',
      description: 'Icon library',
      category: 'Design',
    },
    {
      title: 'GitHub',
      url: 'https://github.com/',
      description: 'Code hosting platform',
      category: 'Tools',
    },
  ];

  const categories = [...new Set(externalLinks.map(link => link.category))];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">External Links</h1>
          <p className="text-slate-500">Useful resources and documentation</p>
        </div>

        {categories.map((category) => (
          <div key={category} className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {externalLinks
                .filter((link) => link.category === category)
                .map((link, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-5 h-5 text-blue-600" />
                          <CardTitle className="text-base">{link.title}</CardTitle>
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{link.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}