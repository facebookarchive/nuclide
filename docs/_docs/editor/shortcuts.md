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

## Files

Whether switching between or searching for or within files, there are some keyboard shortcuts to
help accomplish file tasks a bit faster.

| Key (Mac) | Key (Linux) | Command | Description |
|-----------|-------------|---------|-------------|
| `cmd-t` | `ctrl-t` | `nuclide-quick-open:find-anything-via-omni-search` | Use this for a global search of anything within your project, including all files, currently open files, etc. |
| `option-cmd-o` | `alt-ctrl-o` | `nuclide-open-filenames-provider:toggle-provider` | This lets you switch between files that are currently open in the editor. Useful if you have a bunch of files open and you want quick access to them. |
| `option-cmd-r` | `alt-ctrl-r` | `nuclide-recent-files-provider:toggle-provider` | This will show you files that you have recently opened and used in previous sessions of Nuclide.  |
| `option-cmd-t`| `alt-ctrl-t` | `nuclide-fuzzy-filename-provider:toggle-provider` | This allows you to search for files based on patterns. |            
| `option-cmd-n`| `alt-ctrl-n` | `nuclide-related-files:jump-to-next-related-file` | Find files related to the current file. A file is related if they have the same basename, but a different extension, for example. |


## Debugger

The Nuclide debugger attaches to a running process. The UI is built upon the Chrome Developer Tools
UI. Breakpoints are managed in the gutter to the left of your code and line numbers.

| Key (Mac) | Key (Linux) | Command | Description |
|-----------|-------------|---------|-------------|
| `option-cmd-I` | `alt-ctrl-I` | `window:toggle-dev-tools` | Toggle the developer tools UI. |
| `shift-cmd-Y` | `shift-ctrl-Y` | `nuclide-debugger:toggle` | Toggles the process attachment UI where you will choose the process on which you would like to debug (e.g., a Node process, etc.) |
| `f8` | `f8` | `nuclide-debugger:continue-debugging` | After stopping at a breakpoint, and possibly stepping throughout code, this will enable debugging to continue to the next breakpoint or end of the process. |
| `f9` | `f9` | `nuclide-debugger:toggle-breakpoint` | If a breakpoint is set, this will unset that breakpoint; and vice-versa. |
| `f10` | `f10` | `nuclide-debugger:step-over` | Step over a piece of code. For example, if you are stopped at a method call, this will execute that method without stepping through it line-by-line. |
| `f11` | `f11` | `nuclide-debugger:step-into` | Step into a piece of code. For example, if you are stopped at a method call, this will go into the first line of that method. |
| `shift-f11` | `shift-f11` | `nuclide-debugger:step-out` | If you have stepped into a piece of code, this will step out to the point on which you entered that piece of code. For example, if you stepped into a method, this will step out back to the method call itself. |
| `shift-f5` | `shift-f5` | `nuclide-debugger:stop-debugging` | Stop the actual debugging process. |

## Editor Panes

These are keyboard shortcuts with respect to moving currently active files in the editor around the
main panes.

| Key (Mac) | Key (Linux) | Command | Description |
|-----------|-------------|---------|-------------|
| `cmd-k-down` | `ctrl-k-down` | `nuclide-move-pane:move-tab-to-new-pane-down` | Moves the currently active file in the editor to a bottom pane. |
| `cmd-k-right` | `ctrl-k-right` | `nuclide-move-pane:move-tab-to-new-pane-right` | Moves the currently active file in the editor to a right pane. | |
| `cmd-k-up` | `ctrl-k-up` | `nuclide-move-pane:move-tab-to-new-pane-up` | Moves the currently active file in the editor to a top pane. | |
| `cmd-k-left` | `ctrl-k-left` | `nuclide-move-pane:move-tab-to-new-pane-left` | Moves the currently active file in the editor to a left pane. |

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
