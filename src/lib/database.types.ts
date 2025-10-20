// Define the database schema types for Supabase.
export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          sport: string;
          description: string | null;
          date: string;
          venues: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          sport: string;
          description?: string | null;
          date: string;
          venues: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          sport?: string;
          description?: string | null;
          date?: string;
          venues?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};