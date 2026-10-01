import { useContext } from "react";

import { CompletedChallenges } from "../components/CompletedChallenges";
import { Countdown } from "../components/Countdown";
import { ExperienceBar } from "../components/ExperienceBar";
import { Profile } from '../components/Profile';
import { ChallengeBox } from "../components/ChallengeBox";
import { InstallButton } from "../components/InstallButton";

import Head from 'next/head';
import { GetServerSideProps } from 'next';

import styles from '../styles/pages/Home.module.css';

import { CountdownProvider } from "../contexts/CountdownContext";
import { ChallengeContext, ChallengeProvider } from "../contexts/ChallengeContext";

interface HomeProps {
  level: number;
  currentExperience: number;
  challengeCompleted: number;
  streak: number;
  lastActiveDate: string | null;
}

function HomeContent() {
  const { activeChallenge } = useContext(ChallengeContext);

  return (
    // Em janelas pequenas o desafio ativo toma o lugar do relógio: o CSS decide pelo data-challenge
    <div className={styles.container} data-challenge={activeChallenge ? 'active' : 'idle'}>
      <Head>
        <title>BreakPoint</title>
      </Head>

      <ExperienceBar />
      <section>
        <div className={styles.timerColumn}>
          <div className={styles.summary}>
            <Profile />
            <CompletedChallenges />
          </div>
          <Countdown />
        </div>
        <ChallengeBox />
      </section>

      <InstallButton />
    </div>
  )
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
      <CountdownProvider>
        <HomeContent />
      </CountdownProvider>
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
