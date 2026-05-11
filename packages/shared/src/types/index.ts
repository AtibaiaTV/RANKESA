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
  BEACH_VOLLEYBALL = 'BEACH_VOLLEYBALL',
  FOOTVOLLEY = 'FOOTVOLLEY',
  FUTSAL = 'FUTSAL',
  BASKETBALL = 'BASKETBALL',
  FOOTBALL = 'FOOTBALL',
  HANDBALL = 'HANDBALL',
  CHESS = 'CHESS',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum MatchType {
  INDIVIDUAL = 'INDIVIDUAL',
  DOUBLES = 'DOUBLES',
  TEAM = 'TEAM',
}

export enum GenderType {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  MIXED = 'MIXED',
}

export enum ScheduleStatus {
  OPEN = 'OPEN',
  FULL = 'FULL',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum BetStatus {
  PENDING = 'PENDING',
  WON = 'WON',
  LOST = 'LOST',
  CANCELLED = 'CANCELLED',
}

export enum ReportCategory {
  FAKE_RESULT  = 'FAKE_RESULT',   // resultado registrado diferente do real
  BAD_CONDUCT  = 'BAD_CONDUCT',   // má conduta desportiva
}

export enum ReportStatus {
  PENDING   = 'PENDING',    // aguardando análise do admin
  REVIEWED  = 'REVIEWED',   // admin analisou, não agiu
  DISMISSED = 'DISMISSED',  // admin rejeitou denúncia
  ACTED     = 'ACTED',      // admin aplicou punição
}

export enum SubscriptionStatus {
  TRIAL    = 'TRIAL',    // 3-month free trial
  ACTIVE   = 'ACTIVE',   // pagamento em dia
  OVERDUE  = 'OVERDUE',  // pagamento atrasado
  INACTIVE = 'INACTIVE', // cancelado / sem assinatura
}

export interface Player {
  _id: string
  name: string
  email: string
  avatar?: string
  city: string
  level: PlayerLevel
  gender?: Gender
  elo: number
  wins: number
  losses: number
  matchesPlayed: number
  boletas: number
  sport: Sport
  venue?: string
  region?: string
  state?: string
  country?: string
  birthDate?: string
  role: SystemRole
  subscriptionStatus?: SubscriptionStatus
  trialEndsAt?: string
  suspensionCount: number
  suspendedUntil?: string
  flaggedForBan: boolean
  phone?: string
  createdAt: string
}

export interface Report {
  _id: string
  reporter: Player | string
  reportedPlayer: Player | string
  matchRef?: Match | string
  category: ReportCategory
  reason: string
  status: ReportStatus
  offenseNumber: number
  suspensionDays?: number
  adminNotes?: string
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

export interface MvpVote {
  voter: string
  nominee: string
}

export interface ScheduledMatch {
  _id: string
  sport: Sport
  matchType: MatchType
  genderType: GenderType
  organizer: Player | string
  title: string
  description?: string
  date: string
  time: string
  location: string
  city: string
  maxPlayers: number
  players: (Player | string)[]          // approved players
  pendingPlayers: (Player | string)[]   // candidates awaiting organizer approval
  status: ScheduleStatus
  resultRegistered: boolean
  mvpVotes: MvpVote[]
  mvpWinner?: Player | string
  /** Cost per player in BRL (optional) */
  costPerPlayer?: number
  /** PIX key for cost collection */
  pixKey?: string
  /** Human-readable description of what the cost covers */
  costDescription?: string
  createdAt: string
}

// ── Boletas rewards & penalties ────────────────────────────────────────────
export const BOLETAS_REWARDS = {
  /** Boletas ganhas ao se cadastrar */
  REGISTER: 100,
  /** Boletas ganhas ao registrar uma partida */
  MATCH_REGISTER: 5,
  /** Boletas ganhas ao confirmar uma partida (como adversário) */
  MATCH_CONFIRM: 10,
  /** Boletas ganhas ao vencer uma partida confirmada */
  MATCH_WIN: 20,
  /** Multiplicador de aposta vencedora (recebe amount × BET_WIN_MULTIPLIER) */
  BET_WIN_MULTIPLIER: 2,
  /** Penalidade por cancelar uma partida agendada */
  SCHEDULE_CANCEL: -15,
  /** Penalidade por não registrar o resultado após 48h da data da partida */
  SCHEDULE_NO_RESULT: -10,
  /** Penalidade por registrar resultado falso (admin confirma resultado diferente) */
  RESULT_FRAUD: -50,
  /** Boletas ganhas ao criar um agendamento */
  SCHEDULE_CREATE: 10,
  /** Boletas ganhas pelo MVP eleito pelos participantes */
  MVP_VOTE: 10,
} as const

export interface MatchComment {
  _id: string
  matchRef: string
  author: Player | string
  content: string
  isAdminMessage: boolean
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

// ── Boletas purchase via PIX ───────────────────────────────────────────────
export enum BoletasPurchaseStatus {
  PENDING  = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum BoletasPackage {
  PACK_100  = 'PACK_100',
  PACK_600  = 'PACK_600',
  PACK_1500 = 'PACK_1500',
}

export const BOLETAS_PACKAGES = {
  PACK_100:  { boletas: 100,  price: 10  },
  PACK_600:  { boletas: 600,  price: 50  },
  PACK_1500: { boletas: 1500, price: 100 },
} as const

export const PIX_CONFIG = {
  key:     '11137332000139',
  bank:    'SICREDI',
  company: 'Empresa Jornalística Dia a Dia Ltda.',
} as const

export interface BoletasPurchase {
  _id: string
  player: Player | string
  package: BoletasPackage
  boletas: number
  price: number
  status: BoletasPurchaseStatus
  transactionRef?: string
  adminNotes?: string
  createdAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
