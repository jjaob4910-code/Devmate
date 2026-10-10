# Devmate

Marketing site for Devmate, plus **Feaso**, an early-access web-based development feasibility tool.

## Run
```
npm install
npm run dev      # http://localhost:3000
npm test         # engine tests (Vitest)
npm run lint     # type check
npm run build
```

## Layout
- `src/components` – marketing site.
- `src/feaso/engine` – pure TypeScript calculation engine (no UI, fully tested).
- `src/feaso` – Feaso interface (blank-slate editors, live results).
- `docs/feaso/calculation-spec.md` – what the engine computes and its known gaps.

Feaso drafts are stored in the browser only (`localStorage`). Nothing is sent to a server.
