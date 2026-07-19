# Agent Rules

Use the [Bulletproof React](https://github.com/alan2207/bulletproof-react) architecture for all frontend code.

- Organize domain code by feature; keep feature-specific components, hooks, types, API code, and utilities together.
- Keep shared code in top-level shared modules and promote code there only when multiple features use it.
- Enforce one-way dependencies: shared modules -> features -> application layer.
- Never import between features; compose features in the application layer instead.
- Use direct file imports, avoid feature barrel files, and create only the directories and abstractions currently needed.

Use test-driven development for feature and behavioral code changes:

- Write or update tests for the intended behavior before writing the implementation.
- Confirm the new test fails for the expected reason.
- Write the minimum code needed to make it pass, then refactor while keeping the test suite green.
- Do not add tests solely for static styling, copy, assets, configuration, technical renames, file moves, or behavior-preserving refactors unless explicitly requested.

This project is public and open source. Never commit or publish secrets, credentials, API keys, tokens, private URLs, or populated environment files. Use ignored local environment files and provide only sanitized placeholders in files such as `.env.example`.

When asked to commit changes, use a concise commit message written entirely in lowercase.

Never revert, overwrite, or discard code modified by the user. Work with existing changes; if reverting them is genuinely necessary, explain why and ask for explicit permission first.

Use English vocabulary for all technical identifiers, including routes, file and directory names, variables, functions, types, and configuration keys.
