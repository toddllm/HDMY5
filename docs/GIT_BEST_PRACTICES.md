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

### setup-git-aliases.sh

We've also created a script to set up Git aliases that use `cat` as the pager. This allows you to use Git commands with consistent output formatting without having to use the helper script each time.

#### Usage

```bash
./scripts/git-helpers/setup-git-aliases.sh
```

This will set up the following aliases:

- `git catlog` - Show commit logs with cat pager
- `git catdiff` - Show diffs with cat pager
- `git catshow` - Show various Git objects with cat pager
- `git catstatus` - Show repository status with cat pager
- `git catblame` - Show file blame information with cat pager

#### Examples

```bash
# View the last 5 commits in a concise format
git catlog -n 5 --oneline

# View the details of a specific commit
git catshow <commit-hash>

# View the diff of staged changes
git catdiff --staged
```

## Why Use These Tools?

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

## Manual Setup of Git Aliases

If you prefer to set up the aliases manually, you can use the following commands:

```bash
git config --global alias.catlog 'log --color=always | cat'
git config --global alias.catdiff 'diff --color=always | cat'
git config --global alias.catshow 'show --color=always | cat'
git config --global alias.catstatus 'status --color=always | cat'
git config --global alias.catblame 'blame --color=always | cat'
```
