import { Outlet, Link, useLocation } from "react-router-dom";
import { Brain, LayoutDashboard, Swords, BookOpen, Trophy, User,
       LogOut, MessageSquareText, MessageCircle, Home } from "lucide-react";
import { supabase } from "../api/supabaseClient";
import { Button } from "../components/ui/button";
import MobileHeader from "./MobileHeader";
import { useAuth } from "../lib/AuthContext";


const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, requiresAuth: true },
  { label: "Battle", path: "/battle", icon: Swords, requiresAuth: false },
  { label: "Practice", path: "/practice", icon: BookOpen, requiresAuth: false },
  { label: "Discussions", path: "/discussions", icon: MessageCircle, requiresAuth: true },
  { label: "Leaderboard", path: "/leaderboard", icon: Trophy, requiresAuth: true },
  { label: "Profile", path: "/profile", icon: User, requiresAuth: true },
  { label: "Feedback", path: "/feedback", icon: MessageSquareText, requiresAuth: true },
];

export default function AppLayout() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const handleLogout = async () => {
      await supabase.auth.signOut();
      window.location.href = "/";
  };

 return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col fixed top-0 left-0 bottom-0">
        <div className="px-6 h-16 flex items-center gap-2.5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            BrainBattles
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isDisabled = item.requiresAuth && !isAuthenticated;

            const className = `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
              isDisabled
                ? "text-muted-foreground/50 cursor-not-allowed"
                : isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`;

            if (isDisabled) {
              return (
                <div
                  key={item.path}
                  className={className}
                  aria-disabled="true"
                  title="Sign up to unlock this feature"
                >
                  <item.icon className="w-4.5 h-4.5" />
                  {item.label}
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={className}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          ) : (
            <Link
              to="/"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                location.pathname === "/"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Home className="w-4.5 h-4.5" />
              Home
            </Link>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <MobileHeader />

        <main>
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
