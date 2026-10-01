import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
    swSrc: 'src/sw.ts',
    swDest: 'public/sw.js',
    disable: process.env.NODE_ENV === 'development',
    // O padrão é recarregar a página quando a conexão volta, o que zeraria um ciclo em andamento
    reloadOnOnline: false
});

export default withSerwist({});
