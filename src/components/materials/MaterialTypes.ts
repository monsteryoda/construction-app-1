export interface Material {
  id: string;
  user_id: string;
  no: string;
  type: string;
  description: string;
  quantity: string;
  delivery_order_ref?: string;
  status: string;
  location?: string;
  created_at: string;
  updated_at: string;
}