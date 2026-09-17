import { Outlet, Link, useLocation } from "react-router-dom";
import { Brain, LayoutDashboard, Swords, BookOpen, Trophy, User, LogOut } from "lucide-react";
import { supabase } from "../api/supabaseClient";
import { Button } from "../components/ui/button";
import MobileHeader from "./MobileHeader";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Battle", path: "/battle", icon: Swords },
  { label: "Practice", path: "/practice", icon: BookOpen },
  { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
  { label: "Profile", path: "/profile", icon: User },
];

export default function AppLayout() {
  const location = useLocation();

  const handleLogout = async () => {
      await supabase.auth.signOut();
      window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      {/* Responsive : <aside className="w-64 border-r border-border bg-card flex flex-col fixed top-0 left-0 bottom-0"> */}
      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col fixed top-0 left-0 bottom-0"> 
        <div className="px-6 h-16 flex items-center gap-2.5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">BrainBattles</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>


          { /* Responsive : Mobile Header and div added*/}
    <div className="flex-1 md:ml-64">
    <MobileHeader />

      {/* Main content - className="flex-1 ml-64"  has been removed since added a wrapper div*/}
      <main> 
        {/* Responsive:  <div className="max-w-6xl mx-auto px-8 py-8"> */}
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8"> 
          <Outlet />
        </div>
      </main>

      </div>
    </div>
  );
}