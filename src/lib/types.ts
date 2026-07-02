export interface Bar {
  id: number;
  created_at?: string;
  name: string;
  address?: string;
  lat?: number;
  long?: number;
  neighborhood?: string;
  url?: string;
  image_url?: string;
  is_flash_active?: boolean;
  flash_description?: string;
  flash_expires_at?: string;
  flash_start_time?: string;
  flash_summary?: string;
  table_reservation?: string;
  bar_description?: string;
  city?: string;
}

export interface Offer {
  id: number;
  bar_id: number;
  'deal summary'?: string;
  day_of_week?: string;
  last_verified?: string;
  deal_description?: string;
  start_time?: string;
  end_time?: string;
}
