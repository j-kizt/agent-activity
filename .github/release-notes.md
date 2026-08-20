Agent Activity is a local macOS menu-bar popover that surfaces live Claude Code / Codex activity, provider usage, local services, and the state of the GitHub repos you track.

### Fixes
- **Fixed a blank (black) popover.** A single event with an unexpected shape could throw while rendering the session list and blank the entire panel. Event descriptors are now defensive, and a render error boundary keeps the popover usable (with a Reload fallback) instead of going blank.
