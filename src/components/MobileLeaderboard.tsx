import { motion } from "framer-motion";
import { User } from "lucide-react";
import type { MobileLeaderboardProps } from "../types/MobileLeaderboardProps";

export default function MobileLeaderboard({
  leaders,
  currentUserId,
  getRankIcon,
  getRankBg,
  fadeUp,
}: MobileLeaderboardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {leaders.map((leader, i) => {
        const isCurrentUser = leader.user_id === currentUserId;

        return (
          <motion.div
            key={leader.id}
            initial="hidden"
            animate="visible"
            custom={i + 1}
            variants={fadeUp}
            className={`flex items-center gap-3 px-4 py-4 border-b border-border/50 last:border-0 ${
              isCurrentUser ? "bg-primary/5" : ""
            }`}
          >
            {/* Rank */}
            <div className="w-8 shrink-0 flex items-center justify-center">
              {getRankIcon(i) || (
                <span className="text-sm font-medium text-muted-foreground">
                  {i + 1}
                </span>
              )}
            </div>

            {/* Player */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${
                  i < 3 ? getRankBg(i) : "bg-muted"
                }`}
              >
                <User className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-semibold truncate">
                    {leader.display_name}
                  </span>

                  {isCurrentUser && (
                    <span className="shrink-0 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  {leader.total_battles || 0} Battles ·{" "}
                  {leader.battles_won || 0} Won
                </p>
              </div>
            </div>

            {/* Score */}
            <div className="shrink-0 text-right">
              <span className="font-display font-bold text-lg">
                {leader.total_score || 0}
              </span>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}