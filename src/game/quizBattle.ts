export type QuizAnswerGrade = "perfect" | "correct" | "wrong" | "timeout";

export type QuizAnswerEvaluation = {
  grade: QuizAnswerGrade;
  damageMultiplier: number;
  flatDamageBonus: number;
  enemyPunishBonus: number;
  nextStreak: number;
  revealDelayMs: number;
  banner: string;
};

type QuizAnswerParams = {
  battleSource: "trainer" | "wild";
  correct: boolean;
  timedOut?: boolean;
  elapsedMs: number;
  timeLimitMs: number;
  streak: number;
  enemyPartyIndex: number;
};

export function getQuizTimeLimitMs(
  battleSource: "trainer" | "wild",
  enemyPartyIndex: number,
): number {
  const base = battleSource === "trainer" ? 5000 : 6200;
  const slotPressure = enemyPartyIndex * (battleSource === "trainer" ? 280 : 180);
  return Math.max(3200, base - slotPressure);
}

export function getQuizWarningTimeMs(timeLimitMs: number): number {
  return Math.max(850, Math.round(timeLimitMs * 0.42));
}

export function evaluateQuizAnswer({
  battleSource,
  correct,
  timedOut = false,
  elapsedMs,
  timeLimitMs,
  streak,
  enemyPartyIndex,
}: QuizAnswerParams): QuizAnswerEvaluation {
  if (timedOut) {
    return {
      grade: "timeout",
      damageMultiplier: 0,
      flatDamageBonus: 0,
      enemyPunishBonus: battleSource === "trainer" ? 4 + enemyPartyIndex : 3 + enemyPartyIndex,
      nextStreak: 0,
      revealDelayMs: 620,
      banner: "Too Slow",
    };
  }

  if (!correct) {
    return {
      grade: "wrong",
      damageMultiplier: 0,
      flatDamageBonus: 0,
      enemyPunishBonus: battleSource === "trainer" ? 3 + enemyPartyIndex : 2 + enemyPartyIndex,
      nextStreak: 0,
      revealDelayMs: 620,
      banner: "Wrong Answer",
    };
  }

  const clampedLimit = Math.max(1, timeLimitMs);
  const ratio = Math.min(1, Math.max(0, elapsedMs / clampedLimit));
  const nextStreak = streak + 1;
  const streakBoost = Math.min(0.24, (nextStreak - 1) * 0.06);

  if (ratio <= 0.38) {
    return {
      grade: "perfect",
      damageMultiplier: 1.55 + streakBoost,
      flatDamageBonus: 3 + Math.min(3, nextStreak),
      enemyPunishBonus: 0,
      nextStreak,
      revealDelayMs: 460,
      banner: nextStreak > 1 ? `Perfect x${nextStreak}` : "Perfect Answer",
    };
  }

  return {
    grade: "correct",
    damageMultiplier: 1.22 + streakBoost,
    flatDamageBonus: 1 + Math.min(2, Math.floor(nextStreak / 2)),
    enemyPunishBonus: 0,
    nextStreak,
    revealDelayMs: 420,
    banner: nextStreak > 1 ? `Quiz Streak x${nextStreak}` : "Correct Answer",
  };
}
