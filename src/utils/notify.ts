async function showNotification(title: string, options: NotificationOptions) {
    const registration = await navigator.serviceWorker?.getRegistration();

    // No celular `new Notification` lança erro: a notificação precisa sair pelo service worker
    if (registration) {
        await registration.showNotification(title, options);
    } else {
        new Notification(title, options);
    }
}

export function notify(title: string, body: string) {
    new Audio('/icons/notification.mp3').play().catch(() => {});

    if ('Notification' in window && Notification.permission === 'granted') {
        showNotification(title, { body, icon: '/icons/icon-192.png' }).catch(() => {});
    }
}
