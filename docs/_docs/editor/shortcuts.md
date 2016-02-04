---
id: shortcuts
title: Keyboard Shortcuts
layout: docs
permalink: /docs/editor/shortcuts/
---

As Nuclide is built on Atom, you may also want to peruse
[their Getting Started docs](https://atom.io/docs/latest/getting-started).

To open a file in Nuclide, hit `⌘-p`, which will open a file finder dialog that does fuzzy
matching on your input against file paths. This basically acts as an autocomplete for what you
type, though it has some tolerance for misspellings.

To split editor panes in Nuclide, hit `⌘-k <arrow>` to split in the direction of arrow (i.e., ←,
↑, →, or ↓). You will no longer be constrained to two panes as you are in Xcode! You can navigate
between editor panes in Nuclide with `⌘-k ⌘-<arrow>`. You can also use `⌘-k ⌘-n` or `⌘-k ⌘-p`
to focus the next or previous pane, respectively.

To toggle the file tree view, hit `⌘-\`. Use `ctrl-0` to toggle focus between the tree view and
your editor.

To see what other commands Nuclide supports, hit `⌘-shift-p`. This performs fuzzy matching on your
input to match commands that Nuclide can perform. As you can see, this also reveals whether there
is already a keyboard shortcut associated with the command. For example, if you type focus as your
query, you can see all of the commands associated with changing focus in Nuclide.

To add your own keybindings for Nuclide commands, edit your ~/.atom/keymap.cson. If you aren't
familiar with CSON, it is the CoffeeScript equivalent of JSON. Here is an example
~/.atom/keymap.cson file:

```coffeescript
'.editor:not(.mini)':
  'cmd-d': 'editor:delete-line'
  'cmd-home': 'core:move-to-top'
  'cmd-end': 'core:move-to-bottom'
  'cmd-l': 'go-to-line:toggle'
```

Because CSON is a superset of JSON this could also be written as:

```coffeescript
{
   '.editor:not(.mini)': {
     'cmd-d': 'editor:delete-line',
     'cmd-home': 'core:move-to-top',
     'cmd-end': 'core:move-to-bottom',
     'cmd-l': 'go-to-line:toggle'
   }
}
```

It may not be obvious, but each key in the top-level map is a CSS selector. Values are pairs of
commands and keybindings that are applicable in an element that matches the CSS selector. The
selector .editor:not(.mini) matches an editor in Nuclide that is not used as a single-line input
text box. Therefore, when you want to add a keyboard shortcut for an editor, add it to the
.editor:not(.mini) map.
