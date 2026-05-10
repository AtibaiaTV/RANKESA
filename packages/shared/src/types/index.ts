export enum PlayerLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum MatchStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  CONFIRMED = 'CONFIRMED',
  DISPUTED = 'DISPUTED',
}

export enum SystemRole {
  ADMIN = 'ADMIN',
  PLAYER = 'PLAYER',
}

export enum Sport {
  TENNIS = 'TENNIS',
  PADEL = 'PADEL',
  SQUASH = 'SQUASH',
  BADMINTON = 'BADMINTON',
  TABLE_TENNIS = 'TABLE_TENNIS',
  BEACH_TENNIS = 'BEACH_TENNIS',
  VOLLEYBALL = 'VOLLEYBALL',
  BASKETBALL = 'BASKETBALL',
  FOOTBALL = 'FOOTBALL',
  CHESS = 'CHESS',
}

export enum BetStatus {
  PENDING = 'PENDING',
  WON = 'WON',
  LOST = 'LOST',
  CANCELLED = 'CANCELLED',
}

export interface Player {
  _id: string
  name: string
  email: string
  avatar?: string
  city: string
  level: PlayerLevel
  elo: number
  wins: number
  losses: number
  matchesPlayed: number
  coins: number
  role: SystemRole
  createdAt: string
}

export interface Match {
  _id: string
  sport: Sport
  player1: Player | string
  player2: Player | string
  winner: Player | string
  score: string
  date: string
  status: MatchStatus
  registeredBy: Player | string
  disputedBy?: Player | string
  disputeReason?: string
  confirmedAt?: string
  createdAt: string
}

export interface Bet {
  _id: string
  match: Match | string
  bettor: Player | string
  predictedWinner: Player | string
  amount: number
  status: BetStatus
  createdAt: string
}

export interface RankingEntry {
  position: number
  player: Player
}

export interface JwtPayload {
  sub: string
  email: string
  role: SystemRole
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
