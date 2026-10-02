import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Cookies from 'js-cookie';

import Home, { getServerSideProps } from '../../pages/index';

jest.mock('next/head', () => {
    const { createPortal } = require('react-dom');
    return { __esModule: true, default: ({ children }) => createPortal(children, document.head) };
});

const props = { level: 1, currentExperience: 0, challengeCompleted: 0, streak: 0, lastActiveDate: null };

describe('getServerSideProps', () => {
    const run = (cookies: Record<string, string>) =>
        getServerSideProps({ req: { cookies } } as any) as Promise<{ props: unknown }>;

    it('converte os cookies em props numéricas', async () => {
        const result = await run({
            level: '4',
            currentExperience: '35',
            challengeCompleted: '9',
            streak: '2',
            lastActiveDate: '2026-03-01'
        });

        expect(result.props).toEqual({
            level: 4,
            currentExperience: 35,
            challengeCompleted: 9,
            streak: 2,
            lastActiveDate: '2026-03-01'
        });
    });

    it('usa padrões sem cookies', async () => {
        expect((await run({})).props).toEqual(props);
    });

    it('ignora cookies corrompidos', async () => {
        const result = await run({ level: 'abc', currentExperience: 'x' });

        expect(result.props).toMatchObject({ level: 1, currentExperience: 0 });
    });
});

describe('Home', () => {
    beforeEach(() => {
        Object.keys(Cookies.get()).forEach((name) => Cookies.remove(name));
    });

    it('renderiza as seções principais', () => {
        render(<Home {...props} />);

        expect(screen.getByText('Morty Smith')).toBeInTheDocument();
        expect(screen.getByTitle('Ciclos completos')).toBeInTheDocument();
        expect(screen.getByText('Foco · ciclo 1 de 4')).toBeInTheDocument();
        expect(screen.getByText('Finalize um ciclo para liberar o próximo desafio')).toBeInTheDocument();
    });

    it('fluxo completo: foco termina, desafio aparece e completá-lo gera xp', async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 0, 1, 12));
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        render(<Home {...props} />);

        await user.click(screen.getByRole('button', { name: 'Iniciar um ciclo' }));
        for (let second = 0; second < 25 * 60; second++) {
            act(() => {
                jest.advanceTimersByTime(1000);
            });
        }

        expect(screen.getByText('Pausa curta')).toBeInTheDocument();
        expect(screen.getByText('Novo Desafio')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Completei/ }));

        expect(screen.getByText('Aproveite o resto da pausa para descansar')).toBeInTheDocument();
        expect(Cookies.get('challengeCompleted')).toBe('1');
        expect(Cookies.get('streak')).toBe('1');

        jest.useRealTimers();
    });
});
