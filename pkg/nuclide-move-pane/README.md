# nuclide-move-pane

Overrides the default behavior of `ctrl-k <arrow-key>` in Atom (`cmd-k` on OS X).

Instead of creating a copy of the current editor in its own pane and panel,
it *moves* the current editor to its own pane and panel in the direction specified by the arrow key.
We believe that this is the behavior that most Atom users want by default,
and this avoids the overhead of going back to the previous pane and
closing the original editor to achieve this effect.

**If you are a Nuclide user and you do not like this behavior**, then simply disable the
"nuclide-move-pane" feature in the settings page for the "nuclide" Atom package.

**If you would like to have this behavior, but would prefer not to override the default shortcut in
Atom**, then declare your own shortcuts in `~/.atom/keymap.cson` as you would for any keyboard
shortcut customization. For example, if you wanted the shortcut to require the `shift` key when
pressing the arrow to distinguish it from the default shortcut, add the following to your
`~/.atom/keymap.cson`:

```coffee
'.platform-darwin atom-workspace':
  'cmd-k shift-up': 'nuclide-move-pane:move-tab-to-new-pane-up'
  'cmd-k shift-down': 'nuclide-move-pane:move-tab-to-new-pane-down'
  'cmd-k shift-left': 'nuclide-move-pane:move-tab-to-new-pane-left'
  'cmd-k shift-right': 'nuclide-move-pane:move-tab-to-new-pane-right'

'.platform-win32 atom-workspace, .platform-linux atom-workspace':
  'ctrl-k shift-up': 'nuclide-move-pane:move-tab-to-new-pane-up'
  'ctrl-k shift-down': 'nuclide-move-pane:move-tab-to-new-pane-down'
  'ctrl-k shift-left': 'nuclide-move-pane:move-tab-to-new-pane-left'
  'ctrl-k shift-right': 'nuclide-move-pane:move-tab-to-new-pane-right'
```
