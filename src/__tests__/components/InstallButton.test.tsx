import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { InstallButton } from '../../components/InstallButton';

function mockEnvironment({ userAgent = 'Mozilla/5.0 (X11; Linux)', platform = 'Linux', touchPoints = 0, standalone = false } = {}) {
    const define = (name: string, value: unknown) =>
        Object.defineProperty(navigator, name, { configurable: true, value });

    define('userAgent', userAgent);
    define('platform', platform);
    define('maxTouchPoints', touchPoints);
    (window.matchMedia as jest.Mock).mockReturnValue({ matches: standalone });
}

function fireInstallPrompt() {
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
        prompt: jest.fn().mockResolvedValue(undefined)
    });

    act(() => {
        window.dispatchEvent(event);
    });

    return event;
}

beforeEach(() => mockEnvironment());
afterEach(() => jest.restoreAllMocks());

describe('InstallButton', () => {
    it('não aparece sem suporte a instalação', () => {
        const { container } = render(<InstallButton />);

        expect(container).toBeEmptyDOMElement();
    });

    it('aparece quando o navegador oferece a instalação e abre o prompt uma vez', async () => {
        render(<InstallButton />);
        const event = fireInstallPrompt();

        expect(event.defaultPrevented).toBe(true);

        await userEvent.click(screen.getByRole('button', { name: 'Instalar app' }));

        expect(event.prompt).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('some depois que o app é instalado', () => {
        render(<InstallButton />);
        fireInstallPrompt();

        act(() => {
            window.dispatchEvent(new Event('appinstalled'));
        });

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('no iOS mostra a dica em vez do prompt', async () => {
        mockEnvironment({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)' });
        render(<InstallButton />);

        expect(screen.queryByText(/Adicionar à Tela de Início/)).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Instalar app' }));
        expect(screen.getByText(/Adicionar à Tela de Início/)).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Instalar app' }));
        expect(screen.queryByText(/Adicionar à Tela de Início/)).not.toBeInTheDocument();
    });

    it('reconhece iPad que se apresenta como Mac', () => {
        mockEnvironment({ platform: 'MacIntel', touchPoints: 5 });
        render(<InstallButton />);

        expect(screen.getByRole('button', { name: 'Instalar app' })).toBeInTheDocument();
    });

    it('não oferece instalação no iOS se o app já está instalado', () => {
        mockEnvironment({ userAgent: 'Mozilla/5.0 (iPhone)', standalone: true });
        const { container } = render(<InstallButton />);

        expect(container).toBeEmptyDOMElement();
    });

    it('remove os listeners ao desmontar', () => {
        const remove = jest.spyOn(window, 'removeEventListener');
        render(<InstallButton />).unmount();

        expect(remove).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
        expect(remove).toHaveBeenCalledWith('appinstalled', expect.any(Function));
    });
});
