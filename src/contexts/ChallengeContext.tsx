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
    levelUp: () => void;
    startNewChallenge: () => void;
    completeChallenge: () => void;
    resetChallenge: () => void;
    closeLevelUpModal: () => void;
}

interface ChallengesProviderProps {
    children: ReactNode;
    level: number;
    currentExperience: number;
    challengeCompleted: number;
}

export const ChallengeContext = createContext({} as ChallengesContextData);

export function ChallengeProvider({ children, ...rest }: ChallengesProviderProps) {

    const [level, setLevel] = useState(rest.level ?? 1);
    const [currentExperience, setCurrentExperience] = useState(rest.currentExperience ?? 0);
    const [challengeCompleted, setChallengeCompleted] = useState(rest.challengeCompleted ?? 0);

    const [activeChallenge, setActiveChallenge] = useState(null);
    const [isLevelUpModalOpen, setIsLevelUpModal] = useState(false);
    const lastChallenge = useRef<Challenge>(null);

    const experienceToNextLevel = Math.pow((level + 1) * 5, 2)

    useEffect(() => {
        const options = { expires: 365 };

        Cookies.set('level', String(level), options);
        Cookies.set('currentExperience', String(currentExperience), options);
        Cookies.set('challengeCompleted', String(challengeCompleted), options);
    }, [level, currentExperience, challengeCompleted])

    function levelUp() {
        setLevel(level + 1);
        setIsLevelUpModal(true);
    }

    function closeLevelUpModal() {
        setIsLevelUpModal(false);
    }

    function startNewChallenge() {
        let challenge: Challenge;

        do {
            challenge = challenges[Math.floor(Math.random() * challenges.length)];
        } while (challenge === lastChallenge.current);

        lastChallenge.current = challenge;

        setActiveChallenge(challenge)

        new Audio('/icons/notification.mp3').play().catch(() => {});

        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Novo desafio', {
                body: `Valendo ${challenge.xp}xp!`
            })
        }
    }

    function resetChallenge() {
        setActiveChallenge(null);
    }

    function completeChallenge() {
        if (!activeChallenge) {
            return;
        }

        const { xp } = activeChallenge;

        let finalExperience = currentExperience + xp;

        if (finalExperience >= experienceToNextLevel) {
            finalExperience = finalExperience - experienceToNextLevel;
            levelUp();
        }
        setCurrentExperience(finalExperience);
        setActiveChallenge(null);
        setChallengeCompleted(challengeCompleted + 1);
    }

    return (
        <ChallengeContext.Provider
            value={{
                level,
                currentExperience,
                challengeCompleted,
                levelUp,
                startNewChallenge,
                activeChallenge,
                completeChallenge,
                resetChallenge,
                experienceToNextLevel,
                closeLevelUpModal
            }}
        >
            {children}
            { isLevelUpModalOpen && <LevelUpModal />}
        </ChallengeContext.Provider>
    );
}