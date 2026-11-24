# night-bench

An animated backdrop for the Claude desktop app's Code tab: northern lights over a snow peak in Alaska, spruce on the slope, and a cabin with a lit window. It doubles as a gauge for the session's context window.

## Reading the scene

- **The moon** rises over the left shoulder peak when the context window is empty, crosses the sky as it fills, and sets behind the great peak when it is full.
- **The snow line** starts as caps on the summits and creeps down both mountains, reaching their feet at 100%.
- **The ground** whitens over the last half.

After a compaction the moon drops back and the snow retreats. The picture is redrawn only when usage crosses a 2% step, so the aurora's slow sway is not restarted at every small change.

## Install

At the prompt of a terminal session:

```
/plugin install night-bench --marketplace thezolon/night-bench
```

Answer `y` to add the marketplace, then pick a scope (the user scope loads it in every session).

From a shell:

```
claude plugin install night-bench --marketplace thezolon/night-bench
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `thezolon/night-bench`, then Add plugin.

## Use

- The scene shows by itself when a session starts.
- `/night-bench` shows it again and prints how full the context window is.
- `/night-bench off` turns it off in every session; `/night-bench on` brings it back.

## What it needs

- A Claude desktop app that draws a mod's backdrop behind the chat. The terminal and editors draw none.
- On Windows, **Settings > Accessibility > Visual effects > Transparency effects** must be on. With it off, the app draws its panels solid and only a flat tint shows.
- The scene is made for a dark window and asks the app for dark mode.

Only one theme shows in a session at a time, so another backdrop mod that sets its theme later takes this one's place.

## What it does not do

It reads one number, how full the session's context window is, and nothing of your prompts or files. It stores one flag across sessions: whether you turned the scene off. It sends nothing anywhere.

## Changing the artwork

The picture is generated. `tools/gen.js` writes `hooks/scene.ts` and a preview page showing the scene at 0%, 35%, 70% and 100%:

```
node tools/gen.js hooks/scene.ts preview.html
```

Serve `preview.html` from a local web server to look at it, then reload the mod.

## License

MIT. See the LICENSE file.
