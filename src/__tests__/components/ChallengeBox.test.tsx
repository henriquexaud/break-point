import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ChallengeBox } from '../../components/ChallengeBox';
import { ChallengeContext } from '../../contexts/ChallengeContext';
import { CountdownContext } from '../../contexts/CountdownContext';

const challenge = { img: 'body.svg', description: 'Alongue o pescoço', xp: 80 };

function setup(challengeValue = {}, mode = 'focus') {
    const context = {
        activeChallenge: null,
        canSwapChallenge: false,
        streakBonus: 0,
        resetChallenge: jest.fn(),
        completeChallenge: jest.fn(),
        swapChallenge: jest.fn(),
        ...challengeValue
    } as any;

    render(
        <ChallengeContext.Provider value={context}>
            <CountdownContext.Provider value={{ mode } as any}>
                <ChallengeBox />
            </CountdownContext.Provider>
        </ChallengeContext.Provider>
    );

    return context;
}

describe('ChallengeBox sem desafio', () => {
    it('pede para finalizar um ciclo durante o foco', () => {
        setup();

        expect(screen.getByText('Finalize um ciclo para liberar o próximo desafio')).toBeInTheDocument();
    });

    it('sugere descansar durante a pausa', () => {
        setup({}, 'shortBreak');

        expect(screen.getByText('Aproveite o resto da pausa para descansar')).toBeInTheDocument();
    });
});

describe('ChallengeBox com desafio', () => {
    it('mostra descrição, imagem e xp', () => {
        setup({ activeChallenge: challenge });

        expect(screen.getByText('Ganhe 80 xp')).toBeInTheDocument();
        expect(screen.getByText('Alongue o pescoço')).toBeInTheDocument();
        expect(screen.getByAltText('objetivo')).toHaveAttribute('src', 'icons/body.svg');
        expect(screen.queryByText(/de bônus pela sequência/)).not.toBeInTheDocument();
    });

    it('soma o bônus da sequência ao xp mostrado', () => {
        setup({ activeChallenge: challenge, streakBonus: 8 });

        expect(screen.getByText(/Ganhe 88 xp/)).toBeInTheDocument();
        expect(screen.getByText(/de bônus pela sequência/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Completei/ })).toHaveTextContent('+88 xp');
    });

    it('dispara completar e desistir', async () => {
        const { completeChallenge, resetChallenge } = setup({ activeChallenge: challenge });

        await userEvent.click(screen.getByRole('button', { name: /Completei/ }));
        await userEvent.click(screen.getByRole('button', { name: 'Desisti' }));

        expect(completeChallenge).toHaveBeenCalledTimes(1);
        expect(resetChallenge).toHaveBeenCalledTimes(1);
    });

    it('esconde "Trocar desafio" quando a troca não está liberada', () => {
        setup({ activeChallenge: challenge, canSwapChallenge: false });
        expect(screen.queryByRole('button', { name: 'Trocar desafio' })).not.toBeInTheDocument();
    });

    it('troca o desafio quando liberado', async () => {
        const { swapChallenge } = setup({ activeChallenge: challenge, canSwapChallenge: true });

        await userEvent.click(screen.getByRole('button', { name: 'Trocar desafio' }));

        expect(swapChallenge).toHaveBeenCalledTimes(1);
    });
});
