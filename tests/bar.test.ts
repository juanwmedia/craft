import type { On } from 'claude-code'
import { type Engine, type Mounted, expect, mock, test } from 'claude-code/testing'

const PLUGIN = 'craft'
const BAR = 'craft:bar'
const ROOT = '/repo'
const WORKS = `${ROOT}/docs/craft`
const SLUG = 'checkout-retry'
const SLICES_FILE = 'slices.md'
const SLICES = `${WORKS}/${SLUG}/${SLICES_FILE}`
const NEW_SLUG = 'retry-button'
const OTHER_SLUG = 'other-work'
const SESSION = 'session'
const HIDDEN = 'hidden'
const ENGINE = 'engine'
const MISSING = 'missing'
const NOTHING = ''
const MODEL = 'model'
const SHAPE = 'shape'
const PLAN = 'plan'
const IMPLEMENT = 'implement'
const PHASES = [SHAPE, PLAN, IMPLEMENT, 'try', 'close']
const BUILD = 'craft:build'
const EVALUATE = 'evaluate'
const ALPHA = 'alpha'
const BETA = 'beta'
const RELAUNCH = 'relaunch'
const SPINNER = /[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/
const WAITING = '□'
const BUILDING = '▣'
const FILLED = '■'
const DIM = 'dim'
const DIM_COLOR = 'dimColor'
const SUCCESS = 'success'
const WARNING = 'warning'
const NEWLINE = '\n'
const SURFACE = 'terminal'
const BAND = 'AbovePrompt'
const TEXT = 'Text'
const PLAN_COMMAND = `${PLUGIN}:${PLAN}`
const IMPLEMENT_COMMAND = `${PLUGIN}:${IMPLEMENT}`
const PLANNING = `${PLUGIN} ${SLUG} · ${PLAN}`
const SHAPING = `${PLUGIN} · ${SHAPE}`

function source(name: string): string {
  return `src/${name}.ts`
}

function show(name: string): string {
  return `cat ${source(name)}`
}

function slice(name: string): string[] {
  return [`### ${name}`, `touches: ${source(name)}`, `done: \`${show(name)}\` prints \`${name}\``]
}

const SLICES_TEXT = [...slice(ALPHA), ...slice(BETA), ...slice('gamma')].join(NEWLINE)

function prompt(name: string): string {
  return [
    `Work in this tree, no worktree: ${ROOT}`,
    NOTHING,
    `Rules for a slice: ${ROOT}/references/slice.md`,
    NOTHING,
    `Work context: docs/craft/${SLUG}/shape.md`,
    NOTHING,
    `Your slice, as written in docs/craft/${SLUG}/${SLICES_FILE}:`,
    NOTHING,
    ...slice(name),
  ].join(NEWLINE)
}

type Ui = Mounted<typeof SURFACE, typeof BAND>

type World = { folders: string[]; files: Record<string, string> }

function world(on: On, folders: string[], stored: Record<string, unknown> = {}) {
  const state: World = {
    folders,
    files: { [SLICES]: SLICES_TEXT, [`${WORKS}/${OTHER_SLUG}/${SLICES_FILE}`]: SLICES_TEXT },
  }
  mock.store(on, stored)
  const clock = mock.clock(on)
  on('session.root', () => ({ value: ROOT }))
  on('fs.list', ($, e) =>
    e.path === WORKS
      ? { value: state.folders.map(name => ({ name, kind: 'dir' as const, size: 0, mtimeMs: 0, isLink: false })) }
      : { deny: MISSING },
  )
  on('fs.read', ($, e) => {
    const text = state.files[e.path]
    return text === undefined ? { deny: MISSING } : { value: text }
  })
  on('command.run', () => ({ text: NOTHING }))
  on('agent.spawn', ($, e) => ({ model: MODEL, agentId: e.description }))
  on('turn.complete', () => ({ text: NOTHING }))
  on('tool.call', () => ({ result: { stdout: NOTHING, stderr: NOTHING, interrupted: false } }))
  on('session.end', ($, e) => ({ sessionId: e.sessionId }))
  on('ui.render', { component: BAND }, ($, e) => {
    const { Text } = $.ui.resolve(e)
    return Text({ children: ENGINE })
  })
  return { state, clock }
}

function mount($: Engine, hasSurvey = false) {
  return $.ui.mount({
    plugin: PLUGIN,
    surface: SURFACE,
    component: BAND,
    props: { hasSurvey, isWorking: false, maxRows: 10, bodyColumns: 80, scroll: { offset: 0, bodyRows: 10 }, view: {} },
  })
}

async function line(ui: Ui) {
  return (await ui.find({ key: BAR }))?.text
}

async function leaf(ui: Ui, text: string) {
  return (await ui.findAll({ type: TEXT })).find(element => element.text === text)?.props
}

async function squares(ui: Ui) {
  const texts = await ui.findAll({ type: TEXT })
  return texts
    .filter(element => [WAITING, BUILDING, FILLED].includes(element.text))
    .map(element => (element.props.dimColor ? DIM : element.props.color))
}

function run($: Engine, command: string, args = NOTHING) {
  return $.command.run({
    command,
    args,
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 80 },
  })
}

function spawn($: Engine, subagentType: string, prompt: string, id: string) {
  return $.agent.spawn({
    tool_use_id: id,
    prompt,
    description: id,
    subagentType,
    provider: { plugin: PLUGIN, tier: 'user' },
    parentModel: MODEL,
    background: true,
    fork: false,
  })
}

function end($: Engine, agentId?: string) {
  const turn = { answer: NOTHING, durationMs: 0, isAborted: false, turnId: MODEL, reason: 'answer' as const }
  return $.turn.complete(agentId === undefined ? turn : { ...turn, agentId })
}

function bash($: Engine) {
  return $.tool.call({ tool: 'Bash', command: show(BETA) })
}

test('nothing is drawn before craft activity', async ($, on) => {
  world(on, [SLUG])
  const ui = await mount($)
  expect(await line(ui)).toBeUndefined()
  expect(await leaf(ui, ENGINE)).toBeDefined()
  await run($, PLAN_COMMAND, SLUG)
  expect(await line(ui)).toBe(PLANNING)
  await $.session.end({ reason: 'clear', sessionId: SESSION, resume: { id: SESSION } })
  expect(await line(ui)).toBeUndefined()
})

test('each phase command on an existing folder draws the label, the slug and the phase', async ($, on) => {
  world(on, [SLUG])
  const ui = await mount($)
  for (const phase of PHASES) {
    await run($, `${PLUGIN}:${phase}`, SLUG)
    expect(await line(ui)).toStartWith(`${PLUGIN} ${SLUG} · ${phase}`)
    expect(await leaf(ui, PLUGIN)).toMatchObject({ dimColor: true })
    expect(await leaf(ui, SLUG)).toMatchObject({ bold: true })
    expect(await leaf(ui, phase)).toMatchObject({ color: 'suggestion' })
  }
})

test('a path inside a work folder gives its slug', async ($, on) => {
  world(on, [SLUG])
  const ui = await mount($)
  await run($, PLAN_COMMAND, `docs/craft/${SLUG}/shape.md and more`)
  expect(await line(ui)).toBe(PLANNING)
})

test('a new idea shows the phase alone, then the slug once a new folder appears and a turn ends', async ($, on) => {
  const { state } = world(on, [SLUG])
  const ui = await mount($)
  await run($, `${PLUGIN}:${SHAPE}`, 'a retry button')
  expect(await line(ui)).toBe(SHAPING)
  state.folders = [SLUG, NEW_SLUG]
  expect(await line(ui)).toBe(SHAPING)
  await end($)
  expect(await line(ui)).toBe(`${PLUGIN} ${NEW_SLUG} · ${SHAPE}`)
})

test('status, wtf and a non-craft agent change nothing', async ($, on) => {
  world(on, [SLUG])
  const ui = await mount($)
  const others = async () => {
    await run($, `${PLUGIN}:status`, SLUG)
    await run($, `${PLUGIN}:wtf`)
    await spawn($, 'general-purpose', prompt(ALPHA), MODEL)
  }
  await others()
  expect(await line(ui)).toBeUndefined()
  await run($, PLAN_COMMAND, SLUG)
  const before = await line(ui)
  await others()
  expect(await line(ui)).toBe(before)
})

test('implement shows a square per slice and the count', async ($, on) => {
  const { state } = world(on, [SLUG, NEW_SLUG, OTHER_SLUG])
  const ui = await mount($)
  await run($, IMPLEMENT_COMMAND, SLUG)
  expect(await line(ui)).toBe(`${PLUGIN} ${SLUG} · ${IMPLEMENT} · ${WAITING.repeat(3)} 0/3`)
  expect(await squares(ui)).toEqual([DIM, DIM, DIM])
  expect(await leaf(ui, ' 0/3')).not.toHaveProperty(DIM_COLOR)
  await spawn($, BUILD, prompt(BETA), BETA)
  await end($, BETA)
  expect(await squares(ui)).toEqual([DIM, SUCCESS, DIM])
  await run($, IMPLEMENT_COMMAND, NEW_SLUG)
  expect(await line(ui)).toBe(`${PLUGIN} ${NEW_SLUG} · ${IMPLEMENT}`)
  await run($, IMPLEMENT_COMMAND, OTHER_SLUG)
  expect(await squares(ui)).toEqual([DIM, DIM, DIM])
})

test('a build agent whose prompt holds its slice below lines of its own turns its square building and shows its name and time', async ($, on) => {
  world(on, [SLUG])
  const ui = await mount($)
  await run($, IMPLEMENT_COMMAND, SLUG)
  await spawn($, BUILD, prompt(BETA), BETA)
  expect(await squares(ui)).toEqual([DIM, WARNING, DIM])
  expect(await line(ui)).toMatch(new RegExp(`${SPINNER.source} ${BETA} 0:00$`))
})

test('the time advances, later agents add a count, and the spinner goes when all end', async ($, on) => {
  const { clock } = world(on, [SLUG])
  const ui = await mount($)
  await run($, IMPLEMENT_COMMAND, SLUG)
  await spawn($, BUILD, prompt(ALPHA), ALPHA)
  await clock.advance(65_000)
  expect(await line(ui)).toMatch(new RegExp(` ${ALPHA} 1:05$`))
  await spawn($, `${PLUGIN}:${EVALUATE}`, EVALUATE, EVALUATE)
  expect(await line(ui)).toMatch(new RegExp(` ${ALPHA} 1:05 \\+1$`))
  await end($, ALPHA)
  await clock.advance(5_000)
  expect(await line(ui)).toMatch(new RegExp(`${SPINNER.source} ${EVALUATE} 0:05$`))
  await end($, EVALUATE)
  expect(await line(ui)).not.toMatch(SPINNER)
})

test('a square turns built once its builder ends, building again while a relaunched builder runs, and a main-loop Bash run changes nothing', async ($, on) => {
  world(on, [SLUG])
  const ui = await mount($)
  await run($, IMPLEMENT_COMMAND, SLUG)
  await spawn($, BUILD, prompt(BETA), BETA)
  expect(await squares(ui)).toEqual([DIM, WARNING, DIM])
  await end($, BETA)
  expect(await squares(ui)).toEqual([DIM, SUCCESS, DIM])
  expect(await line(ui)).toMatch(/ 1\/3$/)
  await bash($)
  expect(await squares(ui)).toEqual([DIM, SUCCESS, DIM])
  await spawn($, BUILD, prompt(BETA), RELAUNCH)
  expect(await squares(ui)).toEqual([DIM, WARNING, DIM])
  expect(await line(ui)).toMatch(new RegExp(` 0/3 · ${SPINNER.source} ${BETA} 0:00$`))
  await end($, RELAUNCH)
  expect(await squares(ui)).toEqual([DIM, SUCCESS, DIM])
})

test('two build agents spawned at the same moment both count', async ($, on) => {
  world(on, [SLUG])
  const ui = await mount($)
  await run($, IMPLEMENT_COMMAND, SLUG)
  await Promise.all([spawn($, BUILD, prompt(ALPHA), ALPHA), spawn($, BUILD, prompt(BETA), BETA)])
  expect(await squares(ui)).toEqual([WARNING, WARNING, DIM])
  expect(await line(ui)).toMatch(/ \+1$/)
})

test('off, on and a bare /craft:bar answer a line, hide, show and switch the line, and keep it in the store', async ($, on) => {
  world(on, [SLUG], { [HIDDEN]: true })
  const ui = await mount($)
  await run($, PLAN_COMMAND, SLUG)
  expect(await line(ui)).toBeUndefined()
  const shown = PLANNING
  expect((await run($, BAR, 'on')).text).toMatch(/on\.$/)
  expect(await line(ui)).toBe(shown)
  expect((await run($, BAR, 'off')).text).toMatch(/off\.$/)
  expect(await line(ui)).toBeUndefined()
  expect((await run($, BAR)).text).toMatch(/on\.$/)
  expect(await line(ui)).toBe(shown)
  expect((await run($, BAR)).text).toMatch(/off\.$/)
  expect(await line(ui)).toBeUndefined()
})

test('a survey leaves only the engine drawing', async ($, on) => {
  world(on, [SLUG])
  await run($, PLAN_COMMAND, SLUG)
  const ui = await mount($, true)
  expect(await line(ui)).toBeUndefined()
  expect(await ui.drawn()).toEqual({ type: TEXT, children: [ENGINE] })
})
