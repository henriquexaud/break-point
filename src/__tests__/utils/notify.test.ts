import { notify } from '../../utils/notify';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function setNotification(permission: NotificationPermission) {
    const NotificationMock = jest.fn() as any;
    NotificationMock.permission = permission;
    (window as any).Notification = NotificationMock;
    return NotificationMock;
}

function setServiceWorker(registration: unknown) {
    Object.defineProperty(navigator, 'serviceWorker', {
        configurable: true,
        value: { getRegistration: jest.fn().mockResolvedValue(registration) }
    });
}

afterEach(() => {
    delete (window as any).Notification;
    delete (navigator as any).serviceWorker;
    (window.Audio as jest.Mock).mockClear();
});

describe('notify', () => {
    it('toca o som sempre', () => {
        notify('Título', 'Corpo');

        expect(window.Audio).toHaveBeenCalledWith('/icons/notification.mp3');
    });

    it('não quebra se o som for bloqueado pelo navegador', async () => {
        (window.Audio as jest.Mock).mockImplementationOnce(() => ({
            play: jest.fn().mockRejectedValue(new Error('NotAllowedError'))
        }));

        expect(() => notify('Título', 'Corpo')).not.toThrow();
        await flush();
    });

    it('não notifica sem permissão', async () => {
        const NotificationMock = setNotification('default');

        notify('Título', 'Corpo');
        await flush();

        expect(NotificationMock).not.toHaveBeenCalled();
    });

    it('usa o service worker quando há registro', async () => {
        const registration = { showNotification: jest.fn().mockResolvedValue(undefined) };
        const NotificationMock = setNotification('granted');
        setServiceWorker(registration);

        notify('Título', 'Corpo');
        await flush();

        expect(registration.showNotification).toHaveBeenCalledWith('Título', {
            body: 'Corpo',
            icon: '/icons/icon-192.png'
        });
        expect(NotificationMock).not.toHaveBeenCalled();
    });

    it('usa new Notification sem service worker', async () => {
        const NotificationMock = setNotification('granted');

        notify('Título', 'Corpo');
        await flush();

        expect(NotificationMock).toHaveBeenCalledWith('Título', {
            body: 'Corpo',
            icon: '/icons/icon-192.png'
        });
    });

    it('engole erros ao exibir a notificação', async () => {
        const registration = { showNotification: jest.fn().mockRejectedValue(new Error('falhou')) };
        setNotification('granted');
        setServiceWorker(registration);

        expect(() => notify('Título', 'Corpo')).not.toThrow();
        await flush();
    });
});
