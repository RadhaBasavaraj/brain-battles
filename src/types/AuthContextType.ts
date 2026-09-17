import type { User } from '@supabase/supabase-js';


export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  authChecked: boolean;
  navigateToLogin: () => void;
  checkUserAuth: () => Promise<void>;
}