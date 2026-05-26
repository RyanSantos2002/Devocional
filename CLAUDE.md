# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Devocional" is a Brazilian Portuguese devotional/Bible study web app. It's a React 19 + TypeScript SPA built with Vite, using Supabase for optional cloud sync and Google Gemini AI for verse commentary. The app is designed **offline-first** — all data persists in localStorage and works without Supabase configured.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — TypeScript check + Vite production build
- `npm run lint` — ESLint
- `npm run preview` — Preview production build locally
- `npm run import-bible` — Run `scripts/import-bible.ts` via tsx
- `npm run seed-bible` — Seed Supabase Bible cache via `scripts/seed-supabase-bible.ts`

## Architecture

**Single-page app with tab-based navigation.** All state lives in `App.tsx` and is passed down as props — there is no router or state management library.

### Key Layers

- **App.tsx** — Central orchestrator. Owns all application state (journal entries, meetings, prayers, goals, reading progress, highlights, auth session). Contains the cloud sync worker (30s interval) and streak calculator. All CRUD handlers are defined here and passed to child components.
- **src/components/** — UI views, one per tab:
  - `Dashboard` — Home/overview with stats and verse of the day
  - `BibleReader` — Bible reading with highlights, AI commentary, and reading plans
  - `Journal` — Devotional journal entries + prayer wall
  - `Discipleship` — Discipleship meetings, goals, and shared feed
  - `Sidebar` — Navigation sidebar
  - `Auth` — Supabase authentication screen
  - `VerseCardModal`, `EdificationFeed`, `PrayerWall`, `ReadingPlans` — Supporting UI

- **src/services/**
  - `supabase.ts` — Supabase client init (gracefully null if unconfigured), all cloud sync functions (offline-first upsert pattern), shared feed, and type exports (`PrayerRequest`, `DiscipleshipGoal`, `PlanProgress`, `SharedDevocional`)
  - `gemini.ts` — Google Gemini AI integration for Bible verse commentary (uses `gemini-2.5-flash`)

- **src/hooks/**
  - `useBible.ts` — Bible book metadata (`BIBLE_BOOKS` constant with Portuguese names), verse/chapter types, and Bible data fetching with Supabase cache fallback
  - `useLocalStorage.ts` — Generic localStorage hook (typed, JSON serialization)

### Data Flow

1. **Offline-first**: `useLocalStorage` hook persists all state to localStorage keys prefixed with `devocional-`
2. **Cloud sync**: When Supabase is configured, a background worker in `App.tsx` syncs every 30s and on reconnect, using upsert to merge local ↔ cloud
3. **Auth**: Optional Supabase auth; if Supabase is not configured (`supabase` is `null`), the app runs fully offline

### Environment Variables

Set in `.env` (gitignored):
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key
- `VITE_GEMINI_API_KEY` — Optional server-side Gemini key (users can also provide their own in the UI)

### Supabase Tables

Tables referenced in code: `capitulos_biblia`, `diario_devocional`, `encontros_discipulado`, `destaques_biblia`, `oracoes`, `metas_discipulado`, `progresso_leitura`, `devocionais_compartilhados`

## Language

The entire UI and user-facing strings are in **Brazilian Portuguese**. Code comments and variable names mix Portuguese and English.
