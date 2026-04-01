export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          full_name?: string | null;
        };
      };
      estimates: {
        Row: {
          id: string;
          user_id: string;
          project_name: string;
          currency: string;
          original_file_path: string;
          source_xml: Json;
          total_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_name: string;
          currency?: string;
          original_file_path: string;
          source_xml?: Json;
          total_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          project_name?: string;
          currency?: string;
          total_amount?: number;
          updated_at?: string;
        };
      };
      estimate_items: {
        Row: {
          id: string;
          estimate_id: string;
          line_index: number;
          postnr: string;
          code: string;
          title: string;
          description: string;
          unit: string;
          quantity: number;
          unit_price: number | null;
          comment: string | null;
          line_total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          estimate_id: string;
          line_index: number;
          postnr?: string;
          code?: string;
          title?: string;
          description?: string;
          unit?: string;
          quantity?: number;
          unit_price?: number | null;
          comment?: string | null;
          line_total?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          unit_price?: number | null;
          comment?: string | null;
          line_total?: number;
          updated_at?: string;
        };
      };
    };
    Functions: {
      recalculate_estimate_total: {
        Args: {
          estimate_uuid: string;
        };
        Returns: undefined;
      };
    };
  };
};
