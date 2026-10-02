export type CountdownMode = 'focus' | 'shortBreak' | 'longBreak';

export const CYCLES_BEFORE_LONG_BREAK = 4;

export const DURATIONS: Record<CountdownMode, number> = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
};

// Pausa que vem depois de concluir o ciclo de foco número `cycles`
export function getBreakMode(cycles: number): CountdownMode {
    return cycles % CYCLES_BEFORE_LONG_BREAK === 0 ? 'longBreak' : 'shortBreak';
}

export function formatTime(totalSeconds: number) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');

    return `${minutes}:${seconds}`;
}

export function getModeLabel(mode: CountdownMode, focusCycles: number) {
    if (mode === 'shortBreak') {
        return 'Pausa curta';
    }

    if (mode === 'longBreak') {
        return 'Pausa longa';
    }

    return `Foco · ciclo ${(focusCycles % CYCLES_BEFORE_LONG_BREAK) + 1} de ${CYCLES_BEFORE_LONG_BREAK}`;
}
