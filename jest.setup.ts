import '@testing-library/jest-dom';

// O jsdom não implementa mídia: sem isso o notify() quebra ao tocar o som
Object.defineProperty(window, 'Audio', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({ play: jest.fn().mockResolvedValue(undefined) }))
});

// Também ausente no jsdom: por padrão o app não está instalado (modo navegador)
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockReturnValue({ matches: false })
});
