# 🎮 PokéFitness

Gamificação de treino e alimentação saudável com temática Pokémon.

## Como rodar

### Pré-requisitos
- Node.js 16+
- npm ou yarn

### Instalação

```bash
npm install
npm start
```

O app abre em `http://localhost:3000`

### Build para produção

```bash
npm run build
```

---

## Como importar no Firebase Studio

1. Acesse [studio.firebase.google.com](https://studio.firebase.google.com)
2. Clique em **"Import"** e selecione esta pasta (ou faça upload pelo GitHub)
3. O Firebase Studio detecta automaticamente que é um projeto React
4. Clique em **"Run"** para iniciar o servidor de desenvolvimento

---

## Estrutura do projeto

```
src/
├── App.jsx                  # Componente principal
├── App.module.css
├── index.js                 # Entry point React
├── index.css                # Variáveis globais de CSS
├── data/
│   └── pokemon.js           # Dados dos Pokémon e ações
├── hooks/
│   └── useGameState.js      # Lógica do jogo (XP, HP, level up)
└── components/
    ├── PokemonCard.jsx       # Card principal com sprite animado
    ├── PokemonSelector.jsx   # Seletor de Pokémon
    ├── ActionGrid.jsx        # Grade de ações (treino/alimentação)
    ├── ActivityLog.jsx       # Histórico de atividades
    └── Toast.jsx             # Notificação de XP / Level Up
```

---

## Próximos passos sugeridos

- [ ] Persistência com `localStorage` ou Firebase Firestore
- [ ] Autenticação com Firebase Auth
- [ ] Tela de perfil do treinador
- [ ] Sistema de missões diárias
- [ ] Modelos 3D com Three.js / React Three Fiber
- [ ] Batalhas entre Pokémon de amigos
- [ ] Notificações push para lembrar de treinar

---

## Sprites

Os sprites animados vêm da [PokeAPI](https://pokeapi.co/) — projeto open source, uso não-comercial.
