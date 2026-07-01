# Hoshi — AI Agent Guide

## Project

Hoshi is a local-first digital desktop companion. Built with **Tauri 2.0**, **React 18**, **PixiJS 8**, **TypeScript**, and **Zustand**.

## Directory Structure

```
src/
├── engines/          Core simulation engines
│   ├── emotion.ts    EmotionEngine — 7 emotions, decay, events
│   ├── behavior.ts   BehaviorEngine — FSM with priority rules
│   ├── identity.ts   IdentityEngine — personality trait evolution
│   └── memory.ts     MemoryEngine — structured memory store
├── renderer/         PixiJS rendering layer
│   ├── PixiApp.ts    Application lifecycle & sprite loading
│   └── animations.ts Procedural animation functions
├── observers/        System monitoring
│   └── system.ts     SystemObserver — idle, activity, context
├── components/       React components
│   ├── HoshiCanvas.tsx  Canvas mount component
│   └── HUD.tsx         Debug state overlay
├── store/            Global state (Zustand)
│   └── state.ts
├── types/            Shared TypeScript types
│   └── index.ts
├── App.tsx           Root component
├── App.css           Global styles
└── main.tsx          Entry point
src-tauri/
├── Cargo.toml        Rust dependencies
├── tauri.conf.json   Window config (transparent, frameless, alwaysOnTop)
├── capabilities/     Tauri 2.0 permissions
└── src/
    ├── main.rs       Rust entry
    └── lib.rs        Tauri builder
```

## Tauri Config

- Frameless, transparent, always-on-top window (150×150)
- CSP disabled for local asset loading
- Dev server on port 1420

## Core Loop (1s tick)

```
SystemObserver.poll()  →  SystemEvent[]
EmotionEngine.tick(events)
IdentityEngine.tick(events)
BehaviorEngine.evaluate(emotions, context)
→ update store → PixiJS updates animation
```

## Emotion Engine

7 emotions (0–100): happiness, curiosity, energy, loneliness, anxiety, affection, boredom.
Each decays toward baseline each tick.

## Behavior FSM

Priority-based rule evaluation → transitions to Idle/Observing/Happy/Sleeping/Curious.

## PixelLab MCP (asset generation)

Use `create_character` for Hoshi's pixel art sprites. Store in `public/sprites/`.

## Build Commands

```bash
npm install          # install JS deps
npm run tauri dev    # dev mode with hot reload
npm run tauri build  # production build
```

## Constraints (from PLAN.md)

- Must run on low-end PCs
- Must support offline mode
- Must avoid constant LLM usage
- <50MB idle target

## Workflow Constraints (permanent)

Always follow these two rules in every session:

1. **Micro-commits**: Commit after every logical step (or group of tiny related steps). Each commit message must clearly describe what changed in plain language. No mega-commits with 10 unrelated changes.

2. **Todo updates**: Update the task list (`todowrite`) after every step — mark completed, add new items, reorder as needed. Never batch status updates; they should reflect real-time progress.

## Philosophy

- Emergence over scripting
- Behavior over intelligence
- Presence over utility
- Emotion over productivity
- Continuity over sessions
