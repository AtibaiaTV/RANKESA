const K = 32

export function calculateElo(winnerElo: number, loserElo: number) {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400))
  const expectedLoser = 1 - expectedWinner
  return {
    newWinnerElo: Math.round(winnerElo + K * (1 - expectedWinner)),
    newLoserElo: Math.round(loserElo + K * (0 - expectedLoser)),
  }
}
