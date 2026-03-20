# Calculator

[![CI](https://github.com/Costird21/calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/Costird21/calculator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A professional all-in-one calculator with **Standard**, **Scientific**, and **Programmer** modes. Built with vanilla JavaScript, Vite, and modern web standards.

**[Live Demo](https://costird21.github.io/calculator/)**

## Features

- **Standard Mode** — Addition, subtraction, multiplication, division, percent, sign toggle
- **Scientific Mode** — Trigonometric functions (sin, cos, tan + inverses), logarithms (ln, log), powers, square/cube roots, factorial, constants (pi, e), parentheses with full operator precedence via shunting-yard algorithm
- **Programmer Mode** — Multi-base arithmetic (HEX/DEC/OCT/BIN), bitwise operations (AND, OR, XOR, NOT, left/right shift), configurable bit widths (8/16/32/64-bit), two's complement signed integers, simultaneous multi-base display
- **Calculation History** — Sidebar panel with persistent history (localStorage), click to reuse results
- **Dark/Light Theme** — Respects system preference, manual toggle, persisted to localStorage
- **Keyboard Support** — Full keyboard input for digits, operators, and hex digits (A-F)
- **Responsive Design** — Mobile-first layout, works from 320px to desktop
- **Accessible** — ARIA roles/labels, skip link, keyboard navigation, `prefers-reduced-motion` support, focus-visible outlines

## Keyboard Shortcuts

| Key                  | Action                       |
| -------------------- | ---------------------------- |
| `0`-`9`              | Input digit                  |
| `A`-`F`              | Hex digits (programmer mode) |
| `.`                  | Decimal point                |
| `+` `-` `*` `/`      | Operators                    |
| `Enter` or `=`       | Calculate                    |
| `Backspace`          | Delete last digit            |
| `Escape` or `Delete` | Clear all                    |
| `%`                  | Percent                      |

## Tech Stack

- **Vanilla JS** (ES Modules) — no framework dependencies
- **Vite** — dev server and build tool
- **Vitest** — unit testing (200 tests)
- **ESLint v9 + Prettier** — code quality and formatting
- **Husky + lint-staged** — pre-commit hooks
- **GitHub Actions** — CI/CD pipeline (lint, test, build, deploy)
- **GitHub Pages** — production hosting

## Getting Started

### Prerequisites

- Node.js 22 LTS (`nvm use` will read `.nvmrc`)
- npm

### Development

```bash
npm install       # Install dependencies
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview production build
```

### Code Quality

```bash
npm run lint          # Run ESLint
npm run lint:fix      # Fix lint errors
npm run format        # Format with Prettier
npm run format:check  # Check formatting
npm test              # Run tests
npm run test:watch    # Run tests in watch mode
```

## Architecture

```
src/
  engines/       Pure-function reducers (standard, scientific, programmer)
  components/    DOM rendering (display, button-grid, history, mode-switcher)
  state/         Pub/sub store with mode-based routing
  utils/         Math helpers, base conversion, bitwise ops, keyboard, theme
  styles/        CSS with custom properties for theming
```

Each calculator mode is a pure reducer function with no DOM dependencies. The central store routes actions to the active mode's reducer. Components subscribe to state changes and update the DOM.

## License

[MIT](LICENSE)
