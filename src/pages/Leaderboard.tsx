import { useState, useEffect, useCallback  } from "react";
import { supabase } from "../api/supabaseClient";
import { Trophy, Medal, Crown, User, MessageCircle  } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import type { Profile } from "../types/Profile";
import MobileLeaderboard from "../components/MobileLeaderboard";
import ErrorMessage from "./ErrorMessage";
import { useAuth } from "../lib/AuthContext";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i:number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: "easeOut" },
  }),
};

type DiscussionChampion = {
  user_id: string;
  display_name: string | null;
  reply_count: number;
};

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderBoardError, setleaderBoardError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
  "battles" | "discussions"
>("battles");

const [champions, setChampions] = useState<
  DiscussionChampion[]
>([]);
const [championsLoading, setChampionsLoading] = useState(false);
const [championsError, setChampionsError] = useState<string | null>(null);
  const { user } = useAuth(); 

  useEffect(() => {
    const load = async () => {
      try {

        const { data: profiles, error: profileError  } = await supabase
                .from("profiles")
                .select("*")
                .order("total_score", { ascending: false })
                .limit(50);

              if (profileError) {
                throw profileError;
              }

        setLeaders(profiles);
      } catch (e) {
          if (e instanceof Error) {
              setleaderBoardError(e.message);
            } else {
              setleaderBoardError("Leaders could not be fetched");
            } 
      }
      setLoading(false);
    };
    load();
  }, []);

  

 const loadDiscussionChampions = useCallback(async () => {
  setChampionsLoading(true);
  setChampionsError(null);

  try {
    const { data, error } = await supabase.rpc(
      "get_discussion_champions"
    );

    if (error) {
      throw error;
    }

    setChampions(data ?? []);
  } catch (e) {
    if (e instanceof Error) {
      setChampionsError(e.message);
    } else {
      setChampionsError(
        "Discussion Champions could not be fetched"
      );
    }
  } finally {
    setChampionsLoading(false);
  }
}, []);

useEffect(() => {
  if (activeTab === "discussions") {
    loadDiscussionChampions();
  }
}, [activeTab, loadDiscussionChampions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

   if(leaderBoardError){
      return (
        <ErrorMessage message={leaderBoardError}/>
     );
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-amber-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-slate-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-700" />;
    return null;
  };

  const getRankBg = (index: number) => {
    if (index === 0) return "bg-amber-50 border-amber-200";
    if (index === 1) return "bg-slate-50 border-slate-200";
    if (index === 2) return "bg-orange-50 border-orange-200";
    return "bg-card border-border";
  };

  return (
  
    <>
    {/* Desktop or Tablet */}
    {/* Responsiveness :  <div> */}
    <div className="hidden sm:block">
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Leaderboard</h1>
            <p className="text-muted-foreground text-sm">Explore battle performance and community contributions</p>
          </div>
        </div>
      </motion.div>

      <div
  className="flex gap-2 mb-6 border-b border-border"
  role="tablist"
  aria-label="Leaderboard categories"
>
  <button
    type="button"
    role="tab"
    aria-selected={activeTab === "battles"}
    onClick={() => setActiveTab("battles")}
    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
      activeTab === "battles"
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`}
  >
    <Trophy className="w-4 h-4 inline mr-2" />
    Battle Leaderboard
  </button>

  <button
    type="button"
    role="tab"
    aria-selected={activeTab === "discussions"}
    onClick={() => setActiveTab("discussions")}
    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
      activeTab === "discussions"
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`}
  >
    <MessageCircle className="w-4 h-4 inline mr-2" />
    Discussion Champions
  </button>
</div>

{activeTab === "battles" ? (
  leaders.length === 0 ? (
    // Keep your existing "No scores yet" JSX here
     <motion.div
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="bg-card border border-border rounded-2xl p-12 text-center"
        >
          <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold mb-2">No scores yet</h3>
          <p className="text-muted-foreground text-sm">Complete a battle to appear on the leaderboard!</p>
        </motion.div>
  ) : (
    // Keep your existing battle leaderboard table JSX here
     <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Player</div>
            <div className="col-span-2 text-center">Battles</div>
            <div className="col-span-2 text-center">Won</div>
            <div className="col-span-2 text-right">Score</div>
          </div>

          {/* Rows */}
          {leaders.map((leader, i) => {
            const isCurrentUser = leader.user_id === user?.id;
            return (
              <motion.div
                key={leader.id}
                initial="hidden"
                animate="visible"
                custom={i + 1}
                variants={fadeUp}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-border/50 last:border-0 transition-colors ${
                  isCurrentUser ? "bg-primary/5" : "hover:bg-muted/30"
                }`}
              >
                <div className="col-span-1 flex items-center">
                  {getRankIcon(i) || (
                    <span className="text-sm font-medium text-muted-foreground w-5 text-center">{i + 1}</span>
                  )}
                </div>
                <div className="col-span-5 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${i < 3 ? getRankBg(i) : "bg-muted"}`}>
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold">
                      {leader.display_name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 text-center text-sm text-muted-foreground">
                  {leader.total_battles || 0}
                </div>
                <div className="col-span-2 text-center text-sm text-muted-foreground">
                  {leader.battles_won || 0}
                </div>
                <div className="col-span-2 text-right">
                  <span className="font-display font-bold text-lg">{leader.total_score || 0}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
  )
) : (
  // Discussion Champions content goes here
  <div className="bg-card border border-border rounded-2xl overflow-hidden">
  {championsLoading ? (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  ) : championsError ? (
    <div className="p-6">
      <ErrorMessage message={championsError} />
    </div>
  ) : champions.length === 0 ? (
    <div className="p-12 text-center">
      <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
      <h3 className="font-display text-lg font-semibold mb-2">
        No discussion contributions yet
      </h3>
      <p className="text-muted-foreground text-sm">
        Reply to another student's question to become a Discussion Champion!
      </p>
    </div>
  ) : (
    <div>
      <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <div className="col-span-1">Rank</div>
        <div className="col-span-8">Student</div>
        <div className="col-span-3 text-right">Helpful Replies</div>
      </div>

      {champions.map((champion, i) => {
        const isCurrentUser = champion.user_id === user?.id;

        return (
          <motion.div
            key={champion.user_id}
            initial="hidden"
            animate="visible"
            custom={i + 1}
            variants={fadeUp}
            className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-border/50 last:border-0 transition-colors ${
              isCurrentUser ? "bg-primary/5" : "hover:bg-muted/30"
            }`}
          >
            <div className="col-span-1 flex items-center">
              {getRankIcon(i) || (
                <span className="text-sm font-medium text-muted-foreground w-5 text-center">
                  {i + 1}
                </span>
              )}
            </div>

            <div className="col-span-8 flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  i < 3 ? getRankBg(i) : "bg-muted"
                }`}
              >
                <User className="w-4 h-4 text-muted-foreground" />
              </div>

              <span className="text-sm font-semibold">
                {champion.display_name || "Student"}
                {isCurrentUser && (
                  <span className="ml-2 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </span>
            </div>

            <div className="col-span-3 text-right">
              <span className="font-display font-bold text-lg">
                {champion.reply_count}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  )}
</div>
)}

   
    </div>

   {/* Mobile */}
    <div className="sm:hidden">
     <MobileLeaderboard
  leaders={leaders}
  champions={champions}
  activeTab={activeTab}
  currentUserId={user ? user.id : ""}
  getRankIcon={getRankIcon}
  getRankBg={getRankBg}
  fadeUp={fadeUp}
   onTabChange={setActiveTab}
/>
    </div>
    </>
  );
}