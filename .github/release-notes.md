Agent Activity is a local macOS menu-bar popover that surfaces live Claude Code / Codex activity, provider usage, local services, and the state of the GitHub repos you track.

### Highlights
- **Sessions** — live Claude Code activity (turn / tool / done / needs-input) with per-session recent history
- **Usage** — quota & token views for Claude Code, Codex, Cursor, and Antigravity
- **GitHub** — per-repo latest commit, CI status, and open PRs; switch gh accounts inline
- **Terminal focus** — jump to the matching iTerm2 or Ghostty window at the session's cwd
- **Auto-update** — signed updates delivered straight from GitHub Releases

### Fixes in this release
- Release notes are now hand-written per release and shown in Settings → Update
- The app correctly reads and displays its own version
- Local installs sign updater artifacts automatically (no manual env needed)
