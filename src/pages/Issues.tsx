"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Issue, Project } from '@/components/issues/IssueTypes';
import IssueCard from '@/components/issues/IssueCard';
import IssueForm from '@/components/issues/IssueForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function Issues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchIssues();
    fetchProjects();
  }, []);

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('project_issues')
        .select(`
          *,
          projects (
            id,
            project_name
          ),
          issue_images (
            id,
            image_url,
            file_name,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group images by issue_id
      const issuesWithImages = (data || []).map((issue: any) => ({
        ...issue,
        images: issue.issue_images || [],
      })).map(({ issue_images, ...issue }) => issue);

      setIssues(issuesWithImages || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to load issues');
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

  const handleAddIssue = async (formData: any, images: File[]) => {
    try {
      // Create issue record
      const { data: issueData, error: issueError } = await supabase
        .from('project_issues')
        .insert({
          project_id: formData.project_id,
          issue_title: formData.issue_title,
          description: formData.description || null,
          issue_type: formData.issue_type || 'general',
          severity: formData.severity || 'medium',
          status: formData.status || 'open',
          reported_by: formData.reported_by || null,
          assigned_to: formData.assigned_to || null,
          reported_date: formData.reported_date || null,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (issueError) throw issueError;

      // Upload images
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${issueData.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('issue_images')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('issue_images')
          .getPublicUrl(filePath);

        // Save image record
        await supabase
          .from('issue_images')
          .insert({
            issue_id: issueData.id,
            image_url: publicUrl,
            file_name: image.name,
          });
      }

      toast.success('Issue added successfully');
      fetchIssues();
    } catch (error) {
      console.error('Error adding issue:', error);
      throw error;
    }
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('project_issues')
        .update({ status: newStatus })
        .eq('id', issueId);

      if (error) throw error;

      toast.success('Issue status updated');
      fetchIssues();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('issue_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      toast.success('Image deleted successfully');
      fetchIssues();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const filteredIssues = issues.filter(issue =>
    issue.issue_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.projects?.project_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Issues</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Report Issue
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search issues..."
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
      ) : filteredIssues.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p>No issues found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onDeleteImage={handleDeleteImage}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <IssueForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleAddIssue}
        projects={projects}
      />
    </div>
  );
}