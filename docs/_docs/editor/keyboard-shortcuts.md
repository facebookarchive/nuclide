---
pageid: editor-keyboard-shortcuts
title: Keyboard Shortcuts
layout: docs
permalink: /docs/editor/keyboard-shortcuts/
---

You can perform many tasks in Nuclide from the keyboard. Below are the various keyboard shortcuts
available for the sets of functionality that Nuclide has to offer.

> Atom has many more keyboard shortcuts available above and beyond what Nuclide offers. To
> get a complete list of the keybindings, you can go to
> `Packages | Settings View | Show Keybindngs`.

> You can create your own [custom keybindings](/docs/advanced-topics/custom-keybindings) beyond
> those Nuclide provides.

<br/>

* TOC
{:toc}


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

These are also described in their respective sections below, but this provides a quick access table
for the most common shortcuts provided by Nuclide.

| Key (Mac) | Key (Linux) | Description |
|-----------|-------------|-------------|
| `cmd-t` | `ctrl-t` | Use omnisearch to open files, etc. |
| `cmd-\` | `ctrl-\` | Toggle the file tree. |
| `ctrl-0` | `ctrl-0` | Toggle between the editor and the file tree. |
| `cmd-k-<arrow>` | `ctrl-k-<arrow>` | Split the current file to the pane represented by `<arrow>`, where `<arrow>` is the down, up, left or right arrow. |
| `option-shift-cmd-D` | `alt-shift-ctrl-D` | Open the diff view. |
| `option-shift-D` | `alt-shift-D` | Open the code diagnostics window. |

## Development

These shortcuts provide quick access to development features such as diff view, diagnostics
(e.g, linting), etc.

| Key (Mac) | Key (Linux) | Command | Description |
|-----------|-------------|---------|-------------|
| `option-shift-cmd-D` | `alt-shift-ctrl-D` | `nuclide-diff-view:open` | This will open the diff view, which shows you the difference between the original version of a file and the current version of the file on which changes were made. |
| `option-shift-cmd-F` | `alt-shift-ctrl-F` | `nuclide-find-references:activate` | In projects such as Hack or Flow, this will allow you to find all the references to a selected, highlighted entity in your project. |
| `option-shift-D` | `alt-shift-D` | `nuclide-diagnostics-ui:toggle-table`  | Display the window showing you messages about your code. Possible messages include lint, compiler errors, etc. |
| `option-shift-A` | `option-shift-A` | `nuclide-diagnostics-ui:fix-all-in-current-file` | Nuclide can fix certain types of problems for you automatically, including various lint problems. This will allow all those to be fixed in the current file. |
| `option-cmd-y` | `alt-cmd-y` | `nuclide-hack-symbol-provider:toggle-provider` | Allows you to search for Hack function, classes and constants within you Hack project.
| `cmd-shift-i` | `ctrl-shift-i` | `nuclide-format-js:format` | Automatically tries to insert missing `require` and `import` statements to your Flow or JavaScript project.
| `option-O`| `alt-O` | `nuclide-outline-view:toggle` | Toggles the [outline view](/docs/features/outline-view/) for a supported file so you can easily navigate to class and function definitions.

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
| `cmd-|` | `ctrl-|` | `reveal-active-file` | Shows the file that is currently active in the main workspace in the file tree. | | `cmd-shift-\` (Mac) or  `ctrl-shift-\` (Linux)
| `ctrl-O` | `ctrl-O` | `toggle-focus` | Toggles the focus of the current active file. | |

## Files

Whether switching between or searching for or within files, there are some keyboard shortcuts to
help accomplish file tasks a bit faster.

| Key (Mac) | Key (Linux) | Command | Description | Alternative |
|-----------|-------------|---------|-------------|-------------|
| `cmd-t` | `ctrl-t` | `nuclide-quick-open:find-anything-via-omni-search` | Use this for a global search of anything within your project, including all files, currently open files, etc. | `cmd-p` (Mac) or `ctrl-p` (Linux) |
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

## Miscellaneous

These are other key-based shortcuts that are included with Nuclide, including hyperclick, clipboard
and Nuclide health actions.

| Key (Mac) | Key (Linux) | Command | Description |
|-----------|-------------|---------|-------------|
| `option-cmd-enter` | `alt-ctrl-enter` | `hyperclick:confirm-cursor` | When using hyperclick, this will confirm the hyperclick action you want to take. |
| `ctrl-option-shift-H` | `ctrl-alt-shift-H` | `nuclide-health:toggle` | Toggle the Nuclide health tab, which show details about the Nuclide process itself (how much CPU, memory is being used, etc.). |
| `ctrl-option-shift-X` | `ctrl-alt-shift-X` | `nuclide-clipboard-path:copy-project-relative-path` | Copy the relative path of the current file to the clipboard. |
| `ctrl-shift-X` | `ctrl-shift-X` | `nuclide-clipboard-path:copy-absolute-path` | Copy the absolute path of the current file to the clipboard. |
| `ctrl-option-X` | `ctrl-alt-X` | `nuclide-clipboard-path:copy-repository-relative-path` | Copy the relative path of the current file starting at the root of the Mercurial repository. |
