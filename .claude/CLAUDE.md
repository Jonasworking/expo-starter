# Guidelines

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bun x ultracite fix`
- **Check for issues**: `bun x ultracite check`
- **Diagnose setup**: `bun x ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**

- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**

- Use ref as a prop instead of `React.forwardRef`

**Monicon (Icons):**

- Usage: `<Monicon name="collection:icon-name" size={24} color="#000" />` from `@monicon/native`
- Browse icons at [icones.js.org](https://icones.js.org/) - copy the `collection:name` format
- When using a new collection, add it to `collections` array in `apps/native/metro.config.js` and restart Metro
- Current collections: `solar`

**Fonts (expo-font):**

- Use Google Fonts when available: `@expo-google-fonts/inter`, etc.
- HeroUI Native requires 3 weights: Regular (400), Medium (500), SemiBold (600)
- Load fonts with `useFonts` hook, render null/splash until loaded
- Configure in `global.css` under `@theme` (names must exactly match loaded font names):

  ```css
  @theme {
    --font-normal: "Inter_400Regular";
    --font-medium: "Inter_500Medium";
    --font-semibold: "Inter_600SemiBold";
  }
  ```

- React Native has no dynamic font weights - each weight needs its own font file

**HeroUI Native (Theming & Colors):**

HeroUI Native uses **Tailwind CSS v4** with **Uniwind** and the **OKLCH color space** for superior color transitions. The theming system differs significantly from shadcn/ui.

_Global CSS Setup:_

```css
@import "tailwindcss";
@import "uniwind";
@import "heroui-native/styles";

@source "./node_modules/heroui-native/lib";

/* Font configuration Example */
@theme {
  --font-normal: 'Inter_400Regular';
  --font-medium: 'Inter_500Medium';
  --font-semibold: 'Inter_600SemiBold';

  /* Base radius */
  --radius: 0.5rem;
}
}

/* Color customization (optional) */
@layer theme {
  @variant light {
    --accent: #818cf8;
    --accent-foreground: #ffffff;
    ...
  }
  @variant dark {
    --accent: #818cf8;
    --accent-foreground: #ffffff;
    ...
  }
}
```

_Color Token Naming Convention:_

- Tokens without suffix = backgrounds (e.g., `--accent`)
- Tokens with `-foreground` = text on that background (e.g., `--accent-foreground`)

_HeroUI Native Token Reference:_

| Category    | Tokens                                                                              |
| ----------- | ----------------------------------------------------------------------------------- |
| Base        | `--background`, `--foreground`, `--muted`                                           |
| Brand       | `--accent`, `--accent-foreground`, `--accent-soft`, `--accent-soft-foreground`      |
| Surface     | `--surface`, `--surface-foreground`, `--overlay`, `--overlay-foreground`            |
| Status      | `--success`, `--warning`, `--danger` (each with `-foreground`)                      |
| Form Fields | `--field-background`, `--field-foreground`, `--field-placeholder`, `--field-border` |
| UI Elements | `--default`, `--default-foreground`, `--border`, `--divider`, `--focus`, `--link`   |
| Constants   | `--white`, `--black`, `--snow`, `--eclipse`                                         |

_shadcn/ui → HeroUI Native Token Translation:_

When receiving shadcn/ui tokens, translate them to HeroUI equivalents:

| shadcn/ui Token            | HeroUI Native Token       | Notes                                 |
| -------------------------- | ------------------------- | ------------------------------------- |
| `--primary`                | `--accent`                | Main brand color                      |
| `--primary-foreground`     | `--accent-foreground`     |                                       |
| `--secondary`              | `--default`               | Or `--accent-soft` for softer variant |
| `--secondary-foreground`   | `--default-foreground`    |                                       |
| `--destructive`            | `--danger`                | Error/destructive actions             |
| `--destructive-foreground` | `--danger-foreground`     |                                       |
| `--card`                   | `--surface`               | Card backgrounds                      |
| `--card-foreground`        | `--surface-foreground`    |                                       |
| `--popover`                | `--overlay`               | Modal/popover backgrounds             |
| `--popover-foreground`     | `--overlay-foreground`    |                                       |
| `--muted`                  | `--default`               | Muted backgrounds                     |
| `--muted-foreground`       | `--muted`                 | HeroUI uses `--muted` for text        |
| `--input`                  | `--field-background`      | Form input backgrounds                |
| `--ring`                   | `--focus`                 | Focus ring color                      |
| `--border`                 | `--border` or `--divider` | Use `--divider` for visible lines     |

_Tailwind Class Translation:_

When converting shadcn/ui code, replace class names:

| shadcn/ui Class             | HeroUI Native Class       |
| --------------------------- | ------------------------- |
| `bg-primary`                | `bg-accent`               |
| `text-primary`              | `text-accent`             |
| `bg-primary-foreground`     | `bg-accent-foreground`    |
| `text-primary-foreground`   | `text-accent-foreground`  |
| `bg-secondary`              | `bg-default`              |
| `text-secondary`            | `text-default`            |
| `bg-secondary-foreground`   | `bg-default-foreground`   |
| `text-secondary-foreground` | `text-default-foreground` |
| `bg-destructive`            | `bg-danger`               |
| `text-destructive`          | `text-danger`             |
| `bg-card`                   | `bg-surface`              |
| `text-card-foreground`      | `text-surface-foreground` |
| `bg-popover`                | `bg-overlay`              |
| `text-popover-foreground`   | `text-overlay-foreground` |
| `text-muted-foreground`     | `text-muted`              |
| `ring-ring`                 | `ring-focus`              |
| `border-input`              | `border-field-border`     |

_Adding Custom Colors:_

```css
@layer theme {
  @variant light {
    --info: oklch(0.6 0.15 210);
  }
  @variant dark {
    --info: oklch(0.7 0.12 210);
  }
}

@theme inline {
  --color-info: var(--info);
}
```

_Programmatic Access:_

```tsx
import { useThemeColor } from "heroui-native";
const { accent, success } = useThemeColor(["accent", "success"]);
```

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `bun x ultracite fix` before committing to ensure compliance.

## Colocation & Naming

**Philosophy**: Structure code so deleting a folder cleanly removes a feature. If you must hunt through scattered files, the structure is wrong.

**Folder structure**:

- Each feature folder is self-contained; can have local `components/`, `lib/`, `hooks/` when complex enough
- Main orchestration file named after folder (`feature/feature.ts` not `feature/index.ts`)
- Sub-features nest inside parent (`feature/sub-feature/sub-feature.ts`)
- Shared code hoists to lowest common ancestor (if A and B need it, put in their parent)

**File-level colocation**:

- Types, constants, helpers live in the file that **owns** the concept (source of truth)
- Even if used by multiple files, keep it in the owner; others import from there
- Separate shared file only when there's no clear owner (truly generic utilities)
- Ask: "which file is the source of truth for this?" not "how many files use it?"
- Example: `Button` exports `DEFAULT_VARIANT`; consumers import it from `Button`, not from a `constants.ts`

**Naming**:

- No barrel/index files; import directly from source
- Short contextual names within folders (folder provides context): `match.ts` not `match-cached-result.ts`
- Folder names describe the feature, file names describe the specific concern
