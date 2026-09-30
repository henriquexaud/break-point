import { CompletedChallenges } from "../components/CompletedChallenges";
import { Countdown } from "../components/Countdown";
import { ExperienceBar } from "../components/ExperienceBar";
import { Profile } from '../components/Profile';
import { ChallengeBox } from "../components/ChallengeBox";

import Head from 'next/head';
import { GetServerSideProps } from 'next';

import styles from '../styles/pages/Home.module.css';

import { CountdownProvider } from "../contexts/CountdownContext";
import { ChallengeProvider } from "../contexts/ChallengeContext";

interface HomeProps {
  level: number;
  currentExperience: number;
  challengeCompleted: number;
  streak: number;
  lastActiveDate: string | null;
}

export default function Home(props: HomeProps) {
  return (
    <ChallengeProvider
      level={props.level}
      currentExperience={props.currentExperience}
      challengeCompleted={props.challengeCompleted}
      streak={props.streak}
      lastActiveDate={props.lastActiveDate}
    >
      <div className={styles.container}>
        <Head>
          <title>BreakPoint</title>
        </Head>

        <ExperienceBar />
        <CountdownProvider>
          <section>
            <div>
              <Profile />
              <CompletedChallenges />
              <Countdown />
            </div>
            <div>
              <ChallengeBox />
            </div>
          </section>
        </CountdownProvider>
      </div>
    </ChallengeProvider>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { level, currentExperience, challengeCompleted, streak, lastActiveDate } = ctx.req.cookies;

  return {
    props: {
      level: Number(level) || 1,
      currentExperience: Number(currentExperience) || 0,
      challengeCompleted: Number(challengeCompleted) || 0,
      streak: Number(streak) || 0,
      lastActiveDate: lastActiveDate || null
    }
  }
}
