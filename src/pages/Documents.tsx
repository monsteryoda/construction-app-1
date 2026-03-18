"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document, Project } from '@/components/documents/DocumentTypes';
import DocumentCard from '@/components/documents/DocumentCard';
import DocumentForm from '@/components/documents/DocumentForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocuments();
    fetchProjects();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('project_documents')
        .select(`
          *,
          projects (
            id,
            project_name
          )
        `)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      // Fetch files for each document
      const documentsWithFiles = await Promise.all(
        (data || []).map(async (doc) => {
          const { data: files } = await supabase
            .from('project_documents_files')
            .select('*')
            .eq('document_id', doc.id);

          return {
            ...doc,
            files: files || [],
          };
        })
      );

      setDocuments(documentsWithFiles || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleAddDocument = async (formData: any, files: File[]) => {
    try {
      // Create document record
      const { data: documentData, error: docError } = await supabase
        .from('project_documents')
        .insert({
          project_id: formData.project_id,
          document_name: formData.document_name,
          document_type: formData.document_type || null,
          description: formData.description || null,
          version: formData.version,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (docError) throw docError;

      // Upload files
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${documentData.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        // Save file record
        await supabase
          .from('project_documents_files')
          .insert({
            document_id: documentData.id,
            file_name: file.name,
            file_url: publicUrl,
            file_size: file.size,
          });
      }

      toast.success('Document added successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  };

  const handleUpdateDocument = async (formData: any, files: File[]) => {
    if (!editingDocument) return;

    try {
      // Update document record
      const { error: docError } = await supabase
        .from('project_documents')
        .update({
          project_id: formData.project_id,
          document_name: formData.document_name,
          document_type: formData.document_type || null,
          description: formData.description || null,
          version: formData.version,
        })
        .eq('id', editingDocument.id);

      if (docError) throw docError;

      // Upload new files
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${editingDocument.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        // Save file record
        await supabase
          .from('project_documents_files')
          .insert({
            document_id: editingDocument.id,
            file_name: file.name,
            file_url: publicUrl,
            file_size: file.size,
          });
      }

      toast.success('Document updated successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const { error } = await supabase
        .from('project_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setShowForm(true);
  };

  const filteredDocuments = documents.filter(doc =>
    doc.document_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.projects?.project_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
        <Button onClick={() => {
          setEditingDocument(null);
          setShowForm(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p>No documents found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onDeleteFile={async (fileId) => {
                try {
                  const { error } = await supabase
                    .from('project_documents_files')
                    .delete()
                    .eq('id', fileId);

                  if (error) throw error;
                  toast.success('File deleted successfully');
                  fetchDocuments();
                } catch (error) {
                  console.error('Error deleting file:', error);
                  toast.error('Failed to delete file');
                }
              }}
              onEdit={handleEditDocument}
              onDelete={handleDeleteDocument}
            />
          ))}
        </div>
      )}

      <DocumentForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={editingDocument ? handleUpdateDocument : handleAddDocument}
        projects={projects}
        editingDocument={editingDocument}
      />
    </div>
  );
}