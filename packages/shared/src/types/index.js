"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionStatus = exports.BetStatus = exports.ScheduleStatus = exports.GenderType = exports.MatchType = exports.Gender = exports.Sport = exports.SystemRole = exports.MatchStatus = exports.PlayerLevel = void 0;
var PlayerLevel;
(function (PlayerLevel) {
    PlayerLevel["BEGINNER"] = "BEGINNER";
    PlayerLevel["INTERMEDIATE"] = "INTERMEDIATE";
    PlayerLevel["ADVANCED"] = "ADVANCED";
})(PlayerLevel || (exports.PlayerLevel = PlayerLevel = {}));
var MatchStatus;
(function (MatchStatus) {
    MatchStatus["PENDING_REVIEW"] = "PENDING_REVIEW";
    MatchStatus["CONFIRMED"] = "CONFIRMED";
    MatchStatus["DISPUTED"] = "DISPUTED";
})(MatchStatus || (exports.MatchStatus = MatchStatus = {}));
var SystemRole;
(function (SystemRole) {
    SystemRole["ADMIN"] = "ADMIN";
    SystemRole["PLAYER"] = "PLAYER";
})(SystemRole || (exports.SystemRole = SystemRole = {}));
var Sport;
(function (Sport) {
    Sport["TENNIS"] = "TENNIS";
    Sport["PADEL"] = "PADEL";
    Sport["SQUASH"] = "SQUASH";
    Sport["BADMINTON"] = "BADMINTON";
    Sport["TABLE_TENNIS"] = "TABLE_TENNIS";
    Sport["BEACH_TENNIS"] = "BEACH_TENNIS";
    Sport["VOLLEYBALL"] = "VOLLEYBALL";
    Sport["BEACH_VOLLEYBALL"] = "BEACH_VOLLEYBALL";
    Sport["FOOTVOLLEY"] = "FOOTVOLLEY";
    Sport["FUTSAL"] = "FUTSAL";
    Sport["BASKETBALL"] = "BASKETBALL";
    Sport["FOOTBALL"] = "FOOTBALL";
    Sport["HANDBALL"] = "HANDBALL";
    Sport["CHESS"] = "CHESS";
})(Sport || (exports.Sport = Sport = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["PREFER_NOT_TO_SAY"] = "PREFER_NOT_TO_SAY";
})(Gender || (exports.Gender = Gender = {}));
var MatchType;
(function (MatchType) {
    MatchType["INDIVIDUAL"] = "INDIVIDUAL";
    MatchType["DOUBLES"] = "DOUBLES";
    MatchType["TEAM"] = "TEAM";
})(MatchType || (exports.MatchType = MatchType = {}));
var GenderType;
(function (GenderType) {
    GenderType["MALE"] = "MALE";
    GenderType["FEMALE"] = "FEMALE";
    GenderType["MIXED"] = "MIXED";
})(GenderType || (exports.GenderType = GenderType = {}));
var ScheduleStatus;
(function (ScheduleStatus) {
    ScheduleStatus["OPEN"] = "OPEN";
    ScheduleStatus["FULL"] = "FULL";
    ScheduleStatus["CANCELLED"] = "CANCELLED";
    ScheduleStatus["COMPLETED"] = "COMPLETED";
})(ScheduleStatus || (exports.ScheduleStatus = ScheduleStatus = {}));
var BetStatus;
(function (BetStatus) {
    BetStatus["PENDING"] = "PENDING";
    BetStatus["WON"] = "WON";
    BetStatus["LOST"] = "LOST";
    BetStatus["CANCELLED"] = "CANCELLED";
})(BetStatus || (exports.BetStatus = BetStatus = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["TRIAL"] = "TRIAL";
    SubscriptionStatus["ACTIVE"] = "ACTIVE";
    SubscriptionStatus["OVERDUE"] = "OVERDUE";
    SubscriptionStatus["INACTIVE"] = "INACTIVE";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
//# sourceMappingURL=index.js.map