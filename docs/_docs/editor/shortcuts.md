---
id: shortcuts
title: Keyboard Shortcuts
layout: docs
permalink: /docs/editor/shortcuts/
---

You can perform many tasks in Nuclide from the keyboard. Below are the various keyboard shortcuts
available for the sets of functionality that Nuclide has to offer.

> **NOTE** Atom has many more keyboard shortcuts available above and beyond what Nuclide offers. To
get a complete list of the keybindings, you can go to `Packages | Settings View | Show Keybindngs`.

## Symbols

Here is a legend of symbols that are associated with the keys shown in the keybindings.

| Key | Symbol |
| ----|--------|
| `alt` or `option` on Mac | `⌥` |
| `cmd` on Mac | `⌘` |
| `ctrl` | `^` |
| `shift` | `⇧` |
| `left` | `←` |
| `up` | `↑` |
| `right` | `→` |
| `down` | `↓` |
| `backspace` | `⌫` |

If you see a `,` in a key sequence that means *then*, as in "press this sequence, then press that
sequence".

## Common Bindings

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

## File Tree

The file tree is the left-hand side pane where a tree of all of your project files are shown.

| Key (Mac) | Key (Linux) | Command | Description | Alternative |
|-----------|-------------|---------|-------------|-------------|
| `right` | `right` | `expand-directory` | Expand the current directory. | `ctrl-]` |
| `left` | `left` | `collapse-directory` | Collapse the current directory. | `ctrl-[` |
| `option-right` | `alt-right` | `recursive-expand-directory` | Expand all the directories from the current to the final directory child. | `ctrl-alt-]` |
| `option-left` | `alt-left` | `recursive-collapse-directory` | Collapse all the directories to the top parent. | `ctrl-alt-[`
| `ctrl-{` | `ctrl-{` | `recursive-collapse-all` | Collapse the entire file tree to the root. | |
| `backspace` | `backspace` | `remove` | Remove a file or directory from the tree. You will be prompted first to avoid accidental mistakes. | `delete` |
| `cmd-\` | `ctrl-\` | `toggle` | Toggles whether the file tree is shown. | `cmd-k`, `cmd-b` |
| `home` | `home` | `move-to-top` | Move the selection to the very top of the file tree. | |
| `end` | `end` | `move-to-bottom` | Move the selection to the very bottom of the file tree. | |
| `Enter` | `Enter` | `open-selected-entry` | Opens the selected entry in the file tree. If a directory is selected, then the directory is expanded. If a file is selected, then the file is opened in the main editor window. | |
| `cmd-k-down` | `ctrl-k-down` | `open-selected-entry-down` | If a file is selected, it opens the file in the bottom pane. | |
| `cmd-k-right` | `ctrl-k-right` | `open-selected-entry-right` | If a file is selected, it opens the file in the right pane. | |
| `cmd-k-up` | `ctrl-k-up` | `open-selected-entry-up` | If a file is selected, it opens the file in the top pane. | |
| `cmd-k-left` | `ctrl-k-left` | `open-selected-entry-left` | If a file is selected, it opens the file in the left pane. | |
| `cmd-|` | `ctrl-|` | `reveal-active-file` | Shows the file that is currently active in the main workspace in the file tree. | |
| `ctrl-O` | `ctrl-O` | `toggle-focus` | Toggles the focus of the current active file. | |

## Custom Bindings

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
