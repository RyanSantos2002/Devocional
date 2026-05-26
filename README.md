# Devocional - Estudo Biblico & Discipulado

Aplicativo web completo para vida devocional, leitura da Biblia e acompanhamento de discipulado. Funciona 100% offline com sincronizacao opcional na nuvem.

## Funcionalidades

- **Leitor Biblico** - Biblia NVI e ACF completa com cache offline, destaques, comentarios com IA (Google Gemini) e planos de leitura guiados
- **Diario Devocional** - Registro estruturado de reflexoes, oracoes, gratidao e aplicacao pratica
- **Mural de Oracao** - Acompanhamento de pedidos de oracao com testemunhos de respostas
- **Discipulado** - Registro de encontros, metas compartilhadas com mentor/discipulo e mural de edificacao comunitario
- **Planos de Leitura** - Jornada da Fe, Evangelho de Joao e Sabedoria de Proverbios com progresso visual
- **Dashboard Inteligente** - Estatisticas de streak, tempo de leitura, habitos diarios e versiculo do dia
- **Busca Global** - Busca por livros, devocionais e oracoes com `Ctrl+K`
- **Tema Claro/Escuro** - Toggle de tema com preferencia salva
- **Export/Import** - Backup completo dos dados em JSON
- **PWA** - Instalavel como app nativo no celular, com service worker e cache offline

## Tecnologias

| Tecnologia | Uso |
|---|---|
| React 19 | Interface de usuario |
| TypeScript 6 | Tipagem estatica |
| Vite 8 | Build e dev server |
| React Router | Navegacao com rotas e lazy loading |
| Supabase | Autenticacao e sincronizacao na nuvem (opcional) |
| Google Gemini | Comentarios de IA nos versiculos (opcional) |
| Workbox (PWA) | Service worker e cache offline |
| Lucide React | Icones |

## Como Rodar

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de producao
npm run build

# Preview do build
npm run preview
```

## Variaveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (opcional - o app funciona 100% offline sem estas variaveis):

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_GEMINI_API_KEY=sua-chave-gemini
```

- **Supabase** - Habilita login, sincronizacao na nuvem e mural comunitario
- **Gemini** - Habilita comentarios de IA no leitor biblico (o usuario tambem pode configurar direto no app)

## Estrutura do Projeto

```
src/
  components/     # Componentes de UI (Dashboard, BibleReader, Journal, etc.)
  contexts/       # AppContext - gerenciamento de estado global
  hooks/          # Hooks customizados (useAuth, useJournal, usePrayers, etc.)
  services/       # Supabase e Gemini API
  types.ts        # Tipos compartilhados
  App.tsx          # Rotas e layout principal
  main.tsx        # Entry point com BrowserRouter
```

## Arquitetura

- **Offline-first** - Todos os dados persistem em localStorage e funcionam sem internet
- **Sync opcional** - Quando Supabase esta configurado, sincroniza a cada 30s e ao reconectar
- **Context API** - Estado global via `AppContext` com hooks dedicados por dominio
- **Code splitting** - Cada pagina carrega sob demanda via `React.lazy()`
- **PWA** - Service worker com cache de fontes, API da Biblia e assets estaticos

## Scripts Utilitarios

```bash
# Importar dados da Biblia
npm run import-bible

# Popular cache da Biblia no Supabase
npm run seed-bible
```

## Licenca

Projeto privado.
