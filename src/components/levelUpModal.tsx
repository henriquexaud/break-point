import { useContext, useEffect } from 'react';
import { ChallengeContext } from '../contexts/ChallengeContext';

import styles from '../styles/components/LevelUpModal.module.css';

export function LevelUpModal() {
    const { level, closeLevelUpModal } = useContext(ChallengeContext);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                closeLevelUpModal();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className={styles.overlay} onClick={closeLevelUpModal}>
            <div className={styles.container} onClick={(event) => event.stopPropagation()}>
                <header>{level}</header>

                <strong>Parabéns</strong>

                <p>Você alcançou um novo level.</p>

                <button type="button" onClick={closeLevelUpModal}>
                    <img src="/icons/close.svg" alt="Fechar Modal" />
                </button>
            </div>
        </div>
    )
}