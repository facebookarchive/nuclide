# nuclide-move-item-to-available-pane

This package provides alternative functionality for moving items across panes.

## The Problem

By default, Atom has four commands for moving pane items (or really sixteen, when you consider it
has one for each of the cardinal directions):

* `pane:split-{right,up,down,left}-and-copy-active-item`
* `pane:split-{right,up,down,left}-and-move-active-item`
* `window:copy-active-item-to-pane-{above,below,on-left-on-right}`
* `window:move-active-item-to-pane-{above,below,on-left-on-right}`

For historical reasons, `pane:split-{direction}-and-copy-active-item` is bound to
`cmd-k {direction}` by default on OS X (or `ctrl-k {direction}` on Windows and Linux) in Atom, even
though `move-active-item` seems to be a more common operation, in practice.
None of the other three commands has a default keybinding in Atom.

The issue is that, assuming you want to stick to a two or three column layout, you likely want to
start by splitting the original pane into two or three panes, and once you have those set up, you
want to move items across panes. If you want to do all of this using keyboard shortcuts, you have
to set up a second set of keybindings for the `move-active-item` commands, and then you have to
remember when to fire the appropriate command.

## The Solution

The goal of `nuclide-move-item-to-available-pane` is to provide one set of commands/keybindings that
accommodates both scenarios gracefully. The new commands introduced by this package are:

```
nuclide-move-item-to-available-pane:right
nuclide-move-item-to-available-pane:left
nuclide-move-item-to-available-pane:up
nuclide-move-item-to-available-pane:down
```

The idea is that the command will move the active item "through" the pane in the specified
direction. For example, suppose you have two panes, each with two items, the leftmost of which has
focus:

```
[A*, B] [C, D]
```

If you fire off `nuclide-move-item-to-available-pane:right`, `A` will be moved into the right pane:

```
[B] [C, D, A*]
```

If you fire off `nuclide-move-item-to-available-pane:right` again, `A` will continue its rightward
journey and put itself in a new pane:

```
[B] [C, D] [A*]
```

However, if you fire it a third time, nothing will happen because there is no rightward pane to move
to, and there is no point in splitting again because it is already a singleton.

Conversely, you can move it back "through" the panes in the other direction by firing
`nuclide-move-item-to-available-pane:left`. The first application of the command would return you to
this state:

```
[B] [C, D, A*]
```

Applying it yet again would yield:

```
[B, A*] [C, D]
```

And once more:

```
[A*] [B] [C, D]
```

By using the metaphor of moving an item "through" panes, we have one command that can be used to
select whether to split a pane or move an item in an intelligent way.

## Adding keybindings for nuclide-move-item-to-available-pane

To override the default keybindings for this behavior in Atom,
add the following to your `~/.atom/keymap.cson`:

```coffee
'.platform-darwin atom-text-editor':
  'cmd-k right': 'nuclide-move-item-to-available-pane:right'
  'cmd-k left': 'nuclide-move-item-to-available-pane:left'
  'cmd-k up': 'nuclide-move-item-to-available-pane:up'
  'cmd-k down': 'nuclide-move-item-to-available-pane:down'

'.platform-win32 atom-text-editor, .platform-linux atom-text-editor':
  'cmd-k right': 'nuclide-move-item-to-available-pane:right'
  'cmd-k left': 'nuclide-move-item-to-available-pane:left'
  'cmd-k up': 'nuclide-move-item-to-available-pane:up'
  'cmd-k down': 'nuclide-move-item-to-available-pane:down'
```
