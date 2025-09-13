#!/bin/bash
set -e

# WORKAROUND: cursor-agent hangs in non-interactive mode and doesn't exit properly
# See: https://forum.cursor.com/t/cursor-agent-p-non-interactive-not-exiting-at-the-end/133109/3
# This script implements multiple timeout layers and aggressive process cleanup to work around the issue

# Parse command line arguments
REPO="$1"
PR_NUMBER="$2"
PR_HEAD_SHA="$3"
PR_BASE_SHA="$4"
MODEL="$5"

# Validate all required parameters and prevent injection attacks
if [ -z "$REPO" ]; then
    echo "Error: Repository name is required"
    exit 1
fi

# Validate repository format: owner/repo (alphanumeric, hyphens, underscores, dots only)
if ! [[ "$REPO" =~ ^[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+$ ]]; then
    echo "Error: Repository must be in format 'owner/repo' (alphanumeric, hyphens, underscores, dots only)"
    exit 1
fi

# Validate PR number: must be numeric only
if [ -z "$PR_NUMBER" ] || ! [[ "$PR_NUMBER" =~ ^[0-9]+$ ]]; then
    echo "Error: Valid PR number is required (numeric only)"
    exit 1
fi

# Validate PR number range (reasonable bounds)
if [ "$PR_NUMBER" -lt 1 ] || [ "$PR_NUMBER" -gt 999999 ]; then
    echo "Error: PR number must be between 1 and 999999"
    exit 1
fi

# Validate SHA format: alphanumeric only, 7-40 characters
if [ -z "$PR_HEAD_SHA" ] || ! [[ "$PR_HEAD_SHA" =~ ^[a-f0-9]{7,40}$ ]]; then
    echo "Error: Valid PR head SHA is required (7-40 hex characters)"
    exit 1
fi

if [ -z "$PR_BASE_SHA" ] || ! [[ "$PR_BASE_SHA" =~ ^[a-f0-9]{7,40}$ ]]; then
    echo "Error: Valid PR base SHA is required (7-40 hex characters)"
    exit 1
fi

# Validate model name: alphanumeric, hyphens, underscores, dots only
if [ -z "$MODEL" ]; then
    echo "Error: Model name is required"
    exit 1
fi

if ! [[ "$MODEL" =~ ^[a-zA-Z0-9._-]+$ ]]; then
    echo "Error: Model name contains invalid characters (alphanumeric, hyphens, underscores, dots only)"
    exit 1
fi

# Additional security: check for common injection patterns
if [[ "$REPO" =~ [;\&\|\`\$] ]] || [[ "$PR_NUMBER" =~ [;\&\|\`\$] ]] || [[ "$PR_HEAD_SHA" =~ [;\&\|\`\$] ]] || [[ "$PR_BASE_SHA" =~ [;\&\|\`\$] ]] || [[ "$MODEL" =~ [;\&\|\`\$] ]]; then
    echo "Error: Parameters contain potentially dangerous characters"
    exit 1
fi

# Validate environment variables
if [ -z "$CURSOR_API_KEY" ]; then
    echo "Error: CURSOR_API_KEY environment variable is required"
    exit 1
fi

if [ -z "$GH_TOKEN" ]; then
    echo "Error: GH_TOKEN environment variable is required"
    exit 1
fi

echo "Starting code review for PR #${PR_NUMBER} in ${REPO}"
echo "Using model: ${MODEL}"
echo "Head SHA: ${PR_HEAD_SHA}"
echo "Base SHA: ${PR_BASE_SHA}"

# Function to cleanup and force exit
# This is necessary due to cursor-agent hanging issue mentioned above
cleanup_and_exit() {
    echo "Cleaning up cursor-agent processes..."
    pkill -f cursor-agent 2>/dev/null || true
    pkill -9 -f cursor-agent 2>/dev/null || true
    echo "Code review completed"
    exit 0
}

# Set up signal handlers for cleanup
trap cleanup_and_exit SIGTERM SIGINT EXIT

# Start cursor-agent in background with timeout
timeout 240 cursor-agent --force --model "$MODEL" --output-format=text --print "You are operating in a GitHub Actions runner performing automated code review. The gh CLI is available and authenticated via GH_TOKEN. You may comment on pull requests.

Context:
- Repo: ${REPO}
- PR Number: ${PR_NUMBER}
- PR Head SHA: ${PR_HEAD_SHA}
- PR Base SHA: ${PR_BASE_SHA}

Objectives:
1) Re-check existing review comments and reply resolved when addressed.
2) Review the current PR diff and flag only clear, high-severity issues.
3) Leave very short inline comments (1-2 sentences) on changed lines only and a brief summary at the end.

Procedure:
- Get existing comments: gh pr view --json comments
- Get diff: gh pr diff
- Get changed files with patches to compute inline positions: gh api repos/${REPO}/pulls/${PR_NUMBER}/files --paginate --jq '.[] | {filename,patch}'
- Compute exact inline anchors for each issue (file path + diff position). Comments MUST be placed inline on the changed line in the diff, not as top-level comments.
- Detect prior top-level \"no issues\" style comments authored by this bot (match bodies like: \"✅ no issues\", \"No issues found\", \"LGTM\").
- If CURRENT run finds issues and any prior \"no issues\" comments exist:
  - Reply to that comment: \"⚠️ Superseded: issues were found in newer commits\".
- If a previously reported issue appears fixed by nearby changes, reply: ✅ This issue appears to be resolved by the recent changes
- Analyze ONLY for:
  - Null/undefined dereferences
  - Resource leaks (unclosed files or connections)
  - Injection (SQL/XSS)
  - Concurrency/race conditions
  - Missing error handling for critical operations
  - Obvious logic errors with incorrect behavior
  - Clear performance anti-patterns with measurable impact
  - Definitive security vulnerabilities
- Avoid duplicates: skip if similar feedback already exists on or near the same lines.

Commenting rules:
- Max 10 inline comments total; prioritize the most critical issues
- One issue per comment; place on the exact changed line
- All issue comments MUST be inline (anchored to a file and line/position in the PR diff)
- Natural tone, specific and actionable; do not mention automated or high-confidence
- Use emojis: 🚨 Critical 🔒 Security ⚡ Performance ⚠️ Logic ✅ Resolved ✨ Improvement

Submission:
- If there are NO issues to report and an existing top-level comment indicating \"no issues\" already exists (e.g., \"✅ no issues\", \"No issues found\", \"LGTM\"), do NOT submit another comment. Skip submission to avoid redundancy.
- If there are NO issues to report and NO prior \"no issues\" comment exists, submit one brief summary comment noting no issues.
- If there ARE issues to report and a prior \"no issues\" comment exists, ensure that prior comment is deleted/minimized/marked as superseded before submitting the new review.
- If there ARE issues to report, submit ONE review containing ONLY inline comments plus an optional concise summary body. Use the GitHub Reviews API to ensure comments are inline:
  - Build a JSON array of comments like: [{ \"path\": \"<file>\", \"position\": <diff_position>, \"body\": \"...\" }]
  - Submit via: gh api repos/${REPO}/pulls/${PR_NUMBER}/reviews -f event=COMMENT -f body=\"\$SUMMARY\" -f comments='\$COMMENTS_JSON'
- Do NOT use: gh pr review --approve or --request-changes

CRITICAL: When you finish the review, immediately type 'REVIEW_COMPLETE' and the process will terminate." &

# Get the PID of the cursor-agent process
CURSOR_PID=$!

# Monitor the process and force cleanup if it hangs
for i in {1..240}; do
    if ! kill -0 $CURSOR_PID 2>/dev/null; then
        echo "Cursor-agent completed naturally"
        break
    fi
    sleep 1
done

# Force cleanup regardless of completion status
cleanup_and_exit
