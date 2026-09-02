#!/usr/bin/env bash
# Regenerates snapshot.ts from this repository's real history.
#
# This is the concept, in one script: the Live Build Log has no backend because
# the log *is* the repository, read once at build time and baked into the bundle.
# Run it, commit the result, redeploy — the site's freshness is its deploy cadence.
#
#   ./prototypes/build-log/generate-snapshot.sh > prototypes/build-log/snapshot.ts
#
# Nothing here invents anything. Agent attribution comes from the Co-Authored-By
# trailer Claude Code writes; a commit without one was typed by a human.
set -euo pipefail

cd "$(dirname "$0")/../.."

# Git cannot tell you which branch a commit was made on, so the branch label is a
# stated heuristic rather than a fact: walk the branches in this order and let each
# claim the commits nobody has claimed yet. Base branches come before the branches
# cut from them, which is what makes the answer come out right here.
BRANCHES=(main harness/prototypes research/landscape-common-vs-rare research/web-audio-feasibility spike/mpa-view-transitions proto/explorable proto/build-log)

declare -A BRANCH_OF=()
for branch in "${BRANCHES[@]}"; do
  git rev-parse --verify --quiet "$branch" >/dev/null || continue
  while read -r sha; do
    [[ -n "${BRANCH_OF[$sha]:-}" ]] || BRANCH_OF[$sha]="$branch"
  done < <(git rev-list "$branch")
done

json_escape() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/'"'"'/\\'"'"'/g'; }

emit_commits() {
  while read -r sha; do
    subject=$(git show -s --format=%s "$sha")
    at=$(git show -s --format=%cI "$sha")
    trailer=$(git show -s --format='%(trailers:key=Co-Authored-By,valueonly)' "$sha")
    session=$(git show -s --format='%(trailers:key=Claude-Session,valueonly)' "$sha" | head -1)
    stat=$(git show -s --format='' --shortstat "$sha")
    files=$(sed -n 's/.* \([0-9]*\) files\? changed.*/\1/p' <<<"$stat"); files=${files:-0}
    plus=$(sed -n 's/.* \([0-9]*\) insertions\?(+).*/\1/p' <<<"$stat"); plus=${plus:-0}
    minus=$(sed -n 's/.* \([0-9]*\) deletions\?(-).*/\1/p' <<<"$stat"); minus=${minus:-0}
    actor='hand'
    [[ -n "$trailer" ]] && actor='agent'

    printf "  { sha: '%s', at: '%s', subject: '%s', actor: '%s', branch: '%s', files: %s, added: %s, removed: %s" \
      "${sha:0:7}" "$at" "$(json_escape "$subject")" "$actor" "${BRANCH_OF[$sha]:-?}" "$files" "$plus" "$minus"
    [[ -n "$session" ]] && printf ", session: '%s'" "$session"
    printf " },\n"
  done < <(git rev-list --all --date-order)
}

emit_tickets() {
  gh issue list --state all --limit 100 \
    --json number,title,state,createdAt,closedAt,labels \
    --jq 'sort_by(.number)[] | [.number, .title, ([.labels[].name | select(startswith("wayfinder:")) | sub("wayfinder:";"")] | first // "issue"), .createdAt, (.closedAt // "")] | @tsv' |
    while IFS=$'\t' read -r number title type created closed; do
      printf "  { number: %s, title: '%s', type: '%s', openedAt: '%s', closedAt: %s },\n" \
        "$number" "$(json_escape "$title")" "$type" "$created" \
        "$([[ -n "$closed" ]] && printf "'%s'" "$closed" || printf 'null')"
    done
}

cat <<HEADER
/**
 * GENERATED — do not edit. Run ./generate-snapshot.sh and commit the result.
 *
 * The repository, read once. Every number this sketch renders is derived from
 * these two arrays; nothing about the build is asserted anywhere else.
 */
import type { Snapshot } from './log'

export const SNAPSHOT: Snapshot = {
  takenAt: '$(date -u +%Y-%m-%dT%H:%M:%SZ)',
  repo: 's0h311/liamfunk-de',
  commits: [
$(emit_commits)  ],
  tickets: [
$(emit_tickets)  ],
}
HEADER
