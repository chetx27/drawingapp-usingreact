# Contributing to Advanced React Drawing Application

First off, thank you for considering contributing to this project! It's people like you that make this drawing application such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0 or yarn >= 1.22.0
- Git
- Code editor (VS Code recommended)

### Setting Up Development Environment

1. **Fork the repository**
   - Click the 'Fork' button in the top right corner of the repository page

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/drawingapp-usingreact.git
   cd drawingapp-usingreact
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/chetx27/drawingapp-usingreact.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Process

### Project Structure

```
src/
├── components/      # React components
├── hooks/          # Custom hooks
├── utils/          # Utility functions
├── types/          # TypeScript definitions
└── constants/      # App constants
```

### Running the Application

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage
```

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid using `any` type
- Use meaningful variable and function names

### React Best Practices

- Use functional components with hooks
- Implement proper prop types
- Use `useCallback` and `useMemo` for optimization
- Keep components small and focused
- Extract reusable logic into custom hooks

### Code Style

- Follow ESLint and Prettier configurations
- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons at the end of statements
- Maximum line length: 100 characters

### Naming Conventions

- Components: PascalCase (e.g., `DrawingCanvas.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useCanvas.ts`)
- Utilities: camelCase (e.g., `drawingHelpers.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_HISTORY_STEPS`)
- Interfaces: PascalCase with descriptive names (e.g., `DrawingState`)

### Documentation

- Add JSDoc comments for all public functions
- Document complex algorithms and logic
- Keep comments concise and meaningful
- Update README when adding new features

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(canvas): add undo/redo functionality

fix(toolbar): correct color picker alignment on mobile

docs(readme): update installation instructions

test(canvas): add unit tests for flood fill algorithm
```

## Pull Request Process

### Before Submitting

1. **Update your fork**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**
   ```bash
   npm test
   npm run lint
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

### Submitting PR

1. **Push your changes**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your feature branch
   - Fill in the PR template

3. **PR Title Format**
   ```
   feat: Add shape drawing tools
   fix: Resolve canvas rendering issue
   ```

4. **PR Description Should Include**
   - What changes were made
   - Why these changes are necessary
   - Screenshots (for UI changes)
   - Related issues (if any)
   - Testing performed

### Review Process

- Maintainers will review your PR within 48 hours
- Address any requested changes
- Once approved, your PR will be merged

## Testing Guidelines

### Unit Tests

- Write tests for all new functions
- Test edge cases and error conditions
- Aim for 80%+ code coverage

### Test Structure

```typescript
describe('ComponentName', () => {
  it('should perform expected action', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Running Specific Tests

```bash
npm test -- Canvas.test.tsx
npm test -- --coverage
```

## Feature Requests

We welcome feature requests! Please:

1. Check existing issues first
2. Open a new issue with the "enhancement" label
3. Describe the feature clearly
4. Explain why it would be valuable
5. Provide examples if possible

## Bug Reports

When reporting bugs, please include:

1. Clear title and description
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshots (if applicable)
5. Browser/OS information
6. Error messages or logs

## Questions?

Feel free to:

- Open a discussion on GitHub Discussions
- Comment on related issues
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🎨**