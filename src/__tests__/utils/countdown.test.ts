import { DURATIONS, formatTime, getBreakMode, getModeLabel } from '../../utils/countdown';

describe('getBreakMode', () => {
    it.each([
        [1, 'shortBreak'],
        [3, 'shortBreak'],
        [4, 'longBreak'],
        [5, 'shortBreak'],
        [8, 'longBreak']
    ])('após o ciclo %i vem %s', (cycles, mode) => {
        expect(getBreakMode(cycles)).toBe(mode);
    });
});

describe('formatTime', () => {
    it('completa com zeros à esquerda', () => {
        expect(formatTime(65)).toBe('01:05');
        expect(formatTime(0)).toBe('00:00');
    });

    it('formata a duração do foco', () => {
        expect(formatTime(DURATIONS.focus)).toBe('25:00');
    });
});

describe('getModeLabel', () => {
    it('mostra o ciclo atual de 4 no foco', () => {
        expect(getModeLabel('focus', 0)).toBe('Foco · ciclo 1 de 4');
        expect(getModeLabel('focus', 3)).toBe('Foco · ciclo 4 de 4');
    });

    it('reinicia a contagem depois de 4 ciclos', () => {
        expect(getModeLabel('focus', 4)).toBe('Foco · ciclo 1 de 4');
    });

    it('nomeia as pausas', () => {
        expect(getModeLabel('shortBreak', 1)).toBe('Pausa curta');
        expect(getModeLabel('longBreak', 4)).toBe('Pausa longa');
    });
});
