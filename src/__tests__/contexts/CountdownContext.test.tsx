import { ReactNode, useContext } from 'react';
import { act, render, screen } from '@testing-library/react';

import { ChallengeContext } from '../../contexts/ChallengeContext';
import { CountdownContext, CountdownProvider } from '../../contexts/CountdownContext';
import { notify } from '../../utils/notify';

jest.mock('../../utils/notify', () => ({ notify: jest.fn() }));

const startNewChallenge = jest.fn();

function Consumer() {
    const ctx = useContext(CountdownContext);

    return (
        <div>
            <span data-testid="time">
                {String(ctx.minutes).padStart(2, '0')}:{String(ctx.seconds).padStart(2, '0')}
            </span>
            <span data-testid="active">{String(ctx.isActive)}</span>
            <span data-testid="mode">{ctx.mode}</span>
            <span data-testid="cycles">{ctx.focusCycles}</span>
            <button onClick={ctx.startCountdown}>start</button>
            <button onClick={ctx.resetCountdown}>reset</button>
        </div>
    );
}

function setup(children: ReactNode = <Consumer />) {
    return render(
        <ChallengeContext.Provider value={{ startNewChallenge } as any}>
            <CountdownProvider>{children}</CountdownProvider>
        </ChallengeContext.Provider>
    );
}

const text = (id: string) => screen.getByTestId(id).textContent;

// O timer se reagenda a cada render, então avança um segundo por vez
function advance(seconds: number) {
    for (let second = 0; second < seconds; second++) {
        act(() => {
            jest.advanceTimersByTime(1000);
        });
    }
}

function start() {
    act(() => screen.getByText('start').click());
}

// Conclui um ciclo de foco inteiro
function finishFocus() {
    start();
    advance(25 * 60);
}

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
    startNewChallenge.mockClear();
    (notify as jest.Mock).mockClear();
});

afterEach(() => {
    jest.useRealTimers();
    delete (window as any).Notification;
});

describe('CountdownProvider', () => {
    it('começa parado em 25:00 no modo foco', () => {
        setup();

        expect(text('time')).toBe('25:00');
        expect(text('active')).toBe('false');
        expect(text('mode')).toBe('focus');
        expect(text('cycles')).toBe('0');
    });

    it('conta os segundos depois de iniciar', () => {
        setup();

        start();
        advance(3);

        expect(text('active')).toBe('true');
        expect(text('time')).toBe('24:57');
    });

    it('recalcula pelo relógio quando o timer atrasa (aba em segundo plano)', () => {
        setup();
        start();

        // A aba "dormiu" por 2 minutos e só então o timer disparou
        jest.setSystemTime(new Date(2026, 0, 1, 12, 1, 59));
        advance(1);

        expect(text('time')).toBe('23:00');
    });

    it('pede permissão de notificação ao iniciar', () => {
        const NotificationMock = jest.fn() as any;
        NotificationMock.permission = 'default';
        NotificationMock.requestPermission = jest.fn();
        (window as any).Notification = NotificationMock;
        setup();

        start();

        expect(NotificationMock.requestPermission).toHaveBeenCalled();
    });

    it('abandonar o ciclo volta ao estado inicial', () => {
        setup();
        start();
        advance(10);

        act(() => screen.getByText('reset').click());

        expect(text('active')).toBe('false');
        expect(text('time')).toBe('25:00');
        advance(5);
        expect(text('time')).toBe('25:00');
    });

    describe('ao terminar o foco', () => {
        it('inicia a pausa curta, conta o ciclo e libera um desafio', () => {
            setup();

            finishFocus();

            expect(text('mode')).toBe('shortBreak');
            expect(text('time')).toBe('05:00');
            expect(text('active')).toBe('true');
            expect(text('cycles')).toBe('1');
            expect(startNewChallenge).toHaveBeenCalledTimes(1);
        });

        it('a 4ª pausa é longa', () => {
            setup();

            for (let cycle = 1; cycle <= 3; cycle++) {
                finishFocus();
                expect(text('mode')).toBe('shortBreak');
                advance(5 * 60); // termina a pausa
            }

            finishFocus();

            expect(text('mode')).toBe('longBreak');
            expect(text('time')).toBe('15:00');
            expect(text('cycles')).toBe('4');
        });
    });

    describe('ao terminar a pausa', () => {
        it('volta para o foco parado e avisa', () => {
            setup();
            finishFocus();

            advance(5 * 60);

            expect(text('mode')).toBe('focus');
            expect(text('active')).toBe('false');
            expect(text('time')).toBe('25:00');
            expect(notify).toHaveBeenCalledWith('Pausa encerrada', 'Hora de voltar ao foco!');
        });

        it('pular a pausa volta ao foco sem avisar', () => {
            setup();
            finishFocus();

            act(() => screen.getByText('reset').click());

            expect(text('mode')).toBe('focus');
            expect(text('active')).toBe('false');
            expect(notify).not.toHaveBeenCalled();
        });
    });
});
