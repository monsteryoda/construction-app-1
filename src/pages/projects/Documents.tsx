import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import DocumentCard from '@/components/documents/DocumentCard';
import DocumentForm from '@/components/documents/DocumentForm';
import { uploadFiles, deleteDocumentFile } from '@/components/documents/DocumentActions';
import { Document, Project } from '@/components/documents/DocumentTypes';

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

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

      // Fetch files for each document
      const documentsWithFiles = await Promise.all(
        (data || []).map(async (doc) => {
          // For now, we'll use the main file_url
          return { ...doc, files: [{
            id: doc.id,
            document_id: doc.id,
            file_url: doc.file_url,
            file_name: doc.document_name,
            file_size: doc.file_size,
            version: doc.version,
            uploaded_at: doc.uploaded_at,
          }] };
        })
      );

      setDocuments(documentsWithFiles);
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async (document: any, files: File[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First create the document
      const { data: documentData, error: documentError } = await supabase
        .from('project_documents')
        .insert([{
          user_id: user.id,
          ...document,
          file_size: files.reduce((acc, file) => acc + file.size, 0),
        }])
        .select()
        .single();

      if (documentError) throw documentError;

      // Then upload files if any
      if (files.length > 0 && documentData) {
        const uploadedCount = await uploadFiles(documentData.id, user.id, files);
        toast.success(`${uploadedCount} file(s) uploaded successfully`);
      }

      toast.success('Document added successfully');
      setShowAddDialog(false);
      
      // Reset form
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to add document');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Project Documents</h1>
            <p className="text-slate-500 mt-1">Manage project documentation and files</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Document
          </Button>
        </div>

        <DocumentForm
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSubmit={handleAddDocument}
          projects={projects}
        />

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
                Create Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDeleteFile={deleteDocumentFile}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}