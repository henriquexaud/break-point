import { useContext } from 'react';
import { ChallengeContext } from '../contexts/ChallengeContext';

import { CHARACTERS, getCharacter } from '../utils/characters';

import styles from '../styles/components/Profile.module.css';

export function Profile() {
    const { level, streak } = useContext(ChallengeContext);

    const character = getCharacter(level);
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
