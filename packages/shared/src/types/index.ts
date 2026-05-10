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
  role: SystemRole
  createdAt: string
}

export interface Match {
  _id: string
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
