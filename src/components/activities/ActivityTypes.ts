export interface Remark {
  id: string;
  activity_id: string;
  remark: string;
  created_by: string;
  created_at: string;
}

export interface ActivityImage {
  id: string;
  activity_id: string;
  image_url: string;
  file_name: string;
  created_at: string;
}

export interface Activity {
  id: string;
  project_id: string;
  activity_name: string;
  description: string;
  activity_date: string;
  end_date: string;
  status: string;
  priority: string;
  assigned_to: string;
  remarks?: Remark[];
  images?: ActivityImage[];
}

export interface Project {
  id: string;
  project_name: string;
}