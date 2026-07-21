# Agent Rules

Always write tests for feature and behavioral code changes

This project is public and open source. Never commit or publish secrets, credentials, API keys, tokens, private URLs, or populated environment files. Use ignored local environment files and provide only sanitized placeholders in files such as `.env.example`.

When asked to commit changes, use a concise commit message written entirely in lowercase.

Never revert, overwrite, or discard code modified by the user. Work with existing changes; if reverting them is genuinely necessary, explain why and ask for explicit permission first.

Use English vocabulary for all technical identifiers, including routes, file and directory names, variables, functions, types, and configuration keys.

Use absolute TypeScript imports rooted at `src` through the `@/` alias. Do not use relative TypeScript imports.
