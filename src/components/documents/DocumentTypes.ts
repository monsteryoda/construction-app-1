export interface Project {
  id: string;
  project_name: string;
}

export interface DocumentFile {
  id: string;
  document_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  version: string;
  uploaded_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  document_name: string;
  document_type: string;
  description: string;
  file_url: string;
  file_size: number;
  version: string;
  uploaded_at: string;
  files?: DocumentFile[];
  projects?: Project;
}