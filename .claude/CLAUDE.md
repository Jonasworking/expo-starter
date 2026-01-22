# Guidelines

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `pnpm dlx ultracite fix`
- **Check for issues**: `pnpm dlx ultracite check`
- **Diagnose setup**: `pnpm dlx ultracite doctor`

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

Icons are pre-generated as React Native components using `@monicon/core`. Each icon is wrapped with `UniwindSvgXml`, enabling Tailwind className styling directly on the icon.

_Adding a new icon:_

1. Browse icons at [icones.js.org](https://icones.js.org/) - copy the `collection:name` format (e.g., `solar:bolt-bold`)
2. Add the icon to the `icons` array in [monicon.config.ts](apps/native/monicon.config.ts):

   ```ts
   icons: ["solar:bolt-bold", "solar:settings-linear", "lucide:check"],
   ```

3. Start/restart Metro (`pnpm dev` or `pnpm ios`/`pnpm android`) - icons are generated automatically
4. Icons appear at `apps/native/components/icons/<collection>/<icon-name>.tsx`

_Usage:_

```tsx
import { BoltBoldIcon } from "@/components/icons/solar/bolt-bold";

// With Tailwind className (UniwindSvgXml enables this)
<BoltBoldIcon className="size-6 text-primary" />
```

- Icon components are named in PascalCase with `Icon` suffix (e.g., `solar:bolt-bold` → `BoltBoldIcon`)
- Icons starting with a digit get an `N` prefix (e.g., `solar:2-bold` → `N2BoldIcon`)
- Use `className` for sizing and colors instead of props when possible

**Fonts (expo-font + Uniwind):**

- Use Google Fonts when available: `@expo-google-fonts/nunito`, etc.
- Load fonts with `useFonts` hook in root layout, render null/splash until loaded
- Configure in `global.css` under `@theme` (names must exactly match loaded font names)

**CRITICAL - Fonts work differently in React Native vs Web:**

On **web Tailwind**, fonts are 2-dimensional:

- `font-sans` sets the font family
- `font-bold` sets the font weight
- You combine them: `font-sans font-bold`

On **React Native with Uniwind**, fonts are 1-dimensional:

- Each font definition includes BOTH family AND weight inherently
- `font-bold` maps to a complete font file like `"Nunito_700Bold"`
- There is no separate font-family utility

```css
@theme {
  /* PRIMARY FONT FAMILY: maps to standard weight utilities */
  /* Web equivalent: font-sans + font-normal/bold/etc */
  --font-normal: "Nunito_400Regular";
  --font-medium: "Nunito_500Medium";
  --font-semibold: "Nunito_600SemiBold";
  --font-bold: "Nunito_700Bold";
  --font-extrabold: "Nunito_800ExtraBold";
  --font-black: "Nunito_900Black";

  /* SECONDARY FONT FAMILIES: need weight variants if multiple weights used */
  /* Web equivalent: font-heading + font-bold → font-heading-bold */
  --font-heading: "Recursive_700Bold";
  /* If heading needs multiple weights, add: */
  /* --font-heading-normal: "Recursive_400Regular"; */
  /* --font-heading-bold: "Recursive_700Bold"; */

  /* Monospace typically only needs one weight */
  --font-mono: "JetBrainsMono_400Regular";
}
```

**When porting web Tailwind designs:**

1. **Primary font family** (e.g., `font-sans`, `font-body`): Map to standard utilities (`font-normal`, `font-bold`, etc.)
   - Web: `font-sans font-semibold` → Uniwind: `font-semibold`

2. **Secondary font families** (e.g., `font-heading`, `font-display`): Create weight-specific variants
   - Web: `font-heading font-bold` → Uniwind: `font-heading-bold`
   - Web: `font-heading font-normal` → Uniwind: `font-heading-normal`
   - If only one weight is used, a single definition suffices: `font-heading`

3. **Monospace/special fonts**: Usually only need one weight definition

**Theming & Colors (Uniwind + Tailwind v4):**

This project uses **Uniwind** (Tailwind CSS for React Native) with **Tailwind v4** syntax. Theme colors are defined in [global.css](apps/native/global.css).

**IMPORTANT - Uniwind differs from standard Tailwind v4 web:**

- **Always use `@theme {`** - NEVER use `@theme inline {`. Uniwind requires the non-inline syntax.
- **Colors go DIRECTLY in `@layer theme` variants** with `--color-*` prefix (NOT in `@theme` with var() indirection)
- Fonts are 1-dimensional (see Fonts section above)
- When porting Tailwind v4 web references, carefully adapt for these differences

**CRITICAL - Color Definition Pattern:**

Do NOT use var() indirection for colors in `@theme`. Instead, define colors directly with `--color-*` prefix inside `@layer theme` variants:

```css
/* ❌ WRONG - causes resolution issues in React Native */
@theme {
  --color-primary: var(--primary);
}
@layer theme {
  :root {
    @variant light {
      --primary: #15aeed;
    }
  }
}

/* ✅ CORRECT - direct color definitions */
@theme {
  /* Only fonts and radius here - NO colors */
}
@layer theme {
  :root {
    @variant light {
      --color-primary: #15aeed;  /* Direct --color-* definition */
    }
  }
}
```

_Global CSS Structure:_

```css
@import "tailwindcss";
@import "uniwind";

/* IMPORTANT: Use @theme, NOT @theme inline */
@theme {

  /* Fonts (each is a complete font file with family + weight) */
  --font-normal: "Nunito_400Regular";
  --font-bold: "Nunito_700Bold";
  --font-mono: "JetBrainsMono_400Regular";

  /* Radius tokens (can use var() for these) */
  --radius: 1rem;
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
}

@layer theme {
  :root {
    @variant light {
      /* Colors defined DIRECTLY with --color-* prefix */
      --color-background: #ffffff;
      --color-foreground: #09090b;
      --color-primary: #15aeed;
      --color-card: #f4f4f5;
      /* ... other colors */
    }
    @variant dark {
      --color-background: #09090b;
      --color-foreground: #fafafa;
      --color-primary: #15aeed;
      --color-card: #18181b;
      /* ... other colors */
    }
  }
}
```

_Accessing theme colors in JS:_

```tsx
import { useThemeColor } from "@/lib/theme/use-theme-color";

// Single color
const primary = useThemeColor("primary");

// Multiple colors (more efficient)
const [primary, background] = useThemeColor(["primary", "background"]);
```

Available colors: `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `card`, `popover`, `border`, `input`, `ring`, `chart-1` through `chart-5` (and their `-foreground` variants)

**UI Components (React Native Reusables pattern):**

UI primitives are in `apps/native/components/ui/`. Built with `class-variance-authority` for variants and `@rn-primitives` for accessibility.

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

<Button variant="outline" size="sm">Click me</Button>
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Text>Content here</Text>
  </CardContent>
</Card>
```

**IMPORTANT:** Always use `Text` from `@/components/ui/text`, never from `react-native` directly. The custom Text component:

- Supports typography variants: `h1`, `h2`, `h3`, `h4`, `p`, `blockquote`, `code`, `lead`, `large`, `small`, `muted`
- Inherits styles from parent components via `TextClassContext` (e.g., text inside `Button` automatically gets button text styles)
- Includes proper accessibility attributes (role, aria-level for headings)
- Supports `asChild` prop for composition with other components

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

Most formatting and common issues are automatically fixed by Biome. Run `pnpm dlx ultracite fix` before committing to ensure compliance.

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
