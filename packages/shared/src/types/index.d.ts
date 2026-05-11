export declare enum PlayerLevel {
    BEGINNER = "BEGINNER",
    INTERMEDIATE = "INTERMEDIATE",
    ADVANCED = "ADVANCED"
}
export declare enum MatchStatus {
    PENDING_REVIEW = "PENDING_REVIEW",
    CONFIRMED = "CONFIRMED",
    DISPUTED = "DISPUTED"
}
export declare enum SystemRole {
    ADMIN = "ADMIN",
    PLAYER = "PLAYER"
}
export declare enum Sport {
    TENNIS = "TENNIS",
    PADEL = "PADEL",
    SQUASH = "SQUASH",
    BADMINTON = "BADMINTON",
    TABLE_TENNIS = "TABLE_TENNIS",
    BEACH_TENNIS = "BEACH_TENNIS",
    VOLLEYBALL = "VOLLEYBALL",
    BEACH_VOLLEYBALL = "BEACH_VOLLEYBALL",
    FOOTVOLLEY = "FOOTVOLLEY",
    FUTSAL = "FUTSAL",
    BASKETBALL = "BASKETBALL",
    FOOTBALL = "FOOTBALL",
    HANDBALL = "HANDBALL",
    CHESS = "CHESS"
}
export declare enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY"
}
export declare enum MatchType {
    INDIVIDUAL = "INDIVIDUAL",
    DOUBLES = "DOUBLES",
    TEAM = "TEAM"
}
export declare enum GenderType {
    MALE = "MALE",
    FEMALE = "FEMALE",
    MIXED = "MIXED"
}
export declare enum ScheduleStatus {
    OPEN = "OPEN",
    FULL = "FULL",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}
export declare enum BetStatus {
    PENDING = "PENDING",
    WON = "WON",
    LOST = "LOST",
    CANCELLED = "CANCELLED"
}
export declare enum SubscriptionStatus {
    TRIAL = "TRIAL",
    ACTIVE = "ACTIVE",
    OVERDUE = "OVERDUE",
    INACTIVE = "INACTIVE"
}
export interface Player {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    city: string;
    level: PlayerLevel;
    gender?: Gender;
    elo: number;
    wins: number;
    losses: number;
    matchesPlayed: number;
    boletas: number;
    sport: Sport;
    venue?: string;
    region?: string;
    state?: string;
    country?: string;
    birthDate?: string;
    role: SystemRole;
    subscriptionStatus?: SubscriptionStatus;
    trialEndsAt?: string;
    createdAt: string;
}
export interface Match {
    _id: string;
    sport: Sport;
    player1: Player | string;
    player2: Player | string;
    winner: Player | string;
    score: string;
    date: string;
    status: MatchStatus;
    registeredBy: Player | string;
    disputedBy?: Player | string;
    disputeReason?: string;
    confirmedAt?: string;
    createdAt: string;
}
export interface Bet {
    _id: string;
    match: Match | string;
    bettor: Player | string;
    predictedWinner: Player | string;
    amount: number;
    status: BetStatus;
    createdAt: string;
}
export interface ScheduledMatch {
    _id: string;
    sport: Sport;
    matchType: MatchType;
    genderType: GenderType;
    organizer: Player | string;
    title: string;
    description?: string;
    date: string;
    time: string;
    location: string;
    city: string;
    maxPlayers: number;
    players: (Player | string)[];
    status: ScheduleStatus;
    createdAt: string;
}
export interface RankingEntry {
    position: number;
    player: Player;
}
export interface JwtPayload {
    sub: string;
    email: string;
    role: SystemRole;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}
