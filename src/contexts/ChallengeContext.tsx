import {
    createContext,
    useState,
    ReactNode,
    useEffect,
    useRef
} from "react";

import challenges from "../../challenges.json"
import Cookies from 'js-cookie';

import { LevelUpModal } from "../components/levelUpModal";
import { notify } from "../utils/notify";

interface Challenge {
    img: string;
    description: string;
    xp: number;
}

interface ChallengesContextData {
    level: number;
    currentExperience: number;
    experienceToNextLevel: number;
    challengeCompleted: number;
    activeChallenge: Challenge;
    canSwapChallenge: boolean;
    streak: number;
    streakBonus: number;
    startNewChallenge: () => void;
    swapChallenge: () => void;
    completeChallenge: () => void;
    resetChallenge: () => void;
    closeLevelUpModal: () => void;
}

interface ChallengesProviderProps {
    children: ReactNode;
    level: number;
    currentExperience: number;
    challengeCompleted: number;
    streak: number;
    lastActiveDate: string | null;
}

const BASE_EXPERIENCE = 100;
const EXPERIENCE_INCREMENT = 50;

// 100 xp no nível 1, e cada nível seguinte pede 50 xp a mais
function getExperienceToNextLevel(level: number) {
    return BASE_EXPERIENCE + EXPERIENCE_INCREMENT * (level - 1);
}

// Converte o xp acumulado em níveis (também ajusta progresso salvo com a curva antiga)
function applyExperience(level: number, experience: number) {
    while (experience >= getExperienceToNextLevel(level)) {
        experience -= getExperienceToNextLevel(level);
        level++;
    }

    return { level, experience };
}

const STREAK_BONUS_MIN_DAYS = 3;
const STREAK_BONUS_RATE = 0.1;

// Data no fuso local no formato YYYY-MM-DD
function getDateKey(daysAgo = 0) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${date.getFullYear()}-${month}-${day}`;
}

export const ChallengeContext = createContext({} as ChallengesContextData);

export function ChallengeProvider({ children, ...rest }: ChallengesProviderProps) {

    const initialProgress = applyExperience(rest.level ?? 1, rest.currentExperience ?? 0);

    const [level, setLevel] = useState(initialProgress.level);
    const [currentExperience, setCurrentExperience] = useState(initialProgress.experience);
    const [challengeCompleted, setChallengeCompleted] = useState(rest.challengeCompleted ?? 0);
    const [streak, setStreak] = useState(rest.streak ?? 0);
    const [lastActiveDate, setLastActiveDate] = useState(rest.lastActiveDate);

    const [activeChallenge, setActiveChallenge] = useState<Challenge>(null);
    const [canSwapChallenge, setCanSwapChallenge] = useState(false);
    const [isLevelUpModalOpen, setIsLevelUpModal] = useState(false);
    const lastChallenge = useRef<Challenge>(null);

    const experienceToNextLevel = getExperienceToNextLevel(level);

    const streakBonus = activeChallenge && streak >= STREAK_BONUS_MIN_DAYS
        ? Math.round(activeChallenge.xp * STREAK_BONUS_RATE)
        : 0;

    useEffect(() => {
        // A sequência é quebrada se o último ciclo foi antes de ontem
        if (lastActiveDate && lastActiveDate !== getDateKey() && lastActiveDate !== getDateKey(1)) {
            setStreak(0);
        }
    }, []);

    useEffect(() => {
        const options = { expires: 365 };

        Cookies.set('level', String(level), options);
        Cookies.set('currentExperience', String(currentExperience), options);
        Cookies.set('challengeCompleted', String(challengeCompleted), options);
        Cookies.set('streak', String(streak), options);

        if (lastActiveDate) {
            Cookies.set('lastActiveDate', lastActiveDate, options);
        }
    }, [level, currentExperience, challengeCompleted, streak, lastActiveDate])

    function closeLevelUpModal() {
        setIsLevelUpModal(false);
    }

    function registerActivity() {
        const today = getDateKey();

        if (lastActiveDate === today) {
            return;
        }

        setStreak(lastActiveDate === getDateKey(1) ? streak + 1 : 1);
        setLastActiveDate(today);
    }

    function pickChallenge() {
        let challenge: Challenge;

        do {
            challenge = challenges[Math.floor(Math.random() * challenges.length)];
        } while (challenge === lastChallenge.current);

        lastChallenge.current = challenge;

        return challenge;
    }

    function startNewChallenge() {
        const challenge = pickChallenge();

        registerActivity();
        setActiveChallenge(challenge);
        setCanSwapChallenge(true);

        notify('Novo desafio', `Valendo ${challenge.xp}xp!`);
    }

    function swapChallenge() {
        if (!activeChallenge || !canSwapChallenge) {
            return;
        }

        setActiveChallenge(pickChallenge());
        setCanSwapChallenge(false);
    }

    function resetChallenge() {
        setActiveChallenge(null);
    }

    function completeChallenge() {
        if (!activeChallenge) {
            return;
        }

        const xp = activeChallenge.xp + streakBonus;

        const progress = applyExperience(level, currentExperience + xp);

        if (progress.level > level) {
            setLevel(progress.level);
            setIsLevelUpModal(true);
        }

        setCurrentExperience(progress.experience);
        setActiveChallenge(null);
        setChallengeCompleted(challengeCompleted + 1);
    }

    return (
        <ChallengeContext.Provider
            value={{
                level,
                currentExperience,
                challengeCompleted,
                startNewChallenge,
                swapChallenge,
                canSwapChallenge,
                activeChallenge,
                completeChallenge,
                resetChallenge,
                experienceToNextLevel,
                closeLevelUpModal,
                streak,
                streakBonus
            }}
        >
            {children}
            { isLevelUpModalOpen && <LevelUpModal />}
        </ChallengeContext.Provider>
    );
}
