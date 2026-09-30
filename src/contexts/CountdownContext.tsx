import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react';

import { ChallengeContext } from './ChallengeContext';

interface CountdownContextData {
    minutes: number;
    seconds: number;
    isActive: boolean;
    hasFinished: boolean;
    resetCountdown: () => void;
    startCountdown: () => void;
}

interface CountdownProviderProps {
    children: ReactNode;
}

export const CountdownContext = createContext({} as CountdownContextData)

const CYCLE_DURATION = 25 * 60;

let countdownTimeout: NodeJS.Timeout;

export function CountdownProvider({ children }: CountdownProviderProps) {
    const { startNewChallenge } = useContext(ChallengeContext);

    const [time, setTime] = useState(CYCLE_DURATION);
    const [isActive, setIsActive] = useState(false);
    const [hasFinished, setHasFinished] = useState(false);
    const endTime = useRef(0);

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    function startCountdown() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        endTime.current = Date.now() + time * 1000;
        setIsActive(true);
    }

    function resetCountdown() {
        setIsActive(false);
        clearTimeout(countdownTimeout);
        setTime(CYCLE_DURATION);
        setHasFinished(false);
    }

    useEffect(() => {
        if (isActive && time > 0) {
            // Recalcula pelo relógio: abas em segundo plano atrasam o setTimeout
            countdownTimeout = setTimeout(() => {
                setTime(Math.max(0, Math.ceil((endTime.current - Date.now()) / 1000)));
            }, 1000);
        } else if (isActive && time === 0) {
            setIsActive(false);
            setHasFinished(true);
            startNewChallenge();
        }
    }, [isActive, time]);

    return (
        <CountdownContext.Provider value={{
            minutes,
            seconds,
            isActive,
            hasFinished,
            resetCountdown,
            startCountdown
        }}>
            { children}
        </CountdownContext.Provider>
    )
}
