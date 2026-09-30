import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react';

import { ChallengeContext } from './ChallengeContext';
import { notify } from '../utils/notify';

export type CountdownMode = 'focus' | 'shortBreak' | 'longBreak';

interface CountdownContextData {
    minutes: number;
    seconds: number;
    isActive: boolean;
    mode: CountdownMode;
    focusCycles: number;
    resetCountdown: () => void;
    startCountdown: () => void;
}

interface CountdownProviderProps {
    children: ReactNode;
}

export const CountdownContext = createContext({} as CountdownContextData)

export const CYCLES_BEFORE_LONG_BREAK = 4;

const DURATIONS: Record<CountdownMode, number> = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
};

let countdownTimeout: NodeJS.Timeout;

export function CountdownProvider({ children }: CountdownProviderProps) {
    const { startNewChallenge } = useContext(ChallengeContext);

    const [mode, setMode] = useState<CountdownMode>('focus');
    const [time, setTime] = useState(DURATIONS.focus);
    const [isActive, setIsActive] = useState(false);
    const [focusCycles, setFocusCycles] = useState(0);
    const endTime = useRef(0);

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    function startTimer(duration: number) {
        endTime.current = Date.now() + duration * 1000;
        setTime(duration);
        setIsActive(true);
    }

    function startCountdown() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        startTimer(DURATIONS.focus);
    }

    function resetCountdown() {
        setIsActive(false);
        clearTimeout(countdownTimeout);
        setMode('focus');
        setTime(DURATIONS.focus);
    }

    function finishFocus() {
        const cycles = focusCycles + 1;
        const nextMode = cycles % CYCLES_BEFORE_LONG_BREAK === 0 ? 'longBreak' : 'shortBreak';

        setFocusCycles(cycles);
        setMode(nextMode);
        startTimer(DURATIONS[nextMode]);
        startNewChallenge();
    }

    function finishBreak() {
        resetCountdown();
        notify('Pausa encerrada', 'Hora de voltar ao foco!');
    }

    useEffect(() => {
        if (isActive && time > 0) {
            // Recalcula pelo relógio: abas em segundo plano atrasam o setTimeout
            countdownTimeout = setTimeout(() => {
                setTime(Math.max(0, Math.ceil((endTime.current - Date.now()) / 1000)));
            }, 1000);
        } else if (isActive && time === 0) {
            if (mode === 'focus') {
                finishFocus();
            } else {
                finishBreak();
            }
        }
    }, [isActive, time]);

    return (
        <CountdownContext.Provider value={{
            minutes,
            seconds,
            isActive,
            mode,
            focusCycles,
            resetCountdown,
            startCountdown
        }}>
            { children}
        </CountdownContext.Provider>
    )
}
