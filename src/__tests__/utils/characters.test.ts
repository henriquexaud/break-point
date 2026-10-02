import { getCharacter } from '../../utils/characters';

describe('getCharacter', () => {
    it.each([
        [1, 'Morty Smith'],
        [4, 'Morty Smith'],
        [5, 'Rick Sanchez'],
        [9, 'Rick Sanchez'],
        [10, 'Rick Cósmico'],
        [15, 'Rick Transcendental'],
        [20, 'Rick Supremo'],
        [99, 'Rick Supremo']
    ])('nível %i usa %s', (level, name) => {
        expect(getCharacter(level).name).toBe(name);
    });

    it('cai no personagem inicial para níveis inválidos', () => {
        expect(getCharacter(0).name).toBe('Morty Smith');
    });
});
