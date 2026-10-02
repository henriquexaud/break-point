export const STREAK_BONUS_MIN_DAYS = 3;
const STREAK_BONUS_RATE = 0.1;

// Data no fuso local no formato YYYY-MM-DD
export function getDateKey(daysAgo = 0, now = new Date()) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${date.getFullYear()}-${month}-${day}`;
}

// A sequência é quebrada se o último ciclo foi antes de ontem
export function isStreakBroken(lastActiveDate: string | null, now = new Date()) {
    return Boolean(lastActiveDate)
        && lastActiveDate !== getDateKey(0, now)
        && lastActiveDate !== getDateKey(1, now);
}

// Sequência depois de registrar atividade hoje
export function getNextStreak(streak: number, lastActiveDate: string | null, now = new Date()) {
    if (lastActiveDate === getDateKey(0, now)) {
        return streak;
    }

    return lastActiveDate === getDateKey(1, now) ? streak + 1 : 1;
}

export function getStreakBonus(xp: number, streak: number) {
    return streak >= STREAK_BONUS_MIN_DAYS ? Math.round(xp * STREAK_BONUS_RATE) : 0;
}
