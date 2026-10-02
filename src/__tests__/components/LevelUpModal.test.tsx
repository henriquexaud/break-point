import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LevelUpModal } from '../../components/levelUpModal';
import { ChallengeContext } from '../../contexts/ChallengeContext';

function setup() {
    const closeLevelUpModal = jest.fn();

    render(
        <ChallengeContext.Provider value={{ level: 7, closeLevelUpModal } as any}>
            <LevelUpModal />
        </ChallengeContext.Provider>
    );

    return closeLevelUpModal;
}

describe('LevelUpModal', () => {
    it('mostra o novo nível', () => {
        setup();

        expect(screen.getByText('7')).toBeInTheDocument();
        expect(screen.getByText('Parabéns')).toBeInTheDocument();
    });

    it('fecha pelo botão', async () => {
        const close = setup();

        await userEvent.click(screen.getByRole('button'));

        expect(close).toHaveBeenCalledTimes(1);
    });

    it('fecha ao clicar fora do cartão', async () => {
        const close = setup();

        await userEvent.click(screen.getByText('Parabéns').parentElement.parentElement);

        expect(close).toHaveBeenCalledTimes(1);
    });

    it('não fecha ao clicar dentro do cartão', async () => {
        const close = setup();

        await userEvent.click(screen.getByText('Você alcançou um novo level.'));

        expect(close).not.toHaveBeenCalled();
    });

    it('fecha com Escape', async () => {
        const close = setup();

        await userEvent.keyboard('{Escape}');

        expect(close).toHaveBeenCalledTimes(1);
    });

    it('remove o listener de teclado ao desmontar', async () => {
        const remove = jest.spyOn(window, 'removeEventListener');
        render(
            <ChallengeContext.Provider value={{ level: 1, closeLevelUpModal: jest.fn() } as any}>
                <LevelUpModal />
            </ChallengeContext.Provider>
        ).unmount();

        expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
});
