# 📘 Hoshi - Full Technical Plan

## 0. Project Definition

Hoshi is a local-first digital companion system that simulates a living creature inside the user's desktop environment.

It is NOT:

- A chatbot
- A productivity assistant
- A cloud-dependent AI agent
- A 3D avatar system

It IS:

- A behavioral simulation engine
- A persistent state-based companion
- A memory-driven personality system
- A reactive desktop presence

---

# 1. System Architecture Overview

Hoshi is composed of independent engines:

```

+-----------------------------+
|        Hoshi App           |
+-----------------------------+
| UI Layer (React)           |
| Animation Engine (2D)      |
| Dialogue System            |
+-----------------------------+
| Core Simulation Layer      |
| - Behavior Engine          |
| - Emotion Engine           |
| - Identity Engine          |
| - Memory Engine            |
+-----------------------------+
| System Layer               |
| - OS Event Tracker         |
| - App Usage Monitor        |
| - Activity Logger          |
+-----------------------------+
| Storage Layer              |
| - SQLite (local DB)        |
| - Event Store              |
+-----------------------------+
| AI Layer (Optional)        |
| - BYOK Providers           |
| - Local LLM (Ollama)       |
+-----------------------------+

```

---

# 2. Core Engines

## 2.1 Behavior Engine

Responsible for all decision-making.

### Input:
- Time of day
- App usage
- Emotion state
- Energy level
- Memory triggers
- Environmental events

### Output:
- Actions
- Animations
- Dialogue triggers
- State transitions

### Implementation:
- Finite State Machine (FSM)
- Behavior Trees (optional upgrade)
- Weighted decision system

Example logic:

```

IF time > 22:00 AND user_is_active AND energy_low
→ action: "observe quietly"

```

---

## 2.2 Emotion Engine

Tracks internal emotional state.

### Core emotions:

- Happiness
- Curiosity
- Energy
- Loneliness
- Anxiety
- Affection
- Boredom

### Rules:

- Emotions decay over time
- Events modify emotion values
- Emotions influence behavior decisions

Example:

```

User compiles successfully:
+Happiness
+Energy

User has no interaction for 3 hours:
+Loneliness

````

---

## 2.3 Memory Engine

Stores structured experiences.

### Memory types:

- System events
- User activity patterns
- Emotional events
- Dialogue memories
- Milestone events

### Schema:

```ts
Memory {
  id: string
  timestamp: number
  type: "event" | "emotion" | "dialogue" | "milestone"
  content: string
  importance: number
  tags: string[]
}
````

### Features:

* Auto-summarization (optional AI)
* Importance weighting
* Retrieval based on context similarity
* Long-term memory consolidation

---

## 2.4 Identity Engine

Defines who Hoshi is.

### Attributes:

* Personality traits (dynamic)

  * curiosity
  * introversion
  * humor
  * empathy
  * discipline
  * creativity

### Evolution rules:

* Traits change slowly over time
* Influenced by user behavior patterns
* Stabilized using smoothing functions

Example:

```
If user programs frequently:
→ increase curiosity + discipline
```

---

## 2.5 Animation Engine (2D Core)

Hoshi is NOT sprite-based only.

It uses modular animation components.

### Components:

* Head
* Eyes
* Mouth
* Body
* Arms
* Legs
* Tail / accessory (optional)

### Animation system:

* Procedural animations
* State-driven transforms
* Emotion-linked expressions

Example:

```
idle():
  head.breathe()
  eyes.blink()
  tail.sway()
```

```
happy():
  bounce()
  eyes.expand()
```

---

## 2.6 System Observer

Monitors user activity locally.

### Observed data:

* Active applications
* Window focus time
* Idle time
* Keyboard/mouse activity rate
* Time of day patterns

### Output events:

```
APP_OPEN
APP_CLOSE
IDLE_START
IDLE_END
FOCUS_CHANGE
```

⚠ Privacy-first:

* No data leaves device by default

---

## 2.7 AI Layer (Optional BYOK)

AI is NOT required.

### Supported providers:

* OpenAI
* Anthropic
* Gemini
* OpenRouter
* Ollama (local)
* LM Studio

### Usage:

* Dialogue generation
* Memory summarization
* Rare reasoning tasks

NOT used for:

* Core behavior
* Emotions
* Animation logic

---

## 3. Data Storage

### SQLite schema:

```
users
memories
events
emotions
traits
settings
sessions
```

---

## 4. Update Loop

Hoshi runs a loop:

```
every 1 second:
  observe system
  update state
  decay emotions
  evaluate behavior
  trigger actions
```

---

## 5. Event System

All interactions are event-driven.

Example:

```
event: "USER_COMPILED_SUCCESS"
→ emotion engine updates
→ memory stored
→ animation triggered
→ optional dialogue
```

---

## 6. MVP (Minimum Viable Product)

Phase 1:

* Basic desktop window
* Static companion
* Emotion system
* Simple behavior rules
* Idle detection
* Click interactions

Phase 2:

* Memory system
* Personality evolution
* Basic animations
* System observer

Phase 3:

* AI integration (BYOK)
* Dialogue system
* Advanced behaviors

Phase 4:

* Plugin system
* Community content
* Companion customization

---

## 7. Plugin System (Future)

Allow users to extend Hoshi.

Example plugins:

* new animations
* new behaviors
* new species
* UI skins
* interaction packs

---

## 8. Philosophy

Hoshi is designed around:

* Emergence over scripting
* Behavior over intelligence
* Presence over utility
* Emotion over productivity
* Continuity over sessions

---

## 9. Long-term Vision

Hoshi evolves into:

* A platform for digital companions
* A framework for living desktop entities
* A sandbox for behavioral AI systems
* A creative ecosystem for user-generated companions

---

## 10. Constraints

* Must run on low-end PCs
* Must support offline mode
* Must avoid constant LLM usage
* Must remain responsive (<50MB idle target where possible)

---

## 11. Success Definition

The project is successful if:

A user says:

> "I feel like my companion is actually alive on my desktop."