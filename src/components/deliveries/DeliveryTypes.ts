export interface Project {
  id: string;
  project_name: string;
}

export interface DeliveryImage {
  id: string;
  delivery_id: string;
  image_url: string;
  file_name: string;
  created_at: string;
}

export interface Delivery {
  id: string;
  project_id: string;
  delivery_item: string;
  description: string;
  delivery_date: string;
  expected_date: string;
  status: string;
  quantity: number;
  unit: string;
  supplier: string;
  images?: DeliveryImage[];
  projects?: Project;
}