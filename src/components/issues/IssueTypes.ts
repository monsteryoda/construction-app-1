export interface Project {
  id: string;
  project_name: string;
}

export interface IssueImage {
  id: string;
  issue_id: string;
  image_url: string;
  file_name: string;
  created_at: string;
}

export interface Issue {
  id: string;
  project_id: string;
  issue_title: string;
  description: string;
  issue_type: string;
  severity: string;
  status: string;
  reported_by: string;
  assigned_to: string;
  reported_date: string;
  resolved_date: string;
  resolution_notes: string;
  images?: IssueImage[];
  projects?: Project;
}