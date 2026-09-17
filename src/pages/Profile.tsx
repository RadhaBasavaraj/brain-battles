import  { useState, useEffect } from "react";
import { supabase } from "../api/supabaseClient";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { User, Mail, Trophy, Target, Flame, Edit3, Save, X } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../components/ui/use-toast";
import type {Profile} from "../types/Profile"
import ErrorMessage from "./ErrorMessage";
import { useAuth } from '../lib/AuthContext';


export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ display_name: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {

        const { data: profiles, error: profileError } = await supabase
                                                          .from("profiles")
                                                          .select("*")
                                                          .eq("user_id", user?.id);

        if (profileError) {
                  throw profileError;
        }
        if (profiles.length > 0) {
          setProfile(profiles[0]);
          setFormData({ display_name: profiles[0].display_name || "", bio: profiles[0].bio || "" });
        } else {
          setFormData({ display_name: user?.user_metadata?.full_name || "", bio: "" });
        }


          
              } catch (e) { 
        
            if (e instanceof Error) {
              setError(e.message);
            } else {
              setError("User Profile could not be fetched");
            } 
      
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    try {

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(formData)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

      setProfile(data);
      setEditing(false);
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
    } catch (e) {
      toast({ title: "Error", description: "Could not save profile.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if(error){
      return (
       <ErrorMessage message={error}/>
     );
  }

  const stats = [
    { label: "Battles Played", value: profile?.total_battles || 0, icon: Flame, color: "text-chart-4" },
    { label: "Total Score", value: profile?.total_score || 0, icon: Target, color: "text-primary" },
    { label: "Battles Won", value: profile?.battles_won || 0, icon: Trophy, color: "text-chart-3" },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-3xl font-bold mb-8">Your Profile</h1>

        {/*Responsiveness :  <div className="grid grid-cols-3 gap-6"> */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          {/* Responsiveness : <div className="col-span-2 bg-card border border-border rounded-2xl overflow-hidden"> */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden lg:col-span-2">
            <div className="h-28 bg-gradient-to-r from-primary to-primary/70" />
            <div className="px-8 pb-8">
              <div className="-mt-12 mb-6 flex items-end justify-between">
                <div className="w-24 h-24 rounded-2xl bg-card border-4 border-card flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-muted-foreground" />
                </div>
                {!editing ? (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(true)}>
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setEditing(false)}>
                      <X className="w-3.5 h-3.5" /> Cancel
                    </Button>
                    <Button size="sm" className="gap-1.5" onClick={handleSave}>
                      <Save className="w-3.5 h-3.5" /> Save
                    </Button>
                  </div>
                )}
              </div>

              {!editing ? (
                <div>
                  <h2 className="font-display text-2xl font-bold mb-1">
                    {profile?.display_name || user?.user_metadata.full_name || "New User"}
                  </h2>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                    <Mail className="w-3.5 h-3.5" />
                    {user?.email}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {profile?.bio || "No bio added yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Display Name</Label>
                    <Input
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder="Your display name"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Bio</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="font-display text-3xl font-bold">{s.value}</p>
              </div>
            ))}
            {profile?.favorite_category && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <span className="text-sm text-muted-foreground font-medium block mb-2">Favorite Category</span>
                <p className="font-display text-lg font-semibold">{profile.favorite_category}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}