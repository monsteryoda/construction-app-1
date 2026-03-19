"use client";

export interface Project {
  id: string;
  project_name: string;
}

export interface ActivityImage {
  id: string;
  activity_id: string;
  image_url: string;
  file_name: string;
  created_at: string;
}

export interface ActivityRemark {
  id: string;
  activity_id: string;
  remark: string;
  created_by: string;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  project_id: string;
  activity_name: string;
  description: string;
  activity_date: string;
  end_date: string;
  status: string;
  priority: string;
  assigned_to: string;
  progress: number;
  created_at: string;
  updated_at: string;
  projects?: Project;
  images?: ActivityImage[];
  remarks?: ActivityRemark[];
}