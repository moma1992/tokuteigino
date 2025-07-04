export type UserRole = 'student' | 'teacher';

export type SubscriptionPlan = 'free' | 'basic' | 'pro';

export type RelationshipStatus = 'pending' | 'active' | 'inactive';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
  last_active_at?: string | null;
  
  // Student specific fields
  preferred_language?: string | null;
  learning_level?: string | null;
  
  // Teacher specific fields
  organization_name?: string | null;
  teacher_code?: string | null;
  max_students?: number | null;
  subscription_plan?: SubscriptionPlan | null;
  subscription_status?: string | null;
}

export interface TeacherStudent {
  id: string;
  teacher_id: string;
  student_id: string;
  invitation_code?: string | null;
  status: RelationshipStatus;
  invited_at: string;
  joined_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'teacher_code'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          teacher_code?: string | null;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'teacher_code'>>;
      };
      teacher_students: {
        Row: TeacherStudent;
        Insert: Omit<TeacherStudent, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<TeacherStudent, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {};
    Functions: {
      generate_teacher_code: {
        Args: {};
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
    };
  };
}