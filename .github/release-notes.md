Agent Activity is a local macOS menu-bar popover that surfaces live Claude Code / Codex activity, provider usage, local services, and the state of the GitHub repos you track.

### Fixes in this release
- **GitHub tab now works when the app is opened from Finder/Applications** — the app imports your login-shell PATH at startup, so it can find `gh` and `node` (previously the account list was empty and the local bridge could fail to start).

### Included features
- **Sessions** — live Claude Code activity (turn / tool / done / needs-input) with per-session history
- **Usage** — quota & token views for Claude Code, Codex, Cursor, and Antigravity
- **GitHub** — per-repo latest commit, CI status, and open PRs; switch gh accounts inline
- **Terminal focus** — jump to the matching iTerm2 or Ghostty window at the session's cwd
- **Auto-update** — signed updates delivered straight from GitHub Releases
