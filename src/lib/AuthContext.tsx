import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../api/supabaseClient';
import type { AuthContextType } from '../types/AuthContextType';
import type { User } from '@supabase/supabase-js';
const AuthContext = createContext<AuthContextType | null>(null);


export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);


  useEffect(() => {
  checkUserAuth();
   }, []);


  const checkUserAuth = async () => {
    try {
      // Check if the user is authenticated
      setIsLoadingAuth(true);
      const {data, error} = await supabase.auth.getUser();
      if(error) throw error;
      const currentUser = data.user;
      
      // Create profile for first-time user
const { error: profileError } = await supabase
  .from("profiles")
  .upsert(
    {
      user_id: currentUser.id,
      display_name: currentUser.user_metadata?.full_name || "",
      bio: "",
      total_battles: 0,
      total_score: 0,
      battles_won: 0,
      favorite_category: "",
    },
    {
      onConflict: "user_id",
      ignoreDuplicates: true,
    }
  );

      if (profileError) {
        throw profileError;
      }
    
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } catch (error) {


      console.error('User auth check failed:', error);

      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setAuthChecked(true);
      setUser(null);
      
    }
  };


  const navigateToLogin = () => {

    const currentPath = window.location.pathname;
      window.location.href = `/login?redirect=${currentPath}`;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      authChecked,
      navigateToLogin,
      checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
