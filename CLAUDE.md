# CLAUDE.md — Operating Guide for tiengviet-doc-app

## 1. Commands

* Run Metro Dev Server: `npx expo start`
* Run Clear Cache: `npx expo start -c`
* Run with Tunnel (remote devices): `npx expo start --tunnel`
* Typecheck Code: `npx tsc --noEmit`
* Run Unit Tests: `npm run test` or `npx vitest run`

## 2. Naming & Code Conventions

* **Language:** TypeScript strictly, clean types, no `any`.
* **Coding Style:** Clean components, functional React Native with hooks, child-friendly theme colors from `COLORS`.
* **Layering:** Keep business logic (`phonicsEngine.ts`) decoupled from UI/React components.
* **Commits:** Conventional commits format: `feat(scope): descriptions`, `fix(scope): descriptions`, `docs(scope): descriptions`.
* **Branches:** Use `feat/issue-ID-name` or `fix/issue-ID-name` format.

## 3. Git Workflow (Branch & PR)

Always follow this exact workflow when working on a ticket/issue:
1. **Branch off from main:** `git checkout main && git pull && git checkout -b feat/issue-ID-name`
2. **Implement changes** and make sure types pass (`npx tsc --noEmit`) and tests pass (`npm run test`).
3. **Commit changes:** `git add . && git commit -m "feat/fix(scope): description"`
4. **Push branch:** `git push -u origin <branch-name>`
5. **Create PR to main:** `gh pr create --title "..." --body "..."`
6. **Merge PR:** `gh pr merge --merge --delete-branch`
7. **Return to main:** `git checkout main && git pull`
