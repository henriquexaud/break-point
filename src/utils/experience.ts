const BASE_EXPERIENCE = 100;
const EXPERIENCE_INCREMENT = 50;

// 100 xp no nível 1, e cada nível seguinte pede 50 xp a mais
export function getExperienceToNextLevel(level: number) {
    return BASE_EXPERIENCE + EXPERIENCE_INCREMENT * (level - 1);
}

// Converte o xp acumulado em níveis (também ajusta progresso salvo com a curva antiga)
export function applyExperience(level: number, experience: number) {
    while (experience >= getExperienceToNextLevel(level)) {
        experience -= getExperienceToNextLevel(level);
        level++;
    }

    return { level, experience };
}
