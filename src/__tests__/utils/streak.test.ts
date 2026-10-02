import { getDateKey, getNextStreak, getStreakBonus, isStreakBroken } from '../../utils/streak';

const now = new Date(2026, 2, 1, 15, 0); // 1º de março de 2026, fuso local

describe('getDateKey', () => {
    it('formata a data local como YYYY-MM-DD', () => {
        expect(getDateKey(0, new Date(2026, 0, 5))).toBe('2026-01-05');
    });

    it('volta dias atravessando o mês', () => {
        expect(getDateKey(1, now)).toBe('2026-02-28');
    });

    it('volta dias atravessando o ano', () => {
        expect(getDateKey(1, new Date(2026, 0, 1))).toBe('2025-12-31');
    });

    it('não altera a data recebida', () => {
        const date = new Date(2026, 2, 1);
        getDateKey(3, date);
        expect(date.getDate()).toBe(1);
    });
});

describe('isStreakBroken', () => {
    it('não quebra sem data anterior', () => {
        expect(isStreakBroken(null, now)).toBe(false);
    });

    it('não quebra se a atividade foi hoje', () => {
        expect(isStreakBroken('2026-03-01', now)).toBe(false);
    });

    it('não quebra se a atividade foi ontem', () => {
        expect(isStreakBroken('2026-02-28', now)).toBe(false);
    });

    it('quebra se a última atividade foi antes de ontem', () => {
        expect(isStreakBroken('2026-02-27', now)).toBe(true);
    });
});

describe('getNextStreak', () => {
    it('mantém a sequência se já houve atividade hoje', () => {
        expect(getNextStreak(4, '2026-03-01', now)).toBe(4);
    });

    it('incrementa se a última atividade foi ontem', () => {
        expect(getNextStreak(4, '2026-02-28', now)).toBe(5);
    });

    it('recomeça em 1 se houve intervalo', () => {
        expect(getNextStreak(4, '2026-02-20', now)).toBe(1);
    });

    it('começa em 1 na primeira atividade', () => {
        expect(getNextStreak(0, null, now)).toBe(1);
    });
});

describe('getStreakBonus', () => {
    it('não dá bônus com menos de 3 dias', () => {
        expect(getStreakBonus(100, 2)).toBe(0);
    });

    it('dá 10% a partir de 3 dias', () => {
        expect(getStreakBonus(100, 3)).toBe(10);
    });

    it('arredonda o bônus', () => {
        expect(getStreakBonus(75, 5)).toBe(8);
    });
});
