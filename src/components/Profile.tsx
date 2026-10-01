import { useContext } from 'react';
import { ChallengeContext } from '../contexts/ChallengeContext';

import styles from '../styles/components/Profile.module.css';

// Do nível mais alto para o mais baixo
const CHARACTERS = [
    { minLevel: 20, name: 'Rick Supremo', img: 'icons/rick-supreme.png' },
    { minLevel: 15, name: 'Rick Transcendental', img: 'icons/rick-transcendent.png' },
    { minLevel: 10, name: 'Rick Cósmico', img: 'icons/rick-cosmic.png' },
    { minLevel: 5, name: 'Rick Sanchez', img: 'icons/rick-colors.png' },
    { minLevel: 1, name: 'Morty Smith', img: 'icons/morty.png' }
];

export function Profile() {
    const { level, streak } = useContext(ChallengeContext);

    const character = CHARACTERS.find(({ minLevel }) => level >= minLevel) ?? CHARACTERS[CHARACTERS.length - 1];
    const hasMedal = character !== CHARACTERS[CHARACTERS.length - 1];

    return (
        <div className={styles.profileContainer}>
            <img src={character.img} alt="Foto de Perfil" />
            <div>
                <strong>{character.name}</strong>
                <p>
                    { hasMedal && <img src="/icons/medal.svg" alt="medal" /> }
                    Level {level}
                    { streak > 0 && (
                        <span
                            className={styles.streak}
                            title="Dias seguidos com pelo menos um ciclo completo"
                        >
                            🔥 {streak}
                            <span className={styles.streakUnit}> {streak === 1 ? 'dia' : 'dias'}</span>
                        </span>
                    )}
                </p>
            </div>
        </div>
    )
}
