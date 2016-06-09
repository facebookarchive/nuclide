---
pageid: editor-uninstall
title: Uninstalling
layout: docs
permalink: /docs/editor/uninstall/
---

To uninstall Nuclide, you run the simple Atom package manager command below.

```bash
$ apm uninstall nuclide
```

> If you have a version of Nuclide prior to 0.0.35, you will need to follow a
> [different process](/docs/help/troubleshooting#uninstalling-older-versions-of-nuclide) to
> uninstall Nuclide.

## Re-activate Disabled Core Packages

Nuclide replaces Atom's 'tree-view' package in order to support remote file systems. When
uninstalling Nuclide, you need to re-activate the 'tree-view' package yourself. The following are
two ways to do that:

* Re-activate through Atom's Settings page
  1. Go to `Atom > Preferences > Packages > tree-view`
  2. Click the "Enable" button
    ![](/static/images/docs/editor-uninstall-reenable-atom-tree-view.png)

* Edit your Atom 'config.cson' file
  1. Open '~/.atom/config.cson'
  2. Remove `"tree-view"` from the array of `disabledPackages` and save 'config.cson'

     ```coffeescript
     "*":
       core:
         disabledPackages: [
           "tree-view" # REMOVE THIS LINE
         ]
     ```
