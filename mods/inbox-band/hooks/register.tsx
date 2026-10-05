import { atom, read, update } from 'claude-code'
import type { Engine, Register } from 'claude-code'

import type { Inbox } from '../types'

const INBOX = '/.config/herdr/inbox.md'
const POINTER = '/.config/herdr/inbox.read'
const NOISE = /^$/  // add patterns for report lines you never want counted
const NEEDS = /✋|needs you|❌|⚠️|blocked/i

const inbox = atom({ plugin: 'inbox-band', key: 'inbox' } as const, { fresh: 0, needsYou: 0 })

async function refresh($: Engine) {
  const home = (await $.env.get('HOME')) || ''
  try {
    const text = (await $.fs.read(home + INBOX)) as string
    const seen = parseInt(((await $.fs.read(home + POINTER)) as string).trim(), 10) || 0
    const lines = text.split('\n').slice(seen).filter(l => l.startsWith('- 20') && !NOISE.test(l))
    const fresh: Inbox = { fresh: lines.length, needsYou: lines.filter(l => NEEDS.test(l)).length }
    await update($, inbox, () => fresh)
  } catch {}
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await refresh($)
    $.clock.every(30000, () => refresh($))
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    await refresh($)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const box = await read($, inbox)
    if (e.props.hasSurvey || box.fresh === 0) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box>
        <Text color={box.needsYou ? 'yellow' : undefined} dimColor={!box.needsYou}>
          📥 {box.fresh} new report{box.fresh === 1 ? '' : 's'}{box.needsYou ? ` · ✋ ${box.needsYou} may need you` : ''}
        </Text>
      </Box>
    )
  })
}
