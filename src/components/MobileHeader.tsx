import { useState } from "react";
import {
  Brain,
  Menu,
  X,
  LayoutDashboard,
  Swords,
  BookOpen,
  Trophy,
  User,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import { Button } from "../components/ui/button";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Battle", path: "/battle", icon: Swords },
  { label: "Practice", path: "/practice", icon: BookOpen },
  { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
  { label: "Profile", path: "/profile", icon: User },
];

export default function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="md:hidden">
      {/* Header */}
      <div className="h-16 border-b border-border bg-card flex items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="w-4.5 h-4.5 text-primary-foreground" />
          </div>

          <span className="font-display text-lg font-bold tracking-tight">
            BrainBattles
          </span>
        </div>

        {/* Menu button */}
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-muted"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="border-b border-border bg-card px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-3 pt-3 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}