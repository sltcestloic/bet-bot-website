# Agent Rules

Always write tests for feature and behavioral code changes

This project is public and open source. Never commit or publish secrets, credentials, API keys, tokens, private URLs, or populated environment files. Use ignored local environment files and provide only sanitized placeholders in files such as `.env.example`.

When asked to commit changes, use a concise commit message written entirely in lowercase.

Never revert, overwrite, or discard code modified by the user. Work with existing changes; if reverting them is genuinely necessary, explain why and ask for explicit permission first.

Use English vocabulary for all technical identifiers, including routes, file and directory names, variables, functions, types, and configuration keys.

Use absolute TypeScript imports rooted at `src` through the `@/` alias. Do not use relative TypeScript imports.

Use the repository ESLint and Prettier configuration as the source of truth for readable code. Format at 140 columns with the configured import and Tailwind class ordering. Keep complexity at 12 or below, nesting at 4 levels or below, functions at 100 lines or below, files at 500 lines or below, parameters at 5 or below, and nested callbacks at 3 levels or below. Do not use nested ternaries or explicit `any`.

Do not disable lint rules broadly. Every local suppression must be narrowly scoped and include a concrete justification. Run `npm run check` before considering code changes complete; warnings are treated as failures.
