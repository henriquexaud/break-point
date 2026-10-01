import { useContext } from 'react';
import { ChallengeContext } from '../contexts/ChallengeContext';
import { CountdownContext } from '../contexts/CountdownContext';

import styles from '../styles/components/ChallengeBox.module.css';

export function ChallengeBox() {
    const {
        activeChallenge,
        canSwapChallenge,
        streakBonus,
        resetChallenge,
        completeChallenge,
        swapChallenge
    } = useContext(ChallengeContext);
    const { mode } = useContext(CountdownContext);

    const isBreak = mode !== 'focus';

    return (

        <div className={styles.challengeBoxContainer}>
            { activeChallenge ? (
                <div className={styles.challengeActive}>

                    <header>
                        Ganhe {activeChallenge.xp + streakBonus} xp
                        { streakBonus > 0 && (
                            <span className={styles.streakBonus}>
                                +{streakBonus}<span className={styles.streakBonusText}> de bônus pela sequência</span> 🔥
                            </span>
                        )}
                    </header>

                    <main>
                        <img src={`icons/${activeChallenge.img}`} alt="objetivo" />
                        <strong>Novo Desafio</strong>
                        <p>{activeChallenge.description}</p>
                    </main>

                    <footer>
                        <button
                            type='button'
                            onClick={completeChallenge}>Completei
                            <span className={styles.buttonXp}> +{activeChallenge.xp + streakBonus} xp</span>
                        </button>

                        <button
                            type='button'
                            onClick={resetChallenge}>Desisti
                        </button>
                    </footer>

                    { canSwapChallenge && (
                        <button
                            type='button'
                            className={styles.swapButton}
                            onClick={swapChallenge}>
                            Trocar desafio
                        </button>
                    )}
                </div>
            ) : (
                <div className={styles.challengeNotActive}>
                    <p>
                        <img src="icons/flask.png" alt="level" />
                    </p>
                    { isBreak ? (
                        <strong>Aproveite o resto da pausa para descansar</strong>
                    ) : (
                        <strong>Finalize um ciclo para liberar o próximo desafio</strong>
                    )}
                </div>
            )
            }
        </div>
    );
}
