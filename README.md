# esa17-layouts

The on-screen graphics used during European Speedrunner Assembly 2017.

This is a NodeCG bundle that works alongside the [nodecg-speedcontrol](https://github.com/speedcontrol/nodecg-speedcontrol) bundle. Originally developed/tested to work with NodeCG v0.8.9, it now works on NodeCG v9.

Some elements of the layouts, including the music player component also require OBS Studio Browser Source v1.30 or higher to pause/unpause music while not on the scenes with it in, or do other things on layout switches; this should be included with OBS Studio now but if it's not, it's available from [the releases page on the obs-browser repo](https://github.com/kc5nra/obs-browser/releases).

- `npm install nodecg-cli` and install NodeCG.
- `nodecg install speedcontrol/nodecg-speedcontrol` to install the master version of nodecg-speedcontrol.
- `nodecg install esamarathon/esa17-layouts` to install this layout bundle.

A config file `esa17-layouts.json` can be made and contain this:

```
{
	"secondStream": true
}
```

If `"secondStream"` is set to `true`, then certain parts of the code change things that display on the layout so they are more relevant. Default is `false`.