import type { EngineInterface, Register, TextProps, Timer } from 'claude-code'

import {
  IMPLEMENT,
  type Tone,
  addAgent,
  commandPhase,
  endAgent,
  findSlug,
  initialState,
  pieces,
  startPhase,
  withSlices,
} from './bar'

const BAR = 'craft:bar'
const HIDDEN = 'hidden'
const OFF = 'off'
const ON = 'on'
const OFF_TEXT = 'The craft bar is off.'
const ON_TEXT = 'The craft bar is on.'
const WORKS = 'docs/craft'
const SLICES = 'slices.md'
const RENDER = 'ui.render'
const NONE = ''
const TICK_MS = 250
const CRAFT = /^craft:/
const STYLES: Record<Tone, TextProps> = {
  label: { dimColor: true },
  slug: { bold: true },
  phase: { color: 'suggestion' },
  built: { color: 'success' },
  building: { color: 'warning' },
  waiting: { dimColor: true },
  dim: { dimColor: true },
  plain: {},
}

let state = initialState()
let ticker: Timer | undefined

async function hidden($: EngineInterface): Promise<boolean> {
  return (await $.store.get(HIDDEN)) === true
}

async function folders($: EngineInterface): Promise<string[]> {
  const root = await $.session.root()
  const entries = await $.fs.list(`${root}/${WORKS}`).catch(() => [])
  return entries.filter(entry => entry.kind === 'dir').map(entry => entry.name)
}

async function readSlices($: EngineInterface): Promise<void> {
  if (state.phase === IMPLEMENT && state.slug !== undefined) {
    const root = await $.session.root()
    const text = await $.fs.read(`${root}/${WORKS}/${state.slug}/${SLICES}`).catch(() => undefined)
    state = withSlices(state, typeof text === 'string' ? text : NONE)
  }
  $.ui.invalidate(RENDER)
}

function cancelTicker(): void {
  ticker?.cancel()
  ticker = undefined
}

function tick($: EngineInterface): void {
  if (state.agents.length > 0 && ticker === undefined) {
    ticker = $.clock.every(TICK_MS, () => $.ui.invalidate(RENDER))
  } else if (state.agents.length === 0) {
    cancelTicker()
  }
  $.ui.invalidate(RENDER)
}

async function answerBar($: EngineInterface, args: string): Promise<{ text: string }> {
  const word = args.trim()
  const isHidden = word === OFF ? true : word === ON ? false : !(await hidden($))
  await $.store.set(HIDDEN, isHidden)
  $.ui.invalidate(RENDER)
  return { text: isHidden ? OFF_TEXT : ON_TEXT }
}

export const register: Register = on => {
  on('command.run', { command: CRAFT }, async ($, e, next) => {
    if (e.command === BAR) return answerBar($, e.args)
    const phase = commandPhase(e.command)
    if (phase !== undefined) {
      const names = await folders($)
      state = startPhase(state, phase, e.args, names)
      await readSlices($)
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('agent.spawn', { subagentType: CRAFT }, async ($, e, next) => {
    const result = await next(e)
    if ('agentId' in result && result.agentId !== undefined) {
      const now = await $.clock.now()
      state = addAgent(state, e.subagentType, e.prompt, result.agentId, now)
      tick($)
    }
    return result
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
      if (state.phase !== undefined) {
        if (state.slug === undefined) {
          const names = await folders($)
          state = findSlug(state, names)
        }
        await readSlices($)
      }
    } else if (state.agents.some(agent => agent.id === e.agentId)) {
      state = endAgent(state, e.agentId)
      tick($)
    }
    return next(e)
  })

  on('session.end', ($, e, next) => {
    state = initialState()
    cancelTicker()
    $.ui.invalidate(RENDER)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const line = pieces(state, await $.clock.now())
    if (e.props.hasSurvey || line.length === 0 || (await hidden($))) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const below = await next(e)
    const texts = line.map(piece => Text({ ...STYLES[piece.tone], children: piece.text }))
    return Box({ flexDirection: 'column', children: [Box({ key: BAR, children: Text({ children: texts }) }), below] })
  })
}
