export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string;
          role: string;
        };
        Insert: {
          id: string;
          full_name: string;
          avatar_url: string;
          role: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string;
          role?: string;
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
    };
  };
}
