# Contributing to ts-api-client-generator

Thanks for your interest!

## How to contribute

1. **Fork this repo and branch off `main` (or `master`).**
2. **Make your changes and commit.**
3. **Add a Changeset describing your change:**
   ```sh
   npx changeset
Follow prompts. Commit the generated file in .changeset/.
4. Push and open a Pull Request.

What happens next?
After PR is merged, a bot will open a "Version Packages" PR to bump the version and update the changelog.

Merge the version PR. This triggers CI to publish to npm (@drymers/ts-api-client-generator) and GitHub Packages (@DRymers7/ts-api-client-generator).

No need to bump version manually!

Publishing
All publishing and versioning is handled by Changesets and GitHub Actions.

Ensure you never manually run npm version or edit package.json version/changelog directly.

Thanks for making this project better!

yaml
Copy
Edit

---

## 6. **Summary Table**

| Registry          | Name                                     |
|-------------------|------------------------------------------|
| **npm**           | `@drymers/ts-api-client-generator`       |
| **GitHub Packages** | `@DRymers7/ts-api-client-generator`      |

---

## 7. **Troubleshooting/Other Notes**

- **Secrets**: Ensure you have `NPM_TOKEN` and `GITHUB_TOKEN` in your GitHub repo secrets.
- **If you want the default npm package to be unscoped** (not `@drymers`), just adjust the names accordingly.

---

**TL;DR:**  
- Add that new `publish-package.yml` workflow.  
- Drop the `CONTRIBUTING.md` into your repo root.  
- Use `npx changeset` in feature PRs.  
- Let CI handle the rest.

---