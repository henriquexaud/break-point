# BreakPoint
Aplicação web que gamifica o foco nos ciclos de estudo ou produção.

Link para versão online: https://break-point-beryl.vercel.app/

## Rodando localmente

Requer **Node 18.17+** (recomendado Node 22, fixado no `.nvmrc`).

```bash
nvm install && nvm use
yarn install
yarn dev
```

Acesse no navegador: http://localhost:3000

## Instalando como app (PWA)

O BreakPoint pode ser instalado e funciona offline depois da primeira visita.

- **Computador (Chrome ou Edge):** botão "Instalar app" no rodapé ou ícone de instalação na barra de endereço.
- **Android (Chrome):** botão "Instalar app" no rodapé ou menu ⋮ → "Instalar app".
- **iPhone e iPad:** Compartilhar → "Adicionar à Tela de Início".

O service worker só é gerado no build de produção. Para testar localmente:

```bash
yarn build
yarn start
```
