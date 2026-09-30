import { useContext } from 'react';
import Head from 'next/head';
import { CountdownContext } from '../contexts/CountdownContext';

import styles from '../styles/components/Countdown.module.css';

export function Countdown() {

    const {
        minutes,
        seconds,
        isActive,
        hasFinished,
        startCountdown,
        resetCountdown
    } = useContext(CountdownContext)

    const [minuteLeft, minuteRight] = String(minutes).padStart(2, '0').split('');
    const [secondLeft, secondRight] = String(seconds).padStart(2, '0').split('');

    let title = 'BreakPoint';

    if (hasFinished) {
        title = 'Novo desafio! | BreakPoint';
    } else if (isActive) {
        title = `${minuteLeft}${minuteRight}:${secondLeft}${secondRight} | BreakPoint`;
    }

    return (
        <div>
            <Head>
                <title>{title}</title>
            </Head>

            <div className={styles.countdownContainer}>
                <div>
                    <span>{minuteLeft}</span>
                    <span>{minuteRight}</span>
                </div>
                <span>:</span>
                <div>
                    <span>{secondLeft}</span>
                    <span>{secondRight}</span>
                </div>
            </div>

            { hasFinished ? (
                <button disabled className={`${styles.countdownButton} ${styles.countdownButtonFinished}`}>
                    Ciclo completo
                </button>
            ) : (
                <>
                    { isActive ? (

                        <button type="button"
                            className={`${styles.countdownButton} ${styles.countdownButtonActive}`}
                            onClick={resetCountdown}>
                            Abandonar ciclo
                        </button>
                    ) : (
                        <button type="button"
                            className={styles.countdownButton}
                            onClick={startCountdown}>
                            Iniciar um ciclo
                        </button>
                    )}
                </>
            )}
        </div>
    );
}