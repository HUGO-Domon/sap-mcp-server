# Contributing

**English** | [日本語](CONTRIBUTING.ja.md)

Thanks for your interest!

## Workflow

1. Open an issue to discuss a proposal or bug.
2. Fork → create a feature branch.
3. Verify the build with `npm ci && npm run build:bundle`.
4. Open a Pull Request describing the change, motivation, and test results.

## Required rules

- **Never include secrets.** Do not put connection details, tokens, customer or company names,
  internal host names, or production endpoints into code, README, samples, or commit history.
  Use neutral placeholders (e.g. `example.com`, `TENANT_A`).
- Secret scanning must pass before committing (`gitleaks detect`); CI checks it as well.
- The license is Apache-2.0. Add an SPDX header to new files where appropriate:
  `// SPDX-License-Identifier: Apache-2.0`.

## DCO / Sign-off

Please sign your commits with `git commit -s` (Signed-off-by).
