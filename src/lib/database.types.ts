export type Database = {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string;
          name: string;
          price: number;
          frequency: string;
          billing_date: number;
          email: string | null;
          link: string | null;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          frequency?: string;
          billing_date: number;
          email?: string | null;
          link?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          frequency?: string;
          billing_date?: number;
          email?: string | null;
          link?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      free_trials: {
        Row: {
          id: string;
          name: string;
          email: string;
          password: string | null;
          identifier: string | null;
          link: string | null;
          start_date: string;
          end_date: string;
          cancel_date: string | null;
          card_used: string | null;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          password?: string | null;
          identifier?: string | null;
          link?: string | null;
          start_date: string;
          end_date: string;
          cancel_date?: string | null;
          card_used?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          password?: string | null;
          identifier?: string | null;
          link?: string | null;
          start_date?: string;
          end_date?: string;
          cancel_date?: string | null;
          card_used?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
