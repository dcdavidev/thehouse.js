#!/bin/sh
# Run "pnpm install" when the dependency files changed between two revisions.
# Usage: install-if-deps-changed.sh <old-rev> [new-rev]
#        install-if-deps-changed.sh rewrite:<amend|rebase>   (post-rewrite)

old="$1"
new="${2:-HEAD}"

case "$old" in
  # "git commit --amend": the previous HEAD is the last reflog entry.
  rewrite:amend) old='HEAD@{1}' ;;
  # "git rebase": the previous HEAD is saved in ORIG_HEAD.
  rewrite:*) old=ORIG_HEAD ;;
esac

# Nothing to compare (first commit, or no previous revision).
if [ -z "$old" ] || ! git rev-parse --quiet --verify "$old^{commit}" > /dev/null; then
  exit 0
fi

if git diff --quiet "$old" "$new" -- package.json pnpm-lock.yaml pnpm-workspace.yaml; then
  exit 0
fi

echo "Dependency files changed: running pnpm install..."
pnpm install --frozen-lockfile
