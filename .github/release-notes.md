Agent Activity is a local macOS menu-bar popover that surfaces live Claude Code / Codex activity, provider usage, local services, and the state of the GitHub repos you track.

### Fixes
- **Session model no longer leaks between agents.** The bridge kept a single global "last scope", so a model label from one agent (e.g. Antigravity's `gemini`) could bleed onto another agent's session (e.g. Claude Code). Carry-forward is now tracked per conversation, so each session shows its own model.
