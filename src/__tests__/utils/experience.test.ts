import { applyExperience, getExperienceToNextLevel } from '../../utils/experience';

describe('getExperienceToNextLevel', () => {
    it.each([
        [1, 100],
        [2, 150],
        [5, 300],
        [10, 550]
    ])('nível %i pede %i xp', (level, expected) => {
        expect(getExperienceToNextLevel(level)).toBe(expected);
    });
});

describe('applyExperience', () => {
    it('mantém o nível quando o xp não basta', () => {
        expect(applyExperience(1, 99)).toEqual({ level: 1, experience: 99 });
    });

    it('sobe de nível ao atingir exatamente o limite', () => {
        expect(applyExperience(1, 100)).toEqual({ level: 2, experience: 0 });
    });

    it('carrega o excedente para o nível seguinte', () => {
        expect(applyExperience(1, 130)).toEqual({ level: 2, experience: 30 });
    });

    it('sobe vários níveis de uma vez', () => {
        // 100 (nv1) + 150 (nv2) + 20 sobrando
        expect(applyExperience(1, 270)).toEqual({ level: 3, experience: 20 });
    });

    it('ajusta progresso salvo que excede a curva atual', () => {
        expect(applyExperience(2, 400)).toEqual({ level: 4, experience: 50 });
    });
});
