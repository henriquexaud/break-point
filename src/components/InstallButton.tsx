import { useEffect, useState } from 'react';

import styles from '../styles/components/InstallButton.module.css';

// Evento do Chrome, Edge e Android que ainda não está nos tipos do TypeScript
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<unknown>;
}

// O iOS não tem instalação por botão: o app é adicionado pelo menu de compartilhar
function canInstallOnIos() {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent)
        // O iPad se apresenta como Mac
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;

    return isIos && !isInstalled;
}

export function InstallButton() {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent>(null);
    const [isIos, setIsIos] = useState(false);
    const [isIosHintOpen, setIsIosHintOpen] = useState(false);

    useEffect(() => {
        function handleBeforeInstallPrompt(event: Event) {
            event.preventDefault();
            setInstallPrompt(event as BeforeInstallPromptEvent);
        }

        function handleAppInstalled() {
            setInstallPrompt(null);
        }

        setIsIos(canInstallOnIos());

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    function install() {
        if (isIos) {
            setIsIosHintOpen(!isIosHintOpen);
            return;
        }

        // Cada evento só abre a instalação uma vez
        installPrompt.prompt();
        setInstallPrompt(null);
    }

    if (!installPrompt && !isIos) {
        return null;
    }

    return (
        <footer className={styles.installContainer}>
            <button type="button" onClick={install}>
                Instalar app
            </button>

            { isIosHintOpen && (
                <p>Toque em Compartilhar e depois em “Adicionar à Tela de Início”.</p>
            )}
        </footer>
    );
}
