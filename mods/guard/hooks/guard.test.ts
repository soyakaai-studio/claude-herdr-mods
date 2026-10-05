import { expect, test } from 'claude-code/testing'

const bad = ['adb -s x shell rm -rf /sdcard/a', 'pkill -f node', 'cat ~/.config/app/api-key', 'tail .env']
const good = ['adb -s x shell ls /sdcard', 'pgrep -x node', 'curl -H "Authorization: Bearer $(cat ~/.config/app/api-key)" x', 'cat README.md']

test('blocks the risky commands', async ($, on) => {
  on('tool.call', { tool: 'Bash' }, () => ({ result: { text: 'ran', isError: false } }))
  for (const command of bad) {
    const r = await $.tool.call({ tool: 'Bash', command })
    expect('deny' in r || (r as { isError?: boolean }).isError === true).toBe(true)
  }
})

test('lets normal commands through', async ($, on) => {
  on('tool.call', { tool: 'Bash' }, () => ({ result: { text: 'ran', isError: false } }))
  for (const command of good) {
    const r = await $.tool.call({ tool: 'Bash', command })
    expect('deny' in r).toBe(false)
  }
})
