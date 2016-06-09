---
pageid: feature-quick-open
title: Quick Open
layout: docs
permalink: /docs/features/quick-open/
---

Nuclide goes beyond just normal file opening capabilities. `Quick Open` provides multiple
mechanisms to find a file, from recently opened files to a global omnisearch that lets you search
for anything a file might contain.

* TOC
{:toc}

## Toggling

There are three ways to toggle the `Quick Open` window.

- `cmd-T` (`ctrl-T` on Linux) keyboard shortcuts.
- [Command palette](/docs/editor/basics/#command-palette) searching for
`Nuclide Quick Open: Find Anything Via Omni Search`.
- [Quick Launch](docs/quick-start/getting-started/#quick-launch-menu) menu.

![](/static/images/docs/feature-quick-open-toggle-window.png)

> The `Hack Symbols` pane will only show if you have [Hack](/docs/languages/hack) files in your
> project.

## Omnisearch

*Keyboard Shortcuts*: `cmd-T` or `cmd-P` (`ctrl-T`, `ctrl-P` on Linux)

When launching the `Quick Open` window, you will be taken to the Omnisearch pane. All of the
features of the other panes are coalesced and condensed into your search results in this window.

![](/static/images/docs/feature-quick-open-omnisearch.png)

## Filenames

*Keyboard Shortcut*: `option-cmd-T` (`alt-ctrl-T` Linux)

If you just want to search by filename (including within the path to the file) only, you can click
on the `Filenames` pane in the `Quick Open` window.

![](/static/images/docs/feature-quick-open-filenames.png)

## Open Files

*Keyboard Shortcut*: `option-cmd-O` (`alt-ctrl-O` Linux)

If you have a lot of files open in your [editor](/docs/editor/basics), you can use the `Open Files`
pane of `Quick Open` to quickly scan a list of your currently open files.

![](/static/images/docs/feature-quick-open-open-files.png)

## Recent Files

*Keyboard Shortcut*: `option-cmd-R` (`alt-ctrl-R` Linux)

If you have recently closed a file, and would like to quickly open it back up, you can use the
`Recent Files` pane of `Quick Open`. There is even an indication on when you last opened the file.

![](/static/images/docs/feature-quick-open-toggle-recent-files.png)

## Hack Symbols

*Keyboard Shortcut*: `option-cmd-Y` (`alt-ctrl-Y` Linux)

If your project contains [Hack](/docs/languages/hack) code, you will get Hack language-specific
search options. Here you can search based on function (`@function-name`), class (`#class-name`), or
constant (`%constant-name`) symbols in your project.

To access this feature, click on the `Hack Symbols` pane in the `Quick Open` window.  

![](/static/images/docs/feature-quick-open-toggle-hack-symbols.png)
