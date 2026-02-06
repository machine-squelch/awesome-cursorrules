# Distilled Cursor Rules: Best Practices from the Community

> A synthesis of the most meaningful, universally applicable patterns extracted from 100+ `.cursorrules` files in this repository. Use this as a starting point and adapt to your specific project.

---

## Table of Contents

- [AI Interaction Guidelines](#ai-interaction-guidelines)
- [Key Mindsets](#key-mindsets)
- [Code Style and Structure](#code-style-and-structure)
- [Naming Conventions](#naming-conventions)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Performance Optimization](#performance-optimization)
- [Security](#security)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Git and Version Control](#git-and-version-control)
- [Language-Specific Patterns](#language-specific-patterns)
  - [TypeScript / JavaScript](#typescript--javascript)
  - [Python](#python)
  - [Go](#go)
  - [C++](#c)
  - [R](#r)
- [Framework-Specific Patterns](#framework-specific-patterns)
  - [React / Next.js](#react--nextjs)
  - [FastAPI](#fastapi)
  - [Django](#django)
  - [Flutter](#flutter)
  - [SwiftUI](#swiftui)
  - [Solidity / Smart Contracts](#solidity--smart-contracts)

---

## AI Interaction Guidelines

These patterns appeared consistently across the most effective rules files, governing how the AI should behave:

1. **Be Direct**: Provide actual code and concrete explanations, not high-level summaries. Answer first, explain later if needed.
2. **Verify Information**: Always verify information before presenting it. Do not make assumptions or speculate without clear evidence.
3. **Preserve Existing Code**: Don't remove unrelated code or functionalities. Pay attention to preserving existing structures.
4. **Minimal Changes**: Only modify sections of the code related to the task at hand. Avoid modifying unrelated pieces of code. Accomplish goals with minimal code changes.
5. **No Inventions**: Don't invent changes other than what's explicitly requested.
6. **Show Context**: When outputting code blocks, include a file name comment and a few lines before/after the modification to help identify where to make changes.
7. **Match Existing Style**: Before generating code, analyze the codebase for naming conventions, indentation, paradigms, and patterns. Adapt new code to match.
8. **Single Chunk Edits**: Provide all edits for the same file in a single chunk instead of multiple-step instructions.
9. **Use Chain of Thought**: For complex tasks, outline a pseudocode plan step by step, confirm it, then write the code.
10. **Ask When Unclear**: If a request is unclear or lacks sufficient information, ask clarifying questions before proceeding.

---

## Key Mindsets

The most effective `.cursorrules` files consistently emphasized these principles:

1. **Simplicity**: Write simple, straightforward code. Less code is better; lines of code are debt.
2. **Readability**: Ensure your code is easy to read and understand. Explicit is better than implicit.
3. **Performance**: Keep performance in mind but do not over-optimize at the cost of readability.
4. **Maintainability**: Write code that is easy to maintain and update.
5. **Testability**: Ensure your code is easy to test.
6. **Reusability**: Write reusable components and functions. Prefer iteration and modularization over code duplication.
7. **DRY (Don't Repeat Yourself)**: Focus on writing correct, DRY code, but avoid premature abstraction.
8. **Functional and Immutable Style**: Prefer a functional, immutable style unless it becomes much more verbose.

---

## Code Style and Structure

### General Principles

- Write concise, technical code with accurate examples
- Use functional and declarative programming patterns; avoid unnecessary classes
- Prefer iteration and modularization over code duplication
- Structure files logically: exports, subcomponents, helpers, static content, types
- Use early returns to avoid nested conditions and improve readability
- Favor named exports for components and utility functions
- Use the Receive an Object, Return an Object (RORO) pattern for functions with many parameters
- Avoid magic numbers; define constants with descriptive names
- Consider edge cases in all implementations
- Use assertions wherever possible to validate assumptions

### File Organization

- Keep files focused on a single responsibility
- Group related functionality together
- Separate interface/API definitions from implementation
- Place tests alongside or in a parallel directory structure to the code they test

---

## Naming Conventions

These naming patterns appeared across virtually all high-quality rules files:

| Element | Convention | Example |
|---------|-----------|---------|
| Variables | camelCase (JS/TS) or snake_case (Python/Go) | `isLoading`, `has_permission` |
| Functions | camelCase (JS/TS) or snake_case (Python/Go) | `handleClick`, `calculate_total` |
| Classes | PascalCase | `UserService`, `LinearModel` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| Directories | lowercase with dashes | `components/auth-wizard` |
| Booleans | Prefix with auxiliary verbs | `isActive`, `hasError`, `canDelete` |
| Event handlers | Prefix with "handle" | `handleSubmit`, `handleKeyDown` |

### Additional Naming Guidance

- Use descriptive, explicit variable names over short, ambiguous ones
- Start function names with a verb (`getData`, `validateInput`, `renderChart`)
- Use complete words instead of abbreviations (except standard ones: `API`, `URL`, `req`, `res`, `ctx`, `err`)
- Avoid names that shadow built-in language functions

---

## Error Handling

Error handling was one of the most consistently emphasized topics:

1. **Handle errors and edge cases at the beginning of functions** using guard clauses
2. **Use early returns** for error conditions to avoid deeply nested if statements
3. **Place the happy path last** in the function for improved readability
4. **Avoid unnecessary else statements**; use the if-return pattern instead
5. **Implement proper error logging** and user-friendly error messages
6. **Use custom error types** or error factories for consistent error handling
7. **Model expected errors as return values**; reserve exceptions for unexpected errors
8. **Never use bare `except`/`catch`** clauses; always catch specific error types
9. **Implement error boundaries** at application layer boundaries (UI, API, etc.)
10. **Provide context when re-throwing errors** to aid debugging

---

## Testing

### Principles

- Follow the **Arrange-Act-Assert** (or **Given-When-Then**) convention
- Write tests that focus on **critical business logic** and **utility functions**
- Test various scenarios: **valid inputs, invalid inputs, edge cases, null/undefined values**
- Use **descriptive test names** that indicate expected behavior
- Group related tests in `describe`/`context` blocks
- Mock dependencies before imports; use test doubles for external services
- Aim for high coverage on critical paths; don't write tests just to hit a coverage number
- Keep tests focused: 3-5 targeted tests per function/unit

### Best Practices

- Match your team's existing testing conventions and patterns
- Use the appropriate testing framework for your ecosystem (`pytest`, `Jest`, `Vitest`, `Foundry`, `testthat`)
- Implement unit, integration, and end-to-end tests as appropriate
- Use reproducible seeds for randomized tests
- Test edge cases: empty inputs, boundary values, concurrent access

---

## Performance Optimization

### Universal Patterns

1. **Minimize blocking I/O**: Use asynchronous operations for database calls, API requests, and file operations
2. **Implement caching**: Use appropriate caching strategies (in-memory, Redis, HTTP cache headers) for frequently accessed data
3. **Lazy loading**: Load resources on demand rather than upfront; use dynamic imports for non-critical code
4. **Optimize images**: Use modern formats (WebP), include size data, implement lazy loading
5. **Profile before optimizing**: Use profiling tools to identify actual bottlenecks before optimizing
6. **Minimize client-side JavaScript**: Favor server-side rendering where possible
7. **Use efficient data structures**: Choose the right data structure for the access patterns
8. **Optimize database queries**: Use indexes, avoid N+1 queries, use batch operations
9. **Memory management**: Release unused resources, avoid memory leaks, use object pooling where appropriate
10. **Web Vitals**: Prioritize LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift), and FID (First Input Delay)

---

## Security

Security patterns that appeared across multiple rules files:

1. **Input validation**: Validate all user input on the server side; use schema validation (Zod, Pydantic, etc.)
2. **Authentication and authorization**: Implement proper auth at every API boundary
3. **Secrets management**: Never hardcode secrets; use environment variables or secret managers
4. **CSRF/XSS prevention**: Follow framework-specific security best practices
5. **SQL injection prevention**: Use parameterized queries or ORMs
6. **Principle of least privilege**: Grant minimal permissions necessary
7. **Dependency security**: Regularly audit and update dependencies
8. **Sensitive operations**: Implement rate limiting, timelocks, and audit logging for sensitive actions

---

## Documentation

### Code Documentation

- Add typing/type annotations to all functions and methods (including return types)
- Write descriptive docstrings for all public functions and classes
- Follow language-specific docstring conventions (JSDoc, Google-style, NumPy/SciPy, Doxygen, roxygen2)
- Comment the "why," not the "what" -- code should be self-explanatory
- Keep existing comments when modifying code
- Use TODO comments to flag known issues or suboptimal code

### Project Documentation

- Maintain a clear README with project goals, setup instructions, and usage
- Document architectural decisions and project structure
- Keep documentation close to the code it describes
- Update documentation when code changes

---

## Project Structure

### Universal Principles

Every high-quality rules file emphasized thoughtful project organization:

- **Modular architecture**: Organize code into logical, well-separated modules
- **Separation of concerns**: Keep business logic, data access, and presentation separate
- **Clear directory structure**: Use consistent, descriptive directory names
- **Configuration management**: Use environment variables for configuration; keep config separate from code
- **Dependency management**: Use your ecosystem's package manager; pin dependency versions

### Common Directory Patterns

```
project/
  src/           # Source code
    models/      # Data models / entities
    services/    # Business logic
    controllers/ # Request handlers / views
    utils/       # Shared utilities and helpers
    types/       # Type definitions
  tests/         # Test files (mirroring src/ structure)
  docs/          # Documentation
  config/        # Configuration files
```

---

## Git and Version Control

### Conventional Commits

Use the Conventional Commits specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

### Best Practices

- Write clear, descriptive commit messages
- Make small, focused commits (one logical change per commit)
- Use feature branches for development
- Version control all project files including configuration
- Use `.gitignore` to exclude build artifacts, dependencies, and secrets

---

## Language-Specific Patterns

### TypeScript / JavaScript

**From 30+ rules files across the TS/JS ecosystem:**

- Use TypeScript for all code; prefer `interfaces` over `types`; avoid `enums`, use `const` maps
- Use `function` keyword for pure functions; use arrow functions for callbacks and closures
- File structure: exported component, subcomponents, helpers, static content, types
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements
- Use descriptive variable names with auxiliary verbs (`isLoading`, `hasError`)
- Use lowercase with dashes for directories (`components/auth-wizard`)
- Favor named exports for components
- Implement proper type safety and inference; use the `satisfies` operator for type validation
- Enable strict mode in TypeScript for better type safety

### Python

**From 10+ rules files across the Python ecosystem:**

- Use type hints for all function signatures; include explicit return types
- Follow PEP 8 for code style; use Ruff (or Black + isort + flake8) for formatting
- Use `pytest` for testing with full type annotations and docstrings
- Follow PEP 257 docstring conventions (Google-style or NumPy-style)
- Use `async`/`await` for I/O-bound operations
- Prefer Pydantic models over raw dictionaries for data validation
- Use virtual environments and proper dependency management (`uv`, `poetry`, `renv`)
- Favor composition over inheritance; prefer functions over classes when appropriate
- Use `logging` module for proper logging; avoid `print()` in production code
- Use Python 3.10+ features (`match` statements, structural pattern matching, etc.)

### Go

**From multiple Go-focused rules files:**

- Follow standard Go project layout and conventions
- Use interfaces for abstraction and dependency injection
- Handle errors explicitly; don't ignore error returns
- Use goroutines and channels for concurrent operations
- Prefer composition over inheritance
- Use context for cancellation and timeouts
- Write table-driven tests
- Use standard library where possible before reaching for third-party packages

### C++

**From C++ guidelines rules file:**

- Use PascalCase for classes, camelCase for functions, ALL_CAPS for constants
- Write short functions with a single purpose (< 20 instructions)
- Prefer smart pointers over raw pointers; use RAII for resource management
- Follow SOLID principles; prefer composition over inheritance
- Use `const` and `constexpr` aggressively; prefer immutability
- Use `std::optional` for possibly null values
- Use standard library algorithms over manual loops
- Follow the Rule of Five (or Rule of Zero) for resource management
- Use namespaces to organize code logically

### R

**From R best practices rules file:**

- Use `snake_case` for variables and functions; `UpperCamelCase` for classes
- Follow the tidyverse style guide; keep lines <= 80 characters
- Use `<-` for variable assignment (except in R6 classes)
- Prefer vectorized operations over loops
- Use `renv` for dependency management and reproducibility
- Write unit tests with `testthat`; use reproducible seeds (`set.seed()`)
- Use RMarkdown or Quarto for reproducible reports
- Always use `package::function()` syntax when referencing external packages
- Handle missing values explicitly (`na.rm = TRUE`, `is.na()`)

---

## Framework-Specific Patterns

### React / Next.js

**Distilled from 20+ React/Next.js rules files:**

- Favor React Server Components (RSC) where possible
- Minimize `'use client'`, `useEffect`, and `setState`; favor server-side patterns
- Use `Suspense` with fallback for async operations
- Implement proper error boundaries using `error.tsx` files
- Use `function` keyword (not `const`) for component declarations
- Implement responsive design with Tailwind CSS using a mobile-first approach
- Optimize images: WebP format, explicit size data, lazy loading
- Use Zod for form validation; use `react-hook-form` for form management
- Place static content and interfaces at end of file
- Use dynamic loading (`next/dynamic`) for non-critical components
- Prioritize Web Vitals (LCP, CLS, FID)
- Keep `'use client'` only for Web API access in small, leaf components

### FastAPI

**Distilled from multiple FastAPI rules files:**

- Use Pydantic v2 models for input validation and response schemas
- Use `def` for synchronous operations and `async def` for asynchronous ones
- Prefer lifespan context managers over `@app.on_event()` for startup/shutdown
- Use middleware for logging, error monitoring, and performance optimization
- Use `HTTPException` for expected errors with appropriate status codes
- Implement caching for frequently accessed data (Redis or in-memory)
- Use proper dependency injection with `Depends()`
- Define clear RESTful API routes using `APIRouter`
- File structure: exported router, sub-routes, utilities, types (models, schemas)

### Django

**Distilled from Django rules files:**

- Follow the MVT (Model-View-Template) pattern strictly
- Use class-based views for complex views; function-based views for simpler logic
- Leverage Django's ORM; avoid raw SQL unless necessary for performance
- Use `select_related` and `prefetch_related` to optimize query performance
- Keep business logic in models and forms; keep views light
- Apply Django's security best practices (CSRF, SQL injection, XSS prevention)
- Use Django's caching framework with Redis or Memcached
- Use Celery for background tasks; Redis for task queues
- Follow "Convention Over Configuration" to reduce boilerplate

### Flutter

**Distilled from Flutter rules files:**

- Implement clean architecture with BLoC pattern for state management
- Use proper dependency injection (GetIt)
- Keep widgets small and focused; use `const` constructors when possible
- Implement proper null safety practices
- Use GoRouter for navigation
- Follow Material Design 3 guidelines
- Use proper image caching and lazy loading for list views
- Write unit tests for business logic, widget tests for UI, integration tests for features
- Organize by feature: `data/`, `domain/`, `presentation/` within each feature directory

### SwiftUI

**Distilled from SwiftUI rules files:**

- Use built-in SwiftUI components (`List`, `NavigationView`, `TabView`, SF Symbols)
- Master layout tools: `VStack`, `HStack`, `ZStack`, `Spacer`, `GeometryReader`
- Organize: `App/`, `Views/`, `Models/`, `ViewModels/`, `Services/`, `Utilities/`
- Design for interaction: gestures, haptic feedback, clear navigation
- Use `.animation()` modifier for smooth transitions
- Follow platform-specific design guidelines

### Solidity / Smart Contracts

**Distilled from Solidity rules files:**

- Use explicit function visibility modifiers; implement comprehensive NatSpec comments
- Follow the Checks-Effects-Interactions pattern to prevent reentrancy
- Use OpenZeppelin contracts as the primary dependency source
- Use custom errors instead of revert strings for gas efficiency
- Implement circuit breakers (Pausable) for emergency stops
- Use pull over push payment patterns
- Implement comprehensive testing: unit, integration, fuzz, and invariant tests
- Use `immutable` for values set at construction time; optimize storage layout
- Conduct gas optimization considering both deployment and runtime costs
- Use static analysis tools (Slither, Mythril) in the development workflow
- Document assumptions made in contract design
- Implement timelocks and multisig controls for sensitive operations

---

## Summary

The most impactful rules across all files in this repository can be condensed to:

1. **Match the existing style** of the codebase you're working in
2. **Write concise, typed, well-tested code** with proper error handling
3. **Use early returns** and guard clauses over nested conditions
4. **Prefer functional, immutable patterns** over mutable state
5. **Organize code modularly** with clear separation of concerns
6. **Handle errors explicitly** at every boundary
7. **Test the critical path** with meaningful, focused tests
8. **Document the "why"** not the "what"
9. **Optimize for readability** first, performance second (but measure)
10. **Secure by default**: validate inputs, manage secrets, apply least privilege
