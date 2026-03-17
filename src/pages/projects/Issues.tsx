import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import IssueCard from '@/components/issues/IssueCard';
import IssueForm from '@/components/issues/IssueForm';
import { uploadImages, deleteIssueImage } from '@/components/issues/IssueActions';
import { Issue, Project } from '@/components/issues/IssueTypes';

export default function Issues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchIssues();
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

  const fetchIssues = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('project_issues')
        .select('*, projects(project_name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch images for each issue
      const issuesWithImages = await Promise.all(
        (data || []).map(async (issue) => {
          const { data: images } = await supabase
            .from('issue_images')
            .select('*')
            .eq('issue_id', issue.id);

          return { ...issue, images: images || [] };
        })
      );

      setIssues(issuesWithImages);
    } catch (error) {
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIssue = async (issue: any, images: File[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('[handleAddIssue] Creating issue with', images.length, 'images');

      // First create the issue
      const { data: issueData, error: issueError } = await supabase
        .from('project_issues')
        .insert([{
          user_id: user.id,
          ...issue,
        }])
        .select()
        .single();

      if (issueError) {
        console.error('[handleAddIssue] Issue creation error:', issueError);
        throw issueError;
      }

      console.log('[handleAddIssue] Issue created:', issueData.id);

      // Then upload images if any
      if (images.length > 0 && issueData) {
        const uploadedUrls = await uploadImages(issueData.id, user.id, images);
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
      }

      toast.success('Issue added successfully');
      setShowAddDialog(false);
      
      // Reset form
      fetchIssues();
    } catch (error) {
      console.error('[handleAddIssue] Error:', error);
      toast.error('Failed to add issue: ' + (error as Error).message);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Project Issues</h1>
            <p className="text-slate-500 mt-1">Track and resolve project issues</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Report Issue
          </Button>
        </div>

        <IssueForm
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSubmit={handleAddIssue}
          projects={projects}
        />

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : issues.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Issues Reported</h3>
              <p className="text-slate-500 mb-6">All projects are running smoothly</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onDeleteImage={deleteIssueImage}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}