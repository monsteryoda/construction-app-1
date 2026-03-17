export interface Project {
  id: string;
  project_name: string;
}

export interface ScheduleImage {
  id: string;
  schedule_id: string;
  image_url: string;
  file_name: string;
  created_at: string;
}

export interface Schedule {
  id: string;
  project_id: string;
  task_name: string;
  description: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: string;
  dependencies: string;
  images?: ScheduleImage[];
  projects?: Project;
}