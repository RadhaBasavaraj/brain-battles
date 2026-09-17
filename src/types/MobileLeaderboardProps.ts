export interface Leader {
  id: string;
  user_id: string;
  display_name: string;
  total_battles: number;
  battles_won: number;
  total_score: number;
}

export interface MobileLeaderboardProps {
  leaders: Leader[];
  currentUserId: string | null;
  getRankIcon: (index: number) => React.ReactNode;
  getRankBg: (index: number) => string;
  fadeUp: any;
}