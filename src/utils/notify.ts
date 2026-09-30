export function notify(title: string, body: string) {
    new Audio('/icons/notification.mp3').play().catch(() => {});

    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
    }
}
