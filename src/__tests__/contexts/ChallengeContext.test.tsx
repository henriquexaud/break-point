import { useContext } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Cookies from 'js-cookie';

import { ChallengeContext, ChallengeProvider } from '../../contexts/ChallengeContext';
import challenges from '../../../challenges.json';
import { applyExperience } from '../../utils/experience';
import { notify } from '../../utils/notify';

jest.mock('../../utils/notify', () => ({ notify: jest.fn() }));

const defaultProps = {
    level: 1,
    currentExperience: 0,
    challengeCompleted: 0,
    streak: 0,
    lastActiveDate: null as string | null
};

function Consumer() {
    const ctx = useContext(ChallengeContext);

    return (
        <div>
            <span data-testid="level">{ctx.level}</span>
            <span data-testid="xp">{ctx.currentExperience}</span>
            <span data-testid="next">{ctx.experienceToNextLevel}</span>
            <span data-testid="completed">{ctx.challengeCompleted}</span>
            <span data-testid="streak">{ctx.streak}</span>
            <span data-testid="bonus">{ctx.streakBonus}</span>
            <span data-testid="canSwap">{String(ctx.canSwapChallenge)}</span>
            <span data-testid="challenge">{ctx.activeChallenge?.description ?? 'none'}</span>
            <button onClick={ctx.startNewChallenge}>start</button>
            <button onClick={ctx.swapChallenge}>swap</button>
            <button onClick={ctx.completeChallenge}>complete</button>
            <button onClick={ctx.resetChallenge}>reset</button>
        </div>
    );
}

function setup(props: Partial<typeof defaultProps> = {}) {
    return render(
        <ChallengeProvider {...defaultProps} {...props}>
            <Consumer />
        </ChallengeProvider>
    );
}

// Sorteia o desafio no índice indicado (o sorteio usa Math.random)
function pickIndex(index: number) {
    return (index + 0.5) / challenges.length;
}

function dateKey(daysAgo: number) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const text = (id: string) => screen.getByTestId(id).textContent;

beforeEach(() => {
    Object.keys(Cookies.get()).forEach((name) => Cookies.remove(name));
    jest.spyOn(Math, 'random').mockReturnValue(pickIndex(0));
    (notify as jest.Mock).mockClear();
});

afterEach(() => jest.restoreAllMocks());

describe('ChallengeProvider — progresso salvo', () => {
    it('lê o progresso dos cookies (vale mais que as props, por causa do cache offline)', () => {
        Cookies.set('level', '3');
        Cookies.set('currentExperience', '40');
        Cookies.set('challengeCompleted', '7');

        setup({ level: 1, currentExperience: 0 });

        expect(text('level')).toBe('3');
        expect(text('xp')).toBe('40');
        expect(text('completed')).toBe('7');
        expect(text('next')).toBe('200');
    });

    it('usa valores padrão sem cookies', () => {
        setup();

        expect(text('level')).toBe('1');
        expect(text('xp')).toBe('0');
        expect(text('streak')).toBe('0');
    });

    it('converte xp excedente salvo em níveis', () => {
        Cookies.set('level', '1');
        Cookies.set('currentExperience', '130');

        setup();

        expect(text('level')).toBe('2');
        expect(text('xp')).toBe('30');
    });

    it('persiste o progresso nos cookies', () => {
        setup({ level: 1 });

        expect(Cookies.get('level')).toBe('1');
        expect(Cookies.get('currentExperience')).toBe('0');
        expect(Cookies.get('challengeCompleted')).toBe('0');
        expect(Cookies.get('lastActiveDate')).toBeUndefined();
    });
});

describe('ChallengeProvider — sequência', () => {
    it('mantém a sequência se o último ciclo foi ontem', () => {
        Cookies.set('streak', '4');
        Cookies.set('lastActiveDate', dateKey(1));

        setup();

        expect(text('streak')).toBe('4');
    });

    it('zera a sequência se o último ciclo foi antes de ontem', () => {
        Cookies.set('streak', '4');
        Cookies.set('lastActiveDate', dateKey(2));

        setup();

        expect(text('streak')).toBe('0');
    });

    it('começa a sequência ao iniciar o primeiro desafio', async () => {
        setup();

        await userEvent.click(screen.getByText('start'));

        expect(text('streak')).toBe('1');
        expect(Cookies.get('lastActiveDate')).toBe(dateKey(0));
    });

    it('incrementa a sequência uma única vez por dia', async () => {
        Cookies.set('streak', '2');
        Cookies.set('lastActiveDate', dateKey(1));
        // O 2º sorteio precisa ser outro desafio, senão o sorteio repete para sempre
        jest.spyOn(Math, 'random').mockReturnValueOnce(pickIndex(0)).mockReturnValueOnce(pickIndex(1));
        setup();

        await userEvent.click(screen.getByText('start'));
        await userEvent.click(screen.getByText('reset'));
        await userEvent.click(screen.getByText('start'));

        expect(text('streak')).toBe('3');
    });

    it('aplica 10% de bônus com sequência de 3 dias ou mais', async () => {
        Cookies.set('streak', '3');
        Cookies.set('lastActiveDate', dateKey(0));
        setup();

        await userEvent.click(screen.getByText('start'));

        expect(text('bonus')).toBe(String(Math.round(challenges[0].xp * 0.1)));
    });

    it('não dá bônus com sequência curta', async () => {
        setup();

        await userEvent.click(screen.getByText('start'));

        expect(text('bonus')).toBe('0');
    });
});

describe('ChallengeProvider — desafios', () => {
    it('inicia um desafio, notifica e libera a troca', async () => {
        setup();
        expect(text('challenge')).toBe('none');

        await userEvent.click(screen.getByText('start'));

        expect(text('challenge')).toBe(challenges[0].description);
        expect(text('canSwap')).toBe('true');
        expect(notify).toHaveBeenCalledWith('Novo desafio', `Valendo ${challenges[0].xp}xp!`);
    });

    it('troca o desafio só uma vez', async () => {
        const random = jest.spyOn(Math, 'random');
        random.mockReturnValue(pickIndex(0));
        setup();
        await userEvent.click(screen.getByText('start'));

        random.mockReturnValue(pickIndex(1));
        await userEvent.click(screen.getByText('swap'));

        expect(text('challenge')).toBe(challenges[1].description);
        expect(text('canSwap')).toBe('false');

        random.mockReturnValue(pickIndex(2));
        await userEvent.click(screen.getByText('swap'));

        expect(text('challenge')).toBe(challenges[1].description);
    });

    it('não repete o desafio anterior ao sortear', async () => {
        const random = jest.spyOn(Math, 'random');
        // 1º sorteio: índice 0. Na troca: sorteia 0 de novo (repetido) e depois 1
        random.mockReturnValueOnce(pickIndex(0))
            .mockReturnValueOnce(pickIndex(0))
            .mockReturnValueOnce(pickIndex(1));
        setup();

        await userEvent.click(screen.getByText('start'));
        await userEvent.click(screen.getByText('swap'));

        expect(text('challenge')).toBe(challenges[1].description);
    });

    it('ignora a troca sem desafio ativo', async () => {
        setup();

        await userEvent.click(screen.getByText('swap'));

        expect(text('challenge')).toBe('none');
    });

    it('desistir descarta o desafio sem dar xp', async () => {
        setup();
        await userEvent.click(screen.getByText('start'));

        await userEvent.click(screen.getByText('reset'));

        expect(text('challenge')).toBe('none');
        expect(text('xp')).toBe('0');
        expect(text('completed')).toBe('0');
    });
});

describe('ChallengeProvider — completar', () => {
    it('ignora completar sem desafio ativo', async () => {
        setup();

        await userEvent.click(screen.getByText('complete'));

        expect(text('completed')).toBe('0');
    });

    it('soma o xp e conta o desafio', async () => {
        const xp = challenges[0].xp;
        setup();
        await userEvent.click(screen.getByText('start'));

        await userEvent.click(screen.getByText('complete'));

        expect(text('xp')).toBe(String(applyExperience(1, xp).experience));
        expect(text('level')).toBe(String(applyExperience(1, xp).level));
        expect(text('completed')).toBe('1');
        expect(text('challenge')).toBe('none');
    });

    it('sobe de nível e abre o modal quando o xp atinge o limite', async () => {
        Cookies.set('currentExperience', '99');
        setup();
        await userEvent.click(screen.getByText('start'));

        await userEvent.click(screen.getByText('complete'));

        expect(text('level')).toBe('2');
        expect(screen.getByText('Parabéns')).toBeInTheDocument();
    });

    it('fecha o modal de level up', async () => {
        Cookies.set('currentExperience', '99');
        setup();
        await userEvent.click(screen.getByText('start'));
        await userEvent.click(screen.getByText('complete'));

        await userEvent.click(screen.getByAltText('Fechar Modal'));

        expect(screen.queryByText('Parabéns')).not.toBeInTheDocument();
    });

    it('inclui o bônus da sequência no xp ganho', async () => {
        Cookies.set('streak', '5');
        Cookies.set('lastActiveDate', dateKey(0));
        Cookies.set('level', '10'); // 550 xp para o próximo nível: sem level up no meio
        setup();
        await userEvent.click(screen.getByText('start'));

        await userEvent.click(screen.getByText('complete'));

        const { xp } = challenges[0];
        expect(text('xp')).toBe(String(xp + Math.round(xp * 0.1)));
    });
});
