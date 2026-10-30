
export interface Leader {
  id: string;
  user_id: string;
  display_name: string;
  total_battles: number;
  battles_won: number;
  total_score: number;
}

export interface DiscussionChampion {
  user_id: string;
  display_name: string | null;
  reply_count: number;
}

export interface MobileLeaderboardProps {
  leaders: Leader[];
  champions: DiscussionChampion[];
  activeTab: "battles" | "discussions";
  currentUserId: string | null;
  getRankIcon: (index: number) => React.ReactNode;
  getRankBg: (index: number) => string;
  onTabChange: (tab: "battles" | "discussions") => void;
  fadeUp: any;
}
