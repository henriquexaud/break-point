import { useContext } from 'react';
import { ChallengeContext } from '../contexts/ChallengeContext';

import styles from '../styles/components/CompletedChallenges.module.css'

export function CompletedChallenges() {
    const { challengeCompleted } = useContext(ChallengeContext);

    return (
        <div className={styles.completedChallengesContainer} title="Ciclos completos">
            <span>Ciclos<span className={styles.labelRest}> completos</span></span>
            <span>{challengeCompleted}</span>
        </div>
    )
}
