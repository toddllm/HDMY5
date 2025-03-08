# Git Best Practices

This document outlines the best practices for using Git in this project.

## Using the Git Helper Scripts

### git-with-cat.sh

We've created a helper script that ensures consistent output formatting for Git commands by setting the `GIT_PAGER` environment variable to `cat`. This prevents pagination and ensures that all output is displayed directly in the terminal.

#### Usage

```bash
./scripts/git-helpers/git-with-cat.sh <git-command> [arguments]
```

#### Examples

```bash
# View the last 5 commits in a concise format
./scripts/git-helpers/git-with-cat.sh log -n 5 --oneline

# View the details of a specific commit
./scripts/git-helpers/git-with-cat.sh show <commit-hash>

# View the diff of staged changes
./scripts/git-helpers/git-with-cat.sh diff --staged
```

#### Why Use This?

- **Consistent Output**: Ensures that Git output is displayed consistently across different environments
- **No Pagination**: Avoids the need to navigate through paginated output with less/more
- **Better for Automation**: Makes it easier to capture and process Git output in scripts
- **Improved Readability**: Displays all output at once, making it easier to review

## General Git Best Practices

1. **Commit Messages**

   - Use clear, descriptive commit messages
   - Start with a verb in the imperative mood (e.g., "Fix", "Add", "Update")
   - Keep the first line under 50 characters
   - Add more detailed explanation in the body if necessary

2. **Branching Strategy**

   - Use feature branches for new features
   - Use bugfix branches for bug fixes
   - Always merge from the latest main/master branch

3. **Code Reviews**

   - All code should be reviewed before merging
   - Use pull requests for code reviews
   - Address all comments before merging

4. **Commit Frequency**
   - Commit early and often
   - Each commit should represent a logical unit of work
   - Avoid large commits that mix unrelated changes

## Setting Up Git Aliases

You can also set up Git aliases to automatically use `cat` as the pager:

```bash
git config --global alias.catlog 'log --color=always | cat'
git config --global alias.catdiff 'diff --color=always | cat'
git config --global alias.catshow 'show --color=always | cat'
```

Then you can use these aliases:

```bash
git catlog -n 5
git catdiff HEAD~1
git catshow HEAD
```
