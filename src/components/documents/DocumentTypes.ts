export interface Project {
  id: string;
  project_name: string;
  contractor?: string;
  client?: string;
  consultant?: string;
}

export interface Document {
  id: string;
  user_id: string;
  project_id: string;
  document_name: string;
  document_type: string;
  description?: string;
  file_url?: string;
  file_size?: number;
  version?: string;
  uploaded_at?: string;
  projects?: Project;
  files?: File[];
}

export interface File {
  id: string;
  document_id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  created_at?: string;
}