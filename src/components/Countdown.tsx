import { useContext } from 'react';
import Head from 'next/head';
import { CountdownContext, CYCLES_BEFORE_LONG_BREAK } from '../contexts/CountdownContext';

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

    const [minuteLeft, minuteRight] = String(minutes).padStart(2, '0').split('');
    const [secondLeft, secondRight] = String(seconds).padStart(2, '0').split('');
    const time = `${minuteLeft}${minuteRight}:${secondLeft}${secondRight}`;

    const isBreak = mode !== 'focus';

    let label = `Foco · ciclo ${(focusCycles % CYCLES_BEFORE_LONG_BREAK) + 1} de ${CYCLES_BEFORE_LONG_BREAK}`;

    if (mode === 'shortBreak') {
        label = 'Pausa curta';
    } else if (mode === 'longBreak') {
        label = 'Pausa longa';
    }

    let title = 'BreakPoint';

    if (isBreak) {
        title = `Pausa ${time} | BreakPoint`;
    } else if (isActive) {
        title = `${time} | BreakPoint`;
    }

    return (
        <div>
            <Head>
                <title>{title}</title>
            </Head>

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
