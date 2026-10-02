// Do nível mais alto para o mais baixo
export const CHARACTERS = [
    { minLevel: 20, name: 'Rick Supremo', img: 'icons/rick-supreme.png' },
    { minLevel: 15, name: 'Rick Transcendental', img: 'icons/rick-transcendent.png' },
    { minLevel: 10, name: 'Rick Cósmico', img: 'icons/rick-cosmic.png' },
    { minLevel: 5, name: 'Rick Sanchez', img: 'icons/rick-colors.png' },
    { minLevel: 1, name: 'Morty Smith', img: 'icons/morty.png' }
];

export function getCharacter(level: number) {
    return CHARACTERS.find(({ minLevel }) => level >= minLevel) ?? CHARACTERS[CHARACTERS.length - 1];
}
