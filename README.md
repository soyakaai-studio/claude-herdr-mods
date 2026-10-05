# Claude mods for Herdr — a starter kit

Claude Code now supports **mods**: small plugins that run inside every Claude chat. They can block a command before it runs, put a line above the prompt, show a status line, or pop a toast. If you run many Claude chats in [Herdr](https://herdr.dev), a few small mods make the whole setup safer and calmer.

This kit has three, each a few dozen lines you can read and edit.

| Mod | What it does | Why we built it |
|---|---|---|
| **guard** | Blocks risky shell commands before Claude runs them, and strips secrets you paste by accident | A cleanup job once emptied a phone folder; `pkill -f` killed Claude's own shell twice; a sign-in code landed in a chat |
| **status-line** | Bottom line in every chat: local time · running jobs · API credit | Stop asking "status?" — jobs write a small progress file, every chat shows it |
| **inbox-band** | "📥 3 new reports · ✋ 1 may need you" above the prompt | Many chats report to one inbox file; you see it without reading it |

Rules written in a prompt can be forgotten. A mod is code, so it is enforced every time.

---

## Install (2 minutes)

```bash
git clone <this repo> ~/.claude/mods/claude-herdr-mods
```

Load them in **every** Claude chat by adding this to `~/.claude/settings.json` (merge with what's there):

```json
{
  "env": {
    "CLAUDE_CODE_PLUGIN_DIRS": "~/.claude/mods/claude-herdr-mods/mods/guard:~/.claude/mods/claude-herdr-mods/mods/status-line"
  }
}
```

Add `:~/.claude/mods/claude-herdr-mods/mods/inbox-band` if you use the inbox idea below. New chats pick them up; restart open ones.

Try it: ask Claude to run `pkill -f something`. You should see `guard: blocked: …`.

Check or test a mod yourself:

```bash
claude plugin validate ~/.claude/mods/claude-herdr-mods/mods/guard
claude plugin test     ~/.claude/mods/claude-herdr-mods/mods/guard
```

---

## Make them yours

- **guard** → `mods/guard/hooks/register.ts`, the `RULES` list. Each rule is a pattern and a reason. Add the mistakes *your* agents make.
- **status-line** → set `TZ_OFFSET_HOURS`. Any job can show up by writing `~/.cache/progress/<name>.json`:

  ```json
  { "status": "running", "done": 120, "total": 400, "eta": "14:30" }
  ```

  Optional credit: write `{"left": 12.5}` to `~/.cache/api-credit.json` from a small cron job.
- **inbox-band** → other chats append one line per report to `~/.config/herdr/inbox.md` (`- 2026-10-06T10:00Z · Chat name · what happened`). You (or your main chat) write the line number you've read to `~/.config/herdr/inbox.read`. The band counts what's new.

Want to change one live? In a Claude chat, ask Claude to load the `plugin-authoring` skill and edit the mod — with hot reloading on, changes apply as soon as the turn ends.

---

## How we use it with Herdr

- **One "Help Desk" chat** we talk to; it dispatches work to other chats in panes and never does long work itself.
- Other chats **report into the inbox file** instead of typing into the Help Desk pane (so they never land in the middle of what you're typing). The inbox band shows the count.
- Long jobs write **progress files**; the status line shows them in every chat, and a small pane in Herdr can show the same file.
- The **guard** runs in every chat, so a rule learned once protects all of them.

Small, boring, and it removed a whole class of "wait, what just happened?" moments.

---

*Built by Sonat Yalcinkaya (SoyakaAI). MIT licence — use, change, share.*
