# Contributing to Weapon Reload

Thank you for your interest in contributing to Weapon Reload module! This document provides guidelines for contributing to the project.

## Table of Contents

- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Module-Specific Guidelines](#module-specific-guidelines)

## Project Structure

Code for the Weapon Reload module is organized in the following way:

- **`configs/`** - Configuration files
- **`docs/`** - Project documentation
- **`dist/`** - Compiled module code and generated types
- **`languages/`** - JSON files for supported languages
- **`packs/`** - Compendium packs and data files
- **`src/module`** - Module source code
- **`src/utils`** - Utility code not specific to module functionality
- **`templates`** - Handlebars templates
- **`tests`** - Shared testing code

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Foundry VTT v13+ for testing
- Git
- TypeScript knowledge recommended

### Development Setup

1. **Clone**

    ```bash
    git clone https://github.com/andyp22/fvtt-weapon-reload.git
    cd fvtt-weapon-reload
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Build for Development**

    ```bash
    npm run build:dev
    ```

4. **Build for Release**

    ```bash
    npm run build:release
    ```

5. **Run Tests**
    ```bash
    npm test
    ```

## Making Changes

### Branch Naming

Please use the [Conventional Branch standard](https://conventional-branch.github.io/) when creating branches:

```
<type>/<description>
```

#### Examples

- `feature/` (or `feat/`): For new features (e.g., `feature/add-login-page`, `feat/add-login-page`)
- `bugfix/` (or `fix/`): For bug fixes (e.g., `bugfix/fix-header-bug`, `fix/header-bug`)
- `hotfix/`: For urgent fixes (e.g., `hotfix/security-patch`)
- `release/`: For branches preparing a release (e.g., `release/v1.2.0`)
- `chore/`: For non-code tasks like dependency, docs updates (e.g., `chore/update-dependencies`)

### Commit Messages

Please follow [Conventional commits specification](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages:

```
<type>: <description>

feat: allow provided config object to extend other configs
fix: prevent racing of requests
docs: correct spelling of CHANGELOG
chore: drop support for Node 6
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Submitting Changes

### Pull Request Process

1. **Create Feature Branch**

    ```bash
    git checkout -b feat/your-feature-name
    ```

2. **Make Your Changes**
    - Follow coding standards
    - Add/update tests
    - Update documentation

3. **Test Your Changes**

    ```bash
    npm validate  # Runs tests, builds, and formats
    ```

4. **Commit and Push**

    ```bash
    git add .
    git commit -m "feat: description"
    git push origin feature/your-feature-name
    ```

5. **Create Pull Request**
    - Use the PR template
    - Fill out all applicable sections
    - Link related issues

### Pull Request Requirements

- [ ] TypeScript compiles cleanly (`npm run lint:scan`)
- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build:release`)
- [ ] Code follows project standards
- [ ] Documentation updated if needed
- [ ] Self-review completed

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper typing for Foundry VTT APIs
- Avoid `any` types - use proper Foundry type definitions

### Code Style

- Use prettier for formatting
- Prefer `const` over `let` where possible
- Use descriptive variable and function names
- Add JSDoc comments for public APIs

### Naming Conventions

- **Classes**: PascalCase (`NextRoundFeature`)
- **Functions/Variables**: camelCase (`nextRound`)
- **Constants**: UPPER_SNAKE_CASE (`MODULE_ID`)
- **Files**: match class name (`NextRoundFeature.ts`) or kebab-case (`shared-functions.ts`)
- **Tests**: match file name with `.test.` (`NextRoundFeature.test.ts` or `shared-functions.test.ts`)

## Testing

### Unit Tests

- Write tests for new functionality
- Test edge cases and error conditions
- Use the existing mocks in `tests/mocks/module-mocks.ts`
- Aim for >80% coverage on core business logic

### Running Tests

```bash
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode
```

## Documentation

### Code Documentation

- Add JSDoc comments for all public APIs
- Document complex logic with inline comments
- Include examples in API documentation

### User Documentation

- Update user guides for new features
- Include screenshots for UI changes
- Update migration guides if needed

### Documentation Files

- `README.md` - Overview and quick start
- `docs/USER-GUIDE.md` - Comprehensive user manual

## Issue Guidelines

### Choosing the Right Issue Template

**Bug Report** - Use for unexpected behavior:

- Steps to reproduce
- Expected vs actual behavior
- Console errors and Foundry/module versions
- Weapon or ammunition configuration JSON, if applicable

**Feature Request** - Use for new functionality:

- Include problem statement and proposed solution

**Module Integration Issue** - Use for cross-module problems:

- Compatibility with external modules
- System integration problems
- Cross-module dependency issues

## Release Process

Releases follow semantic versioning:

- **Major** (v1.0.0): Breaking changes
- **Minor** (v0.1.0): New features, backward compatible
- **Patch** (v0.1.1): Bug fixes, backward compatible

## Getting Help

- **Issues**: Check existing issues first, use appropriate template
- **Discussions**: Use GitHub Discussions for questions and design discussions
- **Documentation**: Check the `docs` directory for questions regarding module usage

## License

By contributing, you agree that your contributions will be licensed under the same GNU License that covers this project.

---

Thank you for contributing to the Weapon Reload module! Your help makes this module better for the entire Foundry VTT community.
