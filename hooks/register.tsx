import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { sceneAt } from './scene'

const PLUGIN = 'night-bench'
const COMMAND = 'night-bench'
// Kept across sessions: true where the person turned the scene off. Absent, it is on.
const OFF_KEY = 'off'
// The picture is drawn anew only when the context window's fill crosses one of these steps, so the aurora's sway is
// not started over at every small change.
const STEP = 2

// A light veil and almost no blur: the stars are a point or two wide, and frosting erases them.
const LOOK: ThemeSetArgs = {
  backdrop: { scene: PLUGIN, glass: { blur: 2, tint: '#0b1120', opacity: 0.4 } },
  overrideColorScheme: 'dark',
}

// Whether a window has drawn the scene in this session. A session that starts with no window attached tries once more.
let isShown = false
// The context window's fill, 0 to 100, rounded down to a step. The moon and the snow line follow it.
let percent = 0

function stepOf(value: number): number {
  return Math.floor(Math.min(100, Math.max(0, value)) / STEP) * STEP
}

async function show($: EngineInterface): Promise<string> {
  try {
    const set = await $.theme.set(LOOK)

    isShown = set.isDrawn

    return set.isDrawn
      ? `Night bench is on. The moon and the snow line show the context window: ${percent}% full.`
      : `Night bench is set, but this window does not draw it: ${set.reason}`
  } catch (error) {
    return `Night bench could not be set: ${String(error)}`
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: COMMAND, description: 'The night bench backdrop: "on", "off", or nothing to show it again.' })

    try {
      percent = stepOf((await $.session.usage()).context.percent ?? 0)
    } catch {
      percent = 0
    }

    if ((await $.store.get(OFF_KEY)) !== true) {
      await show($)
    }

    return next(e)
  })

  // One more try at the first turn, for a session whose window was not attached at its start.
  on('prompt.submit', async ($, e, next) => {
    // Its own fault must never cost the person their prompt.
    try {
      if (!isShown && (await $.store.get(OFF_KEY)) !== true) {
        isShown = true
        await show($)
      }
    } catch {
      isShown = true
    }

    return next(e)
  })

  // The context window was measured: move the moon and the snow line when the fill crosses a step.
  on('session.measure', ($, e, next) => {
    const now = stepOf(e.context.percent ?? percent)

    if (now !== percent) {
      percent = now
      $.ui.invalidate('ui.render')
    }

    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    const word = e.args.trim().toLowerCase()

    if (word === 'off') {
      await $.store.set(OFF_KEY, true)
      await $.theme.clear()

      return { text: 'Night bench is off in every session from now on. /night-bench on brings it back.' }
    }

    await $.store.set(OFF_KEY, false)

    return { text: await show($) }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.props.plugin !== PLUGIN || e.surface !== 'desktop') {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    return (
      <Svg
        source={sceneAt(percent)}
        alt={`Northern lights over a snow peak in Alaska, a cabin with a lit window on the slope. The moon and the snow line show the context window, ${percent}% full`}
      />
    )
  })
}
