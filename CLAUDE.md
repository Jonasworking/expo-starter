# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root unless noted.

```bash
# Development
pnpm dev              # start all apps (Turborepo)
pnpm dev:native       # start only the Expo/React Native app

# Type checking
pnpm check-types      # typecheck across all packages

# Linting & formatting (Biome via Ultracite)
pnpm dlx ultracite fix    # auto-fix formatting and lint issues
pnpm dlx ultracite check  # check without fixing

# Icons (run from apps/native/)
pnpx @monicon/cli generate  # regenerate icon components after editing monicon.config.ts
```

The package manager is **pnpm**. The README mentions `bun` but this repo uses pnpm (`packageManager` field in root `package.json`).

## Architecture

This is a **pnpm + Turborepo monorepo** with one app and shared packages:

```
apps/native/          — Expo (React Native) app
packages/config/      — shared tsconfig base
packages/env/         — type-safe env validation via @t3-oss/env-core + zod
```

There is no web app despite the README referencing one — only `apps/native` exists.

### apps/native layout

```
src/app/              — expo-router file-based routes
  _layout.tsx         — root layout: loads fonts, wraps providers
  (tabs)/             — tab group (Home + Explore tabs)
src/components/
  ui/                 — primitive UI components (Button, Card, Text, BottomSheet)
  icons/              — generated icon components (do not edit manually)
  theme-toggle.tsx    — light/dark toggle used in tab header
src/contexts/
  app-theme-context.tsx — AppThemeProvider + useAppTheme hook
src/lib/
  theme/              — useThemeColor hook + ThemeColor type
  utils/cn.ts         — tailwind-merge + clsx utility
src/global.css        — Tailwind v4 + Uniwind theme (fonts, colors, radius)
monicon.config.ts     — icon generation config
```

### Provider stack (root `_layout.tsx`)

`GestureHandlerRootView` → `KeyboardProvider` → `AppThemeProvider` → `BottomSheetModalProvider` → routes → `PortalHost`

### Theme system

Theming goes through **Uniwind** (Tailwind CSS for React Native). The active theme (`light`/`dark`) is managed by `Uniwind.setTheme()` and surfaced via `useAppTheme()` from `AppThemeContext`. To read a resolved color value in JS, use `useThemeColor` from `@/lib/theme/use-theme-color`.

### Environment variables

Validated at startup via `packages/env/src/native.ts`. All client-side variables must be prefixed `EXPO_PUBLIC_`. Add new variables there and validate with zod.

### Icons

Icons are pre-generated as React Native components. Edit the `icons` array in `monicon.config.ts`, then run `pnpx @monicon/cli generate`. Never edit files under `src/components/icons/` by hand — they are overwritten on each generation.

## Linting

Biome config extends `ultracite/biome/core` and `ultracite/biome/react` (see `biome.jsonc`). Run `pnpm dlx ultracite fix` before committing. Detailed code style rules are in `.claude/CLAUDE.md`.
