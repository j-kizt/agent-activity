Agent Activity is a local macOS menu-bar popover that surfaces live Claude Code / Codex activity, provider usage, local services, and the state of the GitHub repos you track.

### What's new
- **GitHub repos are tracked per gh account** — the tab now shows only the repos you track for the active account, and switching accounts swaps the list. Your existing tracked repos are migrated onto the active account automatically.

### Recent fixes
- GitHub tab works when the app is opened from Finder/Applications (login-shell PATH is imported so `gh` and `node` resolve)
- Release notes are shown in Settings → Update
