export const TONE = {
  label: 'label',
  slug: 'slug',
  phase: 'phase',
  built: 'built',
  building: 'building',
  waiting: 'waiting',
  dim: 'dim',
  plain: 'plain',
} as const

export type Tone = (typeof TONE)[keyof typeof TONE]

type Square = typeof TONE.built | typeof TONE.building | typeof TONE.waiting

export type Piece = { text: string; tone: Tone }

export type Agent = { id: string; name: string; slice?: string; startedAt: number }

export type State = {
  isActive: boolean
  phase?: string
  slug?: string
  before: string[]
  slices: string[]
  agents: Agent[]
  ended: string[]
}

export const IMPLEMENT = 'implement'
const EMPTY = ''

const PREFIX = 'craft:'
const BUILD = `${PREFIX}build`
const PHASES = ['shape', 'plan', IMPLEMENT, 'try', 'close']
const HEADING = '### '
const WORK_PATH = /(?:^|\/)docs\/craft\/([^/\s]+)/
const FRAMES = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
const FRAME_MS = 250
const SPACE = ' '
const SEPARATOR = ' · '
const NEWLINE = '\n'
const GLYPHS: Record<Square, string> = { built: '■', building: '▣', waiting: '□' }

export function initialState(): State {
  return { isActive: false, before: [], slices: [], agents: [], ended: [] }
}

export function commandPhase(command: string): string | undefined {
  const name = command.slice(PREFIX.length)
  return command.startsWith(PREFIX) && PHASES.includes(name) ? name : undefined
}

export function slugFromArgs(args: string, names: string[]): string | undefined {
  const first = args.trim().split(/\s+/)[0] ?? EMPTY
  const word = WORK_PATH.exec(first)?.[1] ?? first
  return names.includes(word) ? word : undefined
}

export function newFolder(before: string[], after: string[]): string | undefined {
  const added = after.filter(name => !before.includes(name))
  return added.length === 1 ? added[0] : undefined
}

export function startPhase(state: State, phase: string, args: string, names: string[]): State {
  const slug = slugFromArgs(args, names)
  const work = slug !== undefined && slug === state.slug ? state : { ...initialState(), agents: state.agents }
  return { ...work, isActive: true, phase, slug, before: names }
}

export function findSlug(state: State, names: string[]): State {
  return state.slug === undefined ? { ...state, slug: newFolder(state.before, names) } : state
}

function headingName(line: string): string {
  return line.slice(HEADING.length).trim()
}

export function parseSlices(text: string): string[] {
  return text
    .split(NEWLINE)
    .filter(line => line.startsWith(HEADING))
    .map(headingName)
}

export function withSlices(state: State, text: string): State {
  return { ...state, slices: parseSlices(text) }
}

export function addAgent(state: State, type: string, prompt: string, id: string, now: number): State {
  const heading = prompt.split(NEWLINE).find(line => line.startsWith(HEADING))
  const slice = type === BUILD && heading !== undefined ? headingName(heading) : undefined
  const agent: Agent = { id, name: slice ?? type.slice(PREFIX.length), slice, startedAt: now }
  return { ...state, isActive: true, agents: [...state.agents, agent] }
}

export function endAgent(state: State, id: string): State {
  const agent = state.agents.find(each => each.id === id)
  if (!agent) return state
  const agents = state.agents.filter(each => each.id !== id)
  if (agent.slice === undefined) return { ...state, agents }
  return { ...state, agents, ended: [...state.ended, agent.slice] }
}

function sliceTone(state: State, slice: string): Square {
  if (state.agents.some(agent => agent.slice === slice)) return TONE.building
  return state.ended.includes(slice) ? TONE.built : TONE.waiting
}

function elapsed(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function pieces(state: State, now: number): Piece[] {
  if (!state.isActive) return []
  const line: Piece[] = [{ text: PREFIX.slice(0, -1), tone: TONE.label }]
  if (state.slug !== undefined) line.push({ text: SPACE, tone: TONE.dim }, { text: state.slug, tone: TONE.slug })
  if (state.phase !== undefined) line.push({ text: SEPARATOR, tone: TONE.dim }, { text: state.phase, tone: TONE.phase })
  if (state.phase === IMPLEMENT && state.slices.length > 0) {
    const tones = state.slices.map(slice => sliceTone(state, slice))
    const built = tones.filter(tone => tone === TONE.built).length
    line.push({ text: SEPARATOR, tone: TONE.dim })
    line.push(...tones.map(tone => ({ text: GLYPHS[tone], tone })))
    line.push({ text: `${SPACE}${built}/${tones.length}`, tone: TONE.plain })
  }
  const [oldest, ...others] = state.agents
  if (oldest) {
    const frame = FRAMES[Math.floor(now / FRAME_MS) % FRAMES.length] ?? EMPTY
    line.push({ text: SEPARATOR, tone: TONE.dim }, { text: frame, tone: TONE.building }, { text: SPACE, tone: TONE.dim })
    line.push({ text: oldest.name, tone: TONE.slug }, { text: `${SPACE}${elapsed(now - oldest.startedAt)}`, tone: TONE.dim })
    if (others.length > 0) line.push({ text: `${SPACE}+${others.length}`, tone: TONE.dim })
  }
  return line
}
