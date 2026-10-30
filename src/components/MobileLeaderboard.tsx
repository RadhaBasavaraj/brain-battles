
import { motion } from "framer-motion";
import { User, Trophy, MessageCircle } from "lucide-react";
import type { MobileLeaderboardProps } from "../types/MobileLeaderboardProps";

export default function MobileLeaderboard({
  leaders,
  champions,
  activeTab,
  currentUserId,
  getRankIcon,
  getRankBg,
  fadeUp,
  onTabChange
}: MobileLeaderboardProps) {
  const isDiscussionTab = activeTab === "discussions";
  const isEmpty = isDiscussionTab
    ? champions.length === 0
    : leaders.length === 0;

  return (
    <div className="space-y-4">
      {/* Mobile tabs */}
      <div
        className="flex gap-2 border-b border-border"
        role="tablist"
        aria-label="Leaderboard categories"
      >
        <button
          type="button"
          role="tab"
          aria-selected={!isDiscussionTab}
          className={`flex-1 px-2 py-3 text-sm font-medium border-b-2 ${
            !isDiscussionTab
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          }`}
          onClick={() => onTabChange("battles")}
        >
          <Trophy className="w-4 h-4 inline mr-1" />
          Battles
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={isDiscussionTab}
          className={`flex-1 px-2 py-3 text-sm font-medium border-b-2 ${
            isDiscussionTab
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          }`}
          onClick={() => onTabChange("discussions")}
        >
          <MessageCircle className="w-4 h-4 inline mr-1" />
          Champions
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isEmpty ? (
          <div className="p-8 text-center">
            {isDiscussionTab ? (
              <>
                <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-display font-semibold mb-2">
                  No discussion contributions yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Reply to another student's question to become a Discussion
                  Champion!
                </p>
              </>
            ) : (
              <>
                <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-display font-semibold mb-2">
                  No scores yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Complete a battle to appear on the leaderboard!
                </p>
              </>
            )}
          </div>
        ) : isDiscussionTab ? (
          champions.map((champion, i) => {
            const isCurrentUser = champion.user_id === currentUserId;

            return (
              <motion.div
                key={champion.user_id}
                initial="hidden"
                animate="visible"
                custom={i + 1}
                variants={fadeUp}
                className={`flex items-center gap-3 px-4 py-4 border-b border-border/50 last:border-0 ${
                  isCurrentUser ? "bg-primary/5" : ""
                }`}
              >
                <div className="w-8 shrink-0 flex items-center justify-center">
                  {getRankIcon(i) || (
                    <span className="text-sm font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                  )}
                </div>

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
                        {champion.display_name || "Student"}
                      </span>

                      {isCurrentUser && (
                        <span className="shrink-0 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="font-display font-bold text-lg">
                    {champion.reply_count}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Helpful replies
                  </p>
                </div>
              </motion.div>
            );
          })
        ) : (
          leaders.map((leader, i) => {
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
                <div className="w-8 shrink-0 flex items-center justify-center">
                  {getRankIcon(i) || (
                    <span className="text-sm font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                  )}
                </div>

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

                <div className="shrink-0 text-right">
                  <span className="font-display font-bold text-lg">
                    {leader.total_score || 0}
                  </span>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
