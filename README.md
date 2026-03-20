# Calculator

A professional all-in-one calculator with **Standard**, **Scientific**, and **Programmer** modes.

Built with vanilla JavaScript, Vite, and modern web standards.

> Work in progress

## Tech Stack

- **Vanilla JS** (ES Modules) — no framework dependencies
- **Vite** — dev server and build tool
- **Vitest** — unit testing
- **ESLint + Prettier** — code quality and formatting
- **GitHub Actions** — CI/CD pipeline
- **GitHub Pages** — deployment

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

## Features (Planned)

- [ ] Standard calculator (+, -, x, /, %, +/-)
- [ ] Scientific mode (trig, log, expressions, parentheses)
- [ ] Programmer mode (hex/dec/oct/bin, bitwise operations)
- [ ] Keyboard support
- [ ] Calculation history
- [ ] Dark/light theme
- [ ] Responsive design
- [ ] Accessible (ARIA, keyboard navigation)

## License

[MIT](LICENSE)
