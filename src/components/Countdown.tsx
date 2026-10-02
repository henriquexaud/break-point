import { useContext } from 'react';
import Head from 'next/head';
import { CountdownContext } from '../contexts/CountdownContext';
import { formatTime, getModeLabel } from '../utils/countdown';

import styles from '../styles/components/Countdown.module.css';

export function Countdown() {

    const {
        minutes,
        seconds,
        isActive,
        mode,
        focusCycles,
        startCountdown,
        resetCountdown
    } = useContext(CountdownContext)

    const time = formatTime(minutes * 60 + seconds);
    const [minuteLeft, minuteRight, , secondLeft, secondRight] = time.split('');

    const isBreak = mode !== 'focus';
    const label = getModeLabel(mode, focusCycles);

    let title = 'BreakPoint';

    if (isBreak) {
        title = `Pausa ${time} | BreakPoint`;
    } else if (isActive) {
        title = `${time} | BreakPoint`;
    }

    return (
        <div className={styles.countdown}>
            <Head>
                <title>{title}</title>
            </Head>

            <div className={styles.display}>
                <span className={`${styles.modeLabel} ${isBreak ? styles.modeLabelBreak : ''}`}>
                    {label}
                </span>

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
            </div>

            { isBreak ? (
                <button type="button"
                    className={`${styles.countdownButton} ${styles.countdownButtonBreak}`}
                    onClick={resetCountdown}>
                    Pular pausa
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
