import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import { Swords, BookOpen, Trophy, User, ArrowRight, Flame, Target, Award } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import ErrorMessage from "./ErrorMessage";
import { useAuth } from '../lib/AuthContext';


const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

const cards = [
  {
    title: "Battle Mode",
    desc: "Test yourself with timed quizzes. Beat the clock and earn points!",
    icon: Swords,
    path: "/battle",
    gradient: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-100 text-violet-600",
  },
  {
    title: "Practice",
    desc: "Learn at your own pace with unlimited practice questions.",
    icon: BookOpen,
    path: "/practice",
    gradient: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Leaderboard",
    desc: "See where you stand among the top performers.",
    icon: Trophy,
    path: "/leaderboard",
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-100 text-amber-600",
  },
  {
    title: "Profile",
    desc: "View and edit your profile, track your progress.",
    icon: User,
    path: "/profile",
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-100 text-blue-600",
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ battles: 0, score: 0, won: 0 });
  const [error, setError] = useState<string | null>(null);
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
          setStats({
            battles: profiles[0].total_battles || 0,
            score: profiles[0].total_score || 0,
            won: profiles[0].battles_won || 0,
          });
        }
      } catch (e) { 

        
            if (e instanceof Error) {
              setError(e.message);
            } else {
              setError("Something went wrong");
            } 
        
       }
    };
    load();
  }, []);

  const statCards = [
    { label: "Battles Played", value: stats.battles, icon: Flame, color: "text-chart-4" },
    { label: "Total Score", value: stats.score, icon: Target, color: "text-primary" },
    { label: "Battles Won", value: stats.won, icon: Award, color: "text-chart-3" },
  ];

   if(error){
      return (
       <ErrorMessage message={error}/>  
     );
  }

  return (
    <div>
      {/* Welcome */}
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        {/*Responsiveness :  <h1 className="font-display text-3xl font-bold mb-1"> */}
        <h1 className="font-display text-2xl font-bold mb-1 sm:text-3xl">
          Welcome back{user?.user_metadata.full_name ? `, ${user.user_metadata.full_name}` : ""}!
        </h1>
        <p className="text-muted-foreground mb-8">Ready to challenge your brain today?</p>
      </motion.div>

      {/* Stats */}
      {/* Responsiveness : <div className="grid grid-cols-3 gap-5 mb-10"> */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial="hidden"
            animate="visible"
            custom={i + 1}
            variants={fadeUp}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="font-display text-3xl font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Action Cards */}
      <motion.h2
        initial="hidden"
        animate="visible"
        custom={4}
        variants={fadeUp}
        className="font-display text-xl font-semibold mb-5"
      >
        Quick Actions
      </motion.h2>
      {/*Responsiveness : <div className="grid grid-cols-2 gap-5"> */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2"> 
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial="hidden"
            animate="visible"
            custom={i + 5}
            variants={fadeUp}
          >
            <Link
              to={card.path}
              className="group block bg-card border border-border rounded-2xl p-7 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-1.5">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}