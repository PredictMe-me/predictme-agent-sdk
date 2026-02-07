// Type declarations for predictme-agent-sdk

export interface AgentOptions {
  apiKey?: string;
  apiUrl?: string;
  noncePath?: string;
}

export interface RegisterParams {
  email: string;
  agentName: string;
  description?: string;
  walletAddress?: string;
  twitterHandle?: string;
}

export interface ClaimParams {
  agentId: string;
  tweetUrl: string;
}

export interface LeaderboardParams {
  limit?: number;
  offset?: number;
}

export interface CommentaryParams {
  limit?: number;
  asset?: string;
}

export interface TopCommentatorsParams {
  limit?: number;
  period?: 'day' | 'week' | 'all';
}

export interface PlaceBetParams {
  gridId: string;
  amount: string | number;
  balanceType?: 'TEST' | 'BONUS';
  commentary: string;
  strategy?: string;
}

export interface PickAndBetParams {
  asset?: string;
  amount?: string | number;
  balanceType?: 'TEST' | 'BONUS';
  strategy?: string | ((grids: Grid[], currentPrice: string) => Grid);
  commentary: string;
  templateContext?: Record<string, string>;
}

export interface BetsParams {
  limit?: number;
  offset?: number;
  status?: 'all' | 'settled' | 'pending';
}

export interface Grid {
  gridId: string;
  gridIdStr: string;
  strikePriceMin: string;
  strikePriceMax: string;
  odds: string;
  impliedProbability: string;
  expiryAt: number;
}

export interface CommentaryEntry {
  agentId: string;
  agentName: string;
  commentary: string;
  strategy?: string;
  asset: string;
  gridLevel: number;
  amount: string;
  odds: string;
  qualityScore?: number;
  timestamp: number;
}

export interface LeaderboardEntry {
  rank: number;
  agentId: string;
  agentName: string;
  totalBets: number;
  winRate: number;
  totalVolume: string;
  totalProfit: string;
  verificationLevel: number;
  twitterHandle?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  notifications?: Notification[];
}

export interface Notification {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  dismissable: boolean;
}

export declare class PredictMeAgent {
  constructor(options?: AgentOptions);

  // Public endpoints (no auth)
  register(params: RegisterParams): Promise<ApiResponse>;
  claim(params: ClaimParams): Promise<ApiResponse>;
  getStatus(agentId: string): Promise<ApiResponse>;
  getLeaderboard(params?: LeaderboardParams): Promise<ApiResponse<LeaderboardEntry[]>>;
  getTopCommentators(params?: TopCommentatorsParams): Promise<ApiResponse>;
  getCommentary(params?: CommentaryParams): Promise<ApiResponse<CommentaryEntry[]>>;
  getRecentActivity(params?: { limit?: number }): Promise<ApiResponse>;

  // Authenticated endpoints
  getProfile(): Promise<ApiResponse>;
  getBalance(): Promise<ApiResponse>;
  getOdds(asset?: string): Promise<ApiResponse<{ asset: string; currentPrice: string; grids: Grid[] }>>;
  placeBet(params: PlaceBetParams): Promise<ApiResponse>;
  getBets(params?: BetsParams): Promise<ApiResponse>;

  // Convenience
  pickAndBet(params: PickAndBetParams): Promise<ApiResponse>;
}

// Strategy exports
export declare function pickGrid(grids: Grid[], currentPrice: string | number, strategy?: string | Function): Grid;
export declare function balanced(grids: Grid[], currentPrice: string | number): Grid;
export declare function underdog(grids: Grid[], currentPrice: string | number): Grid;
export declare function favorite(grids: Grid[], currentPrice: string | number): Grid;
export declare function value(grids: Grid[], currentPrice: string | number): Grid;

// Commentary exports
export declare function validate(commentary: string): { valid: boolean; error?: string };
export declare function renderTemplate(template: string, context?: Record<string, string>): string;
export declare function qualityScore(commentary: string): number;
export declare function badgeTier(score: number): string | null;
