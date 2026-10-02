import { render, screen } from '@testing-library/react';

import { CompletedChallenges } from '../../components/CompletedChallenges';
import { ExperienceBar } from '../../components/ExperienceBar';
import { Profile } from '../../components/Profile';
import { ChallengeContext } from '../../contexts/ChallengeContext';

function renderWith(ui: React.ReactElement, value: object) {
    return render(<ChallengeContext.Provider value={value as any}>{ui}</ChallengeContext.Provider>);
}

describe('CompletedChallenges', () => {
    it('mostra a quantidade de ciclos completos', () => {
        renderWith(<CompletedChallenges />, { challengeCompleted: 12 });

        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByTitle('Ciclos completos')).toBeInTheDocument();
    });
});

describe('ExperienceBar', () => {
    it('preenche a barra proporcionalmente ao xp', () => {
        const { container } = renderWith(<ExperienceBar />, { currentExperience: 75, experienceToNextLevel: 300 });

        expect(container.querySelector('div > div')).toHaveStyle({ width: '25%' });
        expect(screen.getAllByText(/75 xp/).length).toBeGreaterThan(0);
        expect(screen.getByText(/300 xp/)).toBeInTheDocument();
    });

    it('esconde o marcador de xp atual quando é zero', () => {
        renderWith(<ExperienceBar />, { currentExperience: 0, experienceToNextLevel: 100 });

        expect(screen.queryByText('0 xp', { selector: '[class*="currentExperience"]' })).not.toBeInTheDocument();
    });
});

describe('Profile', () => {
    it('mostra o personagem inicial sem medalha nem sequência', () => {
        renderWith(<Profile />, { level: 1, streak: 0 });

        expect(screen.getByText('Morty Smith')).toBeInTheDocument();
        expect(screen.getByAltText('Foto de Perfil')).toHaveAttribute('src', 'icons/morty.png');
        expect(screen.queryByAltText('medal')).not.toBeInTheDocument();
        expect(screen.queryByText(/🔥/)).not.toBeInTheDocument();
    });

    it('evolui o personagem e ganha medalha', () => {
        renderWith(<Profile />, { level: 10, streak: 0 });

        expect(screen.getByText('Rick Cósmico')).toBeInTheDocument();
        expect(screen.getByAltText('medal')).toBeInTheDocument();
        expect(screen.getByText(/Level 10/)).toBeInTheDocument();
    });

    it('usa o singular para 1 dia de sequência', () => {
        renderWith(<Profile />, { level: 1, streak: 1 });

        expect(screen.getByText(/🔥 1/)).toHaveTextContent('🔥 1 dia');
    });

    it('usa o plural para vários dias', () => {
        renderWith(<Profile />, { level: 1, streak: 5 });

        expect(screen.getByText(/🔥 5/)).toHaveTextContent('🔥 5 dias');
    });
});
