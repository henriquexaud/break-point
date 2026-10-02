import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Countdown } from '../../components/Countdown';
import { CountdownContext } from '../../contexts/CountdownContext';

jest.mock('next/head', () => {
    const { createPortal } = require('react-dom');
    return { __esModule: true, default: ({ children }) => createPortal(children, document.head) };
});

function setup(value: Partial<React.ContextType<typeof CountdownContext>> = {}) {
    const context = {
        minutes: 25,
        seconds: 0,
        isActive: false,
        mode: 'focus',
        focusCycles: 0,
        startCountdown: jest.fn(),
        resetCountdown: jest.fn(),
        ...value
    } as React.ContextType<typeof CountdownContext>;

    render(
        <CountdownContext.Provider value={context}>
            <Countdown />
        </CountdownContext.Provider>
    );

    return context;
}

describe('Countdown', () => {
    it('mostra o tempo com zeros à esquerda', () => {
        setup({ minutes: 4, seconds: 7 });

        const digits = ['0', '4', ':', '0', '7'];
        const text = Array.from(document.querySelectorAll('span'))
            .map((span) => span.textContent)
            .filter((content) => digits.includes(content));

        expect(text).toEqual(digits);
    });

    it('mostra o ciclo atual no modo foco', () => {
        setup({ focusCycles: 2 });

        expect(screen.getByText('Foco · ciclo 3 de 4')).toBeInTheDocument();
    });

    it('inicia o ciclo ao clicar no botão quando parado', async () => {
        const { startCountdown } = setup();

        await userEvent.click(screen.getByRole('button', { name: 'Iniciar um ciclo' }));

        expect(startCountdown).toHaveBeenCalledTimes(1);
        expect(document.title).toBe('BreakPoint');
    });

    it('oferece abandonar o ciclo quando ativo e mostra o tempo no título', async () => {
        const { resetCountdown } = setup({ isActive: true, minutes: 12, seconds: 5 });

        await userEvent.click(screen.getByRole('button', { name: 'Abandonar ciclo' }));

        expect(resetCountdown).toHaveBeenCalledTimes(1);
        expect(document.title).toBe('12:05 | BreakPoint');
    });

    it.each([
        ['shortBreak', 'Pausa curta'],
        ['longBreak', 'Pausa longa']
    ])('em %s mostra "%s" e permite pular', async (mode, label) => {
        const { resetCountdown } = setup({ mode: mode as any, isActive: true, minutes: 4, seconds: 59 });

        expect(screen.getByText(label)).toBeInTheDocument();
        expect(document.title).toBe('Pausa 04:59 | BreakPoint');

        await userEvent.click(screen.getByRole('button', { name: 'Pular pausa' }));

        expect(resetCountdown).toHaveBeenCalledTimes(1);
    });
});
