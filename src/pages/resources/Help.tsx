import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, MessageCircle, Mail, Phone } from 'lucide-react';

export default function Help() {
  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team',
      color: 'bg-green-500',
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us an email',
      color: 'bg-blue-500',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Call our hotline',
      color: 'bg-purple-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Help Center</h1>
          <p className="text-slate-500">Get help and support for BuildManager</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {supportOptions.map((option) => (
            <Card key={option.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center mb-3`}>
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{option.title}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              <CardTitle>Common Questions</CardTitle>
            </div>
            <CardDescription>Frequently asked questions and answers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                'How do I create a new project?',
                'How to track project activities?',
                'How to manage deliveries?',
                'How to report issues?',
              ].map((question, index) => (
                <div key={index} className="border-b border-slate-200 pb-4 last:border-0">
                  <h3 className="font-medium text-slate-900 mb-1">{question}</h3>
                  <p className="text-sm text-slate-500">Click to view answer</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}