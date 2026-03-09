import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Plus, FileText, Upload, Download, Eye, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  project_id: string;
  document_name: string;
  document_type: string;
  description: string;
  file_url: string;
  file_size: number;
  version: string;
  uploaded_at: string;
}

interface Project {
  id: string;
  project_name: string;
}

const documentTypes = [
  'Contract',
  'Drawing',
  'Specification',
  'Report',
  'Permit',
  'Invoice',
  'Certificate',
  'Photo',
  'Other',
];

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDocument, setNewDocument] = useState({
    project_id: '',
    document_name: '',
    document_type: '',
    description: '',
    file_url: '',
    version: '1.0',
  });

  useEffect(() => {
    fetchProjects();
    fetchDocuments();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('projects')
        .select('id, project_name')
        .eq('user_id', user.id);

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('project_documents')
        .select('*, projects(project_name)')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('project_documents').insert([
        {
          user_id: user.id,
          ...newDocument,
        },
      ]);

      if (error) throw error;
      toast.success('Document added successfully');
      setShowAddDialog(false);
      setNewDocument({
        project_id: '',
        document_name: '',
        document_type: '',
        description: '',
        file_url: '',
        version: '1.0',
      });
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to add document');
    }
  };

  const getFileIcon = (documentType: string) => {
    switch (documentType.toLowerCase()) {
      case 'drawing':
        return <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600" /></div>;
      case 'contract':
        return <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-green-600" /></div>;
      case 'photo':
        return <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-purple-600" /></div>;
      default:
        return <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-slate-600" /></div>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Project Documents</h1>
            <p className="text-slate-500 mt-1">Manage project documentation and files</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Project *</Label>
                  <Select
                    value={newDocument.project_id}
                    onValueChange={(value) => setNewDocument({ ...newDocument, project_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.project_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Document Name *</Label>
                  <Input
                    value={newDocument.document_name}
                    onChange={(e) => setNewDocument({ ...newDocument, document_name: e.target.value })}
                    placeholder="Enter document name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select
                    value={newDocument.document_type}
                    onValueChange={(value) => setNewDocument({ ...newDocument, document_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newDocument.description}
                    onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                    placeholder="Enter document description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>File URL</Label>
                  <Input
                    value={newDocument.file_url}
                    onChange={(e) => setNewDocument({ ...newDocument, file_url: e.target.value })}
                    placeholder="Enter file URL or link"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Version</Label>
                  <Input
                    value={newDocument.version}
                    onChange={(e) => setNewDocument({ ...newDocument, version: e.target.value })}
                    placeholder="e.g., 1.0"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDocument}>Add Document</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : documents.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Documents Yet</h3>
              <p className="text-slate-500 mb-6">Add your first project document</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {getFileIcon(doc.document_type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900 truncate">{doc.document_name}</h3>
                          {(doc as any).projects?.project_name && (
                            <p className="text-sm text-blue-600">{(doc as any).projects.project_name}</p>
                          )}
                        </div>
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                          v{doc.version}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mt-2 line-clamp-2">{doc.description}</p>
                      <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                        </div>
                        {doc.file_size > 0 && (
                          <span>{formatFileSize(doc.file_size)}</span>
                        )}
                        <span className="capitalize">{doc.document_type || 'Other'}</span>
                      </div>
                      {doc.file_url && (
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="gap-1" asChild>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4" />
                              View
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1" asChild>
                            <a href={doc.file_url} download>
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}