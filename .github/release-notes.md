Agent Activity is a local macOS menu-bar popover that surfaces live Claude Code / Codex activity, provider usage, local services, and the state of the GitHub repos you track.

### What's new
- **Antigravity hooks plugin** — Settings → Plugins now has a second installable row next to Claude Code hooks. One-click install writes the hook into `~/.gemini/config/hooks.json` and reports its status.
- Antigravity lifecycle events feed live presence: `PreToolUse` → tool start, `PostToolUse` → tool end, `PreInvocation` → conversation/turn start, `Stop` → turn complete. `PreToolUse` always allows, so it never blocks Antigravity.

Restart Antigravity after installing so it picks up the new hook.
