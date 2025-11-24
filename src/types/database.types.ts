export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string;
          role: 'resident' | 'admin' | 'cleaner' | 'security';
          phone?: string;
          address?: string;
          block_no?: string;
          apartment_no?: string;
        };
        Insert: {
          id: string;
          full_name: string;
          avatar_url: string;
          role: 'resident' | 'admin' | 'cleaner' | 'security';
          phone?: string;
          address?: string;
          block_no?: string;
          apartment_no?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string;
          role?: 'resident' | 'admin' | 'cleaner' | 'security';
          phone?: string;
          address?: string;
          block_no?: string;
          apartment_no?: string;
        };
      };
      parking_spots: {
        Row: {
          id: number;
          location_code: string;
          is_occupied: boolean;
          occupied_by: string | null;
        };
        Insert: {
          id?: number;
          location_code: string;
          is_occupied: boolean;
          occupied_by?: string | null;
        };
        Update: {
          id?: number;
          location_code?: string;
          is_occupied?: boolean;
          occupied_by?: string | null;
        };
      };
      emergency_alerts: {
        Row: {
          id: number;
          created_at: string;
          type: string;
          message: string;
          active: boolean;
        };
        Insert: {
          id?: number;
          created_at?: string;
          type: string;
          message: string;
          active: boolean;
        };
        Update: {
          id?: number;
          created_at?: string;
          type?: string;
          message?: string;
          active?: boolean;
        };
      };
      reservations: {
        Row: {
          id: number;
          user_id: string;
          facility_name: string;
          date: string;
          time_slot: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          facility_name: string;
          date: string;
          time_slot: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          facility_name?: string;
          date?: string;
          time_slot?: string;
          created_at?: string;
        };
      };
      announcements: {
        Row: {
          id: number;
          title: string;
          content: string;
          date: string;
          priority: 'low' | 'high';
          created_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          content: string;
          date?: string;
          priority?: 'low' | 'high';
          created_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          content?: string;
          date?: string;
          priority?: 'low' | 'high';
          created_at?: string;
        };
      };
      service_requests: {
        Row: {
          id: number;
          user_id: string;
          category: 'maintenance' | 'cleaning' | 'security';
          description: string;
          status: 'pending' | 'in_progress' | 'resolved';
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          category: 'maintenance' | 'cleaning' | 'security';
          description: string;
          status?: 'pending' | 'in_progress' | 'resolved';
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          category?: 'maintenance' | 'cleaning' | 'security';
          description?: string;
          status?: 'pending' | 'in_progress' | 'resolved';
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: number;
          user_id: string;
          amount: number;
          type: 'aidat' | 'demirbas' | 'ceza';
          status: 'paid' | 'unpaid';
          due_date: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          amount: number;
          type: 'aidat' | 'demirbas' | 'ceza';
          status?: 'paid' | 'unpaid';
          due_date: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          amount?: number;
          type?: 'aidat' | 'demirbas' | 'ceza';
          status?: 'paid' | 'unpaid';
          due_date?: string;
          created_at?: string;
        };
      };
      guests: {
        Row: {
          id: number;
          user_id: string;
          full_name: string;
          plate_number: string | null;
          visit_date: string;
          status: 'expected' | 'arrived' | 'departed';
          qr_token: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          full_name: string;
          plate_number?: string | null;
          visit_date: string;
          status?: 'expected' | 'arrived' | 'departed';
          qr_token?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          full_name?: string;
          plate_number?: string | null;
          visit_date?: string;
          status?: 'expected' | 'arrived' | 'departed';
          qr_token?: string;
          created_at?: string;
        };
      };
      marketplace_items: {
        Row: {
          id: number;
          user_id: string;
          title: string;
          price: number;
          description: string;
          image_url: string;
          status: 'active' | 'sold';
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          title: string;
          price?: number;
          description: string;
          image_url?: string;
          status?: 'active' | 'sold';
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          title?: string;
          price?: number;
          description?: string;
          image_url?: string;
          status?: 'active' | 'sold';
          created_at?: string;
        };
      };
      site_events: {
        Row: {
          id: number;
          title: string;
          date: string;
          location: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          date: string;
          location: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          date?: string;
          location?: string;
          description?: string;
          created_at?: string;
        };
      };
      service_logs: {
        Row: {
          id: number;
          resident_id: string;
          staff_id: string | null;
          type: 'garbage' | 'repair';
          status: 'pending' | 'completed';
          coordinates: { latitude: number; longitude: number } | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          resident_id: string;
          staff_id?: string | null;
          type: 'garbage' | 'repair';
          status?: 'pending' | 'completed';
          coordinates?: { latitude: number; longitude: number } | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          resident_id?: string;
          staff_id?: string | null;
          type?: 'garbage' | 'repair';
          status?: 'pending' | 'completed';
          coordinates?: { latitude: number; longitude: number } | null;
          created_at?: string;
        };
      };
      staff_locations: {
        Row: {
          user_id: string;
          latitude: number;
          longitude: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          latitude: number;
          longitude: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          latitude?: number;
          longitude?: number;
          updated_at?: string;
        };
      };
    };
  };
}
