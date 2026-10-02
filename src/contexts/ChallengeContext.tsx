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
import { applyExperience, getExperienceToNextLevel } from "../utils/experience";
import { getDateKey, getNextStreak, getStreakBonus, isStreakBroken } from "../utils/streak";

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

export const ChallengeContext = createContext({} as ChallengesContextData);

export function ChallengeProvider({ children, ...rest }: ChallengesProviderProps) {

    const initialProgress = applyExperience(rest.level ?? 1, rest.currentExperience ?? 0);

    const [level, setLevel] = useState(initialProgress.level);
    const [currentExperience, setCurrentExperience] = useState(initialProgress.experience);
    const [challengeCompleted, setChallengeCompleted] = useState(rest.challengeCompleted ?? 0);
    const [streak, setStreak] = useState(rest.streak ?? 0);
    const [lastActiveDate, setLastActiveDate] = useState(rest.lastActiveDate);
    const [isProgressLoaded, setIsProgressLoaded] = useState(false);

    const [activeChallenge, setActiveChallenge] = useState<Challenge>(null);
    const [canSwapChallenge, setCanSwapChallenge] = useState(false);
    const [isLevelUpModalOpen, setIsLevelUpModal] = useState(false);
    const lastChallenge = useRef<Challenge>(null);

    const experienceToNextLevel = getExperienceToNextLevel(level);

    const streakBonus = activeChallenge ? getStreakBonus(activeChallenge.xp, streak) : 0;

    useEffect(() => {
        // Offline a página vem do cache do service worker, com o progresso de quando foi salva.
        // Por isso o que vale são os cookies, e não as props
        const saved = Cookies.get();
        const progress = applyExperience(Number(saved.level) || 1, Number(saved.currentExperience) || 0);
        const savedLastActiveDate = saved.lastActiveDate || null;

        setLevel(progress.level);
        setCurrentExperience(progress.experience);
        setChallengeCompleted(Number(saved.challengeCompleted) || 0);
        setStreak(isStreakBroken(savedLastActiveDate) ? 0 : Number(saved.streak) || 0);
        setLastActiveDate(savedLastActiveDate);
        setIsProgressLoaded(true);
    }, []);

    useEffect(() => {
        if (!isProgressLoaded) {
            return;
        }

        const options = { expires: 365 };

        Cookies.set('level', String(level), options);
        Cookies.set('currentExperience', String(currentExperience), options);
        Cookies.set('challengeCompleted', String(challengeCompleted), options);
        Cookies.set('streak', String(streak), options);

        if (lastActiveDate) {
            Cookies.set('lastActiveDate', lastActiveDate, options);
        }
    }, [isProgressLoaded, level, currentExperience, challengeCompleted, streak, lastActiveDate])

    function closeLevelUpModal() {
        setIsLevelUpModal(false);
    }

    function registerActivity() {
        const today = getDateKey();

        if (lastActiveDate === today) {
            return;
        }

        setStreak(getNextStreak(streak, lastActiveDate));
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
