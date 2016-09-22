---
pageid: editor-uninstall
title: Uninstalling
layout: docs
permalink: /docs/editor/uninstall/
---

To uninstall Nuclide, you run the Atom package manager uninstall command at the command-line:

```bash
$ apm uninstall nuclide
```

> If you have a version of Nuclide prior to 0.0.35, you will need to follow a
> [different process](/docs/help/troubleshooting#uninstalling-older-versions-of-nuclide) to
> uninstall Nuclide.

## Re-activate Disabled Core Packages

Nuclide replaces Atom's `tree-view` package in order to support remote file systems. When
uninstalling Nuclide, you need to re-activate the `tree-view` package yourself. The following are
two ways to do that:

* Re-activate the `tree-view` package through Atom's Settings page.

  1. Go to `Atom | Preferences` and select **Packages** from the list at the left.
  2. Scroll down to find the `tree-view` package listed under **Core Packages**, or type "tree-view" into the search box.
  3. Click the **Enable** button.

    ![](/static/images/docs/editor-uninstall-reenable-atom-tree-view.png)

* Edit your Atom `config.cson` file.

  1. Open `~/.atom/config.cson`.
  2. Remove "tree-view" from the array of `disabledPackages` and save the file.

     ```coffeescript
     "*":
       core:
         disabledPackages: [
           "tree-view" # REMOVE THIS LINE
         ]
     ```
