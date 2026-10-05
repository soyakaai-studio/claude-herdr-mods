import type { Register } from 'claude-code'

// Rules that block a shell command before Claude runs it. Edit freely: each rule is a pattern and a reason.
// Ours came from real mistakes; keep the ones that fit you and add your own.
const RULES: { test: RegExp; why: string }[] = [
  // Phones: never delete anything on a connected Android phone.
  { test: /\badb\b[^|;&]*\bshell\b[^|;&]*\b(rm|unlink|delete)\b/, why: 'never delete anything on a phone' },
  // Secrets: never print key files to the screen (using them inside $(cat file) is fine).
  { test: /(?<!\$\()\b(cat|head|tail|less|more|xxd|base64|strings|od|grep|bat)\b[^|;&]*(\.env(\.local)?\b|api[-_]?key|secret|token|password|credentials)/i, why: 'never print a key or password file; use it as $(cat file) inside the command' },
  // Self-harm: `pkill -f name` also matches the shell running it and kills Claude's own command.
  { test: /\bpkill\s+-f\b/, why: 'pkill -f matches your own shell; use pgrep -x then kill <pid>' },
]

// Secrets pasted into a message by accident are removed before Claude sees them.
const SECRET = /\b(sk-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{30,}|ya29\.[A-Za-z0-9_.-]{20,}|ghp_[A-Za-z0-9]{30,}|glpat-[A-Za-z0-9_-]{20,}|xox[bpa]-[A-Za-z0-9-]{20,})\b|-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g

export const register: Register = on => {
  on('prompt.submit', ($, e, next) => {
    if (!SECRET.test(e.text)) return next(e)
    SECRET.lastIndex = 0
    $.ui.toast('A secret was removed from your message.')
    return next({ ...e, text: e.text.replace(SECRET, '[secret removed]') })
  })

  on('tool.call', { tool: 'Bash' }, ($, e, next) => {
    const hit = RULES.find(r => r.test.test(e.command))
    return hit ? { deny: `${$.plugin.name}: blocked: ${hit.why}.` } : next(e)
  })
}
