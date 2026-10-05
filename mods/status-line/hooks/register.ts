import type { Engine, Register } from 'claude-code'

const PROGRESS = '/.cache/progress'
const CREDIT = '/.cache/api-credit.json'

async function refresh($: Engine) {
  const home = (await $.env.get('HOME')) || ''
  const parts: string[] = []
  try {
    for (const f of await $.fs.list(home + PROGRESS)) {
      if (!f.name.endsWith('.json')) continue
      try {
        const d = JSON.parse((await $.fs.read(`${home + PROGRESS}/${f.name}`)) as string)
        if (d.status !== 'running') continue
        const n = d.total ? `${Number(d.done || 0).toLocaleString('en')}/${Number(d.total).toLocaleString('en')}` : ''
        parts.push(`⏳ ${f.name.replace(/\.json$/, '')} ${n}${d.eta ? ` · ${d.eta}` : ''}`.trim())
      } catch {}
    }
  } catch {}
  try {
    const c = JSON.parse((await $.fs.read(home + CREDIT)) as string)
    parts.push(`${c.left < 5 ? '⚠️ ' : ''}credit $${c.left}`)
  } catch {}
  const TZ_OFFSET_HOURS = 3  // your UTC offset
  const riyadh = new Date((await $.clock.now()) + TZ_OFFSET_HOURS * 3600 * 1000)
  const hhmm = `${String(riyadh.getUTCHours()).padStart(2, '0')}:${String(riyadh.getUTCMinutes()).padStart(2, '0')}`
  $.ui.status([`🕐 ${hhmm}`, ...parts.slice(0, 3)].join('  ·  '))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await refresh($)
    $.clock.every(30000, () => refresh($))
    return next(e)
  })
}
