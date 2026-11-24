const fs = require('fs')
const W = 1600, H = 1000
let seed = 19071959
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296
const f = n => (Math.round(n * 10) / 10).toString()
const TAU = Math.PI * 2

// stars: the upper sky, most of them still
let stars = ''
for (let i = 0; i < 95; i++) {
  const x = rnd() * W, y = rnd() * rnd() * 620, r = 0.5 + rnd() * rnd() * 1.5, o = 0.3 + rnd() * 0.6
  stars += `<circle class="t${i % 5}" cx="${f(x)}" cy="${f(y)}" r="${f(r)}" opacity="${f(o)}"/>`
}

// aurora: ribbons whose edges follow a frequency-modulated wave, the one nod to the synth bench
const ribbon = (y0, depth, amp, cycles, index, phase) => {
  const edge = u => amp * Math.sin(TAU * cycles * u + phase + index * Math.sin(TAU * 1.5 * u))
  let top = '', bottom = ''
  for (let x = -300; x <= W + 300; x += 25) {
    const u = (x + 300) / (W + 600), e = edge(u)
    top += (x === -300 ? 'M' : 'L') + x + ' ' + f(y0 + e)
    bottom = 'L' + x + ' ' + f(y0 + depth + e * 0.55 + 18 * Math.sin(TAU * 5 * u + phase)) + bottom
  }
  return top + bottom + 'Z'
}
const aurora =
  `<g class="glow">` +
  `<g class="ribbon ra"><path d="${ribbon(150, 300, 46, 1.4, 1.6, 0.4)}" fill="url(#g-green)"/></g>` +
  `<g class="ribbon rb"><path d="${ribbon(90, 260, 38, 1.9, 1.2, 2.1)}" fill="url(#g-teal)"/></g>` +
  `<g class="ribbon rc"><path d="${ribbon(230, 240, 30, 1.1, 2.0, 4.0)}" fill="url(#g-violet)"/></g>` +
  `</g>`

// a far range: a low jagged line of peaks
const range = (base, rough, step) => {
  let d = `M0 ${H}L0 ${base}`, y = base
  for (let x = step; x <= W; x += step) {
    y = base + rough * (Math.sin(x / 97) * 0.5 + Math.sin(x / 41 + 1.3) * 0.3) + (rnd() - 0.5) * rough * 0.9
    d += `L${x} ${f(y)}`
  }
  return d + `L${W} ${H}Z`
}
const far = `<path d="${range(690, 46, 32)}" fill="#18264c"/>`
const mid = `<path d="${range(760, 34, 26)}" fill="#131e40"/>`

// the mountain: one great peak right of the text, a shoulder to its left. Each is rock, then a whole coat of snow
// that the hooks module clips to the snow line of the moment.
const peakLine = 'M760 830L900 700L960 720L1040 610L1085 635L1180 440L1235 520L1270 500L1350 640L1400 620L1500 740L1600 800L1600 1000'
const peakRock = `<path d="${peakLine}L760 1000Z" fill="url(#g-rock)"/><path d="${peakLine.replace("L1600 1000", "")}" fill="none" stroke="#33457a" stroke-width="1.4" stroke-linejoin="round"/>`
const peakSnow =
  `<path d="${peakLine}L760 1000Z" fill="#8ea5da" opacity=".42"/>` +
  `<path d="M1180 440L1235 520L1270 500L1350 640L1400 620L1500 740L1600 800L1600 1000L1262 1000L1236 800L1250 700L1204 640L1212 560L1170 520Z" fill="#e6edff" opacity=".5"/>`
const shoulderLine = 'M0 800L90 760L170 780L300 640L340 668L400 600L470 700L520 684L640 790L760 840L760 1000'
const shoulderRock = `<path d="${shoulderLine}L0 1000Z" fill="url(#g-rock)"/><path d="${shoulderLine.replace("L760 1000", "")}" fill="none" stroke="#2c3c6c" stroke-width="1.4" stroke-linejoin="round"/>`
const shoulderSnow =
  `<path d="${shoulderLine}L0 1000Z" fill="#8ea5da" opacity=".42"/>` +
  `<path d="M400 600L470 700L520 684L640 790L760 840L760 1000L452 1000L436 800L446 720L414 680L420 640Z" fill="#e6edff" opacity=".56"/>`
const teeth = []
for (let i = 0; i < 64; i++) teeth.push(Math.round(rnd() * 100) / 100)

// the near slope, with spruce at both corners
const slopeLine = 'M0 900L160 872L330 884L520 930L760 962L1000 968L1240 950L1420 912L1600 880L1600 1000L0 1000Z'
const slope = `<path d="${slopeLine}" fill="#060a17"/>`
const tree = (x, y, h) => {
  const w = h * 0.34
  let d = ''
  for (let k = 0; k < 4; k++) {
    const top = y - h + k * h * 0.2, bot = top + h * 0.42, half = w * (0.45 + k * 0.2)
    d += `M${f(x)} ${f(top)}L${f(x + half)} ${f(bot)}L${f(x - half)} ${f(bot)}Z`
  }
  return d + `M${f(x - 1.5)} ${f(y - h * 0.1)}h3v${f(h * 0.1)}h-3Z`
}
let trees = ''
const groundAt = x => (x < 760 ? 878 + (x / 760) * 70 : 955 - ((x - 760) / 840) * 72)
for (let i = 0; i < 26; i++) {
  const left = i % 2 === 0
  const x = left ? 20 + rnd() * 230 : 1370 + rnd() * 220
  trees += tree(x, groundAt(x) + 14 + rnd() * 10, 46 + rnd() * 58)
}
const spruce = `<path d="${trees}" fill="#04070f"/>`

// home: a cabin on the slope, a lit window, smoke from the chimney
const cx = 372, cy = 892
const cabin =
  `<g>` +
  `<circle class="lamp" cx="${cx + 2}" cy="${cy - 8}" r="46" fill="url(#g-lamp)"/>` +
  `<path d="M${cx - 24} ${cy}V${cy - 16}L${cx - 30} ${cy - 16}L${cx} ${cy - 36}L${cx + 30} ${cy - 16}L${cx + 24} ${cy - 16}V${cy}Z" fill="#04070f"/>` +
  `<path d="M${cx + 12} ${cy - 27}v-12h7v17Z" fill="#04070f"/>` +
  `<rect class="lamp" x="${cx - 6}" y="${cy - 13}" width="10" height="9" fill="#ffc266"/>` +
  `<g fill="none" stroke="#b9c4da" stroke-linecap="round" stroke-width="2.2">` +
  `<path class="smoke s0" d="M${cx + 15} ${cy - 42}q-6 -9 0 -18q6 -9 1 -18" opacity=".3"/>` +
  `<path class="smoke s1" d="M${cx + 15} ${cy - 42}q6 -9 0 -18q-6 -9 -1 -18" opacity=".18"/>` +
  `</g></g>`

let css = ''
css += '@keyframes tw{0%,100%{opacity:1}50%{opacity:.3}}.t0{animation:tw 9s ease-in-out infinite}.t1{animation:tw 13s ease-in-out -5s infinite}'
css += '@keyframes wave{from{transform:translateX(-80px) skewX(-6deg) scaleY(.94)}to{transform:translateX(80px) skewX(6deg) scaleY(1.07)}}'
css += '.ribbon{transform-origin:50% 0;animation:wave 46s ease-in-out infinite alternate}.rb{animation-duration:64s;animation-direction:alternate-reverse}.rc{animation-duration:55s;animation-delay:-20s}'
css += '@keyframes breathe{from{opacity:.6}to{opacity:1}}.glow{animation:breathe 17s ease-in-out infinite alternate}'
css += '@keyframes lamp{from{opacity:.75}to{opacity:1}}.lamp{animation:lamp 5s ease-in-out infinite alternate}'
css += '@keyframes smoke{from{transform:translate(0,6px);opacity:0}25%{opacity:1}to{transform:translate(10px,-22px);opacity:0}}'
css += '.smoke{animation:smoke 11s ease-out infinite}.s1{animation-delay:-5.5s}'

const stops = (color, peak) =>
  `<stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".3" stop-color="${color}" stop-opacity="${peak * 0.5}"/>` +
  `<stop offset=".72" stop-color="${color}" stop-opacity="${peak}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/>`
const open =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice">` +
  `<style>${css}</style>`
const defs =
  `<linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040714"/><stop offset=".55" stop-color="#0a1330"/><stop offset=".8" stop-color="#14254a"/><stop offset="1" stop-color="#14254a"/></linearGradient>` +
  `<linearGradient id="g-green" x1="0" y1="0" x2="0" y2="1">${stops('#58e6a0', 0.5)}</linearGradient>` +
  `<linearGradient id="g-teal" x1="0" y1="0" x2="0" y2="1">${stops('#4fd0d8', 0.3)}</linearGradient>` +
  `<linearGradient id="g-violet" x1="0" y1="0" x2="0" y2="1">${stops('#a884e8', 0.26)}</linearGradient>` +
  `<radialGradient id="g-lamp"><stop offset="0" stop-color="#ffb648" stop-opacity=".5"/><stop offset="1" stop-color="#ffb648" stop-opacity="0"/></radialGradient>` +
  `<linearGradient id="g-rock" gradientUnits="userSpaceOnUse" x1="0" y1="430" x2="0" y2="900"><stop offset="0" stop-color="#22305c"/><stop offset="1" stop-color="#0c142c"/></linearGradient>` +
  `<radialGradient id="g-halo"><stop offset="0" stop-color="#f4eeda" stop-opacity=".42"/><stop offset=".35" stop-color="#f4eeda" stop-opacity=".12"/><stop offset="1" stop-color="#f4eeda" stop-opacity="0"/></radialGradient>`
const parts = {
  OPEN: open,
  DEFS: defs,
  SKY: `<rect width="${W}" height="${H}" fill="url(#g-sky)"/><g fill="#e4ecff">${stars}</g>` + aurora,
  RANGES: far + mid,
  SHOULDER_ROCK: shoulderRock,
  SHOULDER_SNOW: shoulderSnow,
  PEAK_ROCK: peakRock,
  PEAK_SNOW: peakSnow,
  SLOPE: slope,
  SLOPE_LINE: slopeLine,
  NEAR: spruce + cabin,
}

// The part that changes with the context window. Plain arithmetic, so the same text runs here for the preview and
// in the hooks module.
const BODY = `
  const fill = Math.min(100, Math.max(0, percent)) / 100

  // The moon: up over the left shoulder at an empty window, across the sky, down behind the great peak at a full one.
  const moonX = 255 + fill * 950
  const moonY = 640 - fill * 160 - 4 * 330 * fill * (1 - fill)
  const at = 'cx="' + moonX.toFixed(1) + '" cy="' + moonY.toFixed(1) + '"'
  const moon =
    '<circle ' + at + ' r="120" fill="url(#g-halo)"/>' +
    '<circle ' + at + ' r="21" fill="#f4eeda"/>' +
    '<circle cx="' + (moonX - 6).toFixed(1) + '" cy="' + (moonY - 5).toFixed(1) + '" r="5" fill="#d9d2bb" opacity=".55"/>' +
    '<circle cx="' + (moonX + 7).toFixed(1) + '" cy="' + (moonY + 6).toFixed(1) + '" r="3.4" fill="#d9d2bb" opacity=".5"/>' +
    '<circle cx="' + (moonX + 3).toFixed(1) + '" cy="' + (moonY - 10).toFixed(1) + '" r="2.2" fill="#d9d2bb" opacity=".45"/>'

  // The snow line: caps alone at an empty window, down to the foot of each mountain at a full one. A ragged edge,
  // the same teeth every time, so the snow only ever creeps.
  const peakLevel = 520 + fill * 360
  const shoulderLevel = 668 + fill * 230
  let peakEdge = ''
  let shoulderEdge = ''

  for (let i = 0; i <= 49; i++) {
    const tooth = (i % 2 === 0 ? -1 : 1) * (4 + 17 * TEETH[i])

    peakEdge = 'L' + (740 + i * 18) + ' ' + (peakLevel + tooth).toFixed(1) + peakEdge
    shoulderEdge = 'L' + i * 16 + ' ' + (shoulderLevel + tooth * 0.7).toFixed(1) + shoulderEdge
  }

  const clips =
    '<clipPath id="c-peak"><path d="M740 0L1620 0' + peakEdge + 'Z"/></clipPath>' +
    '<clipPath id="c-shoulder"><path d="M0 0L780 0' + shoulderEdge + 'Z"/></clipPath>'

  // Snow on the ground in the last half.
  const ground = Math.max(0, fill - 0.5) * 0.6
  const drift = ground > 0 ? '<path d="' + SLOPE_LINE + '" fill="#cfdcff" opacity="' + ground.toFixed(2) + '"/>' : ''

  return (
    OPEN + '<defs>' + DEFS + clips + '</defs>' + SKY + moon + RANGES +
    SHOULDER_ROCK + '<g clip-path="url(#c-shoulder)">' + SHOULDER_SNOW + '</g>' +
    PEAK_ROCK + '<g clip-path="url(#c-peak)">' + PEAK_SNOW + '</g>' +
    SLOPE + drift + NEAR + '</svg>'
  )
`
let ts = '// Generated artwork: aurora over an Alaskan mountain, a cabin on the slope. One vector picture, moved by the CSS in\n// its own style element; the moon and the snow line follow the context window.\n'
for (const [k, v] of Object.entries(parts)) ts += `const ${k} = ${JSON.stringify(v)}\n`
ts += `const TEETH: number[] = ${JSON.stringify(teeth)}\n\n/** The whole picture for a context window that is this full, 0 to 100. */\nexport function sceneAt(percent: number): string {${BODY}}\n`
fs.writeFileSync(process.argv[2], ts)

const sceneAt = new Function('percent', ...Object.keys(parts), 'TEETH', BODY)
let html = '<!doctype html><meta charset="utf-8"><body style="margin:0;background:#000;display:grid;grid-template-columns:1fr 1fr;gap:4px">'
for (const p of [0, 35, 70, 100]) {
  const svg = sceneAt(p, ...Object.values(parts), teeth)
  html += svg
    .replace('<svg ', '<svg style="width:100%;aspect-ratio:16/10;display:block" ')
    .replace(/id="([a-z]-[a-z]+)"/g, `id="$1-${p}"`)
    .replace(/url\(#([a-z]-[a-z]+)\)/g, `url(#$1-${p})`)
  if (p === 100) console.log('chars', svg.length)
}
fs.writeFileSync(process.argv[3], html)
