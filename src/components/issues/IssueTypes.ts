"use client";

export interface Project {
  id: string;
  project_name: string;
  contract_number?: string;
  client?: string;
  consultant?: string;
  contractor?: string;
  contract_period?: number;
  date_of_commence?: string;
  date_of_completion?: string;
  defect_liability_period?: number;
  project_image_url?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Remark {
  id: string;
  remark: string;
  created_by: string;
  created_at: string;
}

export interface Issue {
  id: string;
  user_id: string;
  project_id: string;
  issue_title: string;
  description?: string;
  issue_type?: string;
  severity?: string;
  status?: string;
  reported_by?: string;
  assigned_to?: string;
  reported_date?: string;
  resolved_date?: string;
  resolution_notes?: string;
  created_at?: string;
  updated_at?: string;
  projects?: Project;
  images?: {
    id: string;
    image_url: string;
    file_name: string;
    created_at: string;
  }[];
  activity_remarks?: Remark[];
}