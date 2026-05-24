export const BET_AMOUNT = 50;
export const POSITION_POINTS = [100, 70, 50, 30];
export const WRONG_POSITION_TOP4_POINTS = 15;

export function normalizeTop4(value) {
  if (!Array.isArray(value)) return [];
  return value.map(v => String(v || '').trim()).filter(Boolean).slice(0, 4);
}

export function hasFourUniqueTeams(top4) {
  const arr = normalizeTop4(top4);
  return arr.length === 4 && new Set(arr).size === 4;
}

export function calculateScore(predictions, finalResult) {
  const guess = normalizeTop4(predictions);
  const result = normalizeTop4(finalResult);

  if (!hasFourUniqueTeams(guess) || !hasFourUniqueTeams(result)) {
    return { score: 0, details: [] };
  }

  const details = guess.map((teamId, index) => {
    const realIndex = result.indexOf(teamId);
    if (realIndex === index) {
      return {
        position: index + 1,
        teamId,
        points: POSITION_POINTS[index],
        type: 'exact'
      };
    }

    if (realIndex >= 0) {
      return {
        position: index + 1,
        teamId,
        points: WRONG_POSITION_TOP4_POINTS,
        type: 'top4_wrong_position'
      };
    }

    return {
      position: index + 1,
      teamId,
      points: 0,
      type: 'miss'
    };
  });

  const score = details.reduce((sum, item) => sum + item.points, 0);
  return { score, details };
}
