---
pageid: feature-toolbar
title: Toolbar
layout: docs
permalink: /docs/features/toolbar/
---

Nuclide customizes the [tool-bar community Atom package](https://atom.io/packages/tool-bar) for its
specific use. The toolbar provides quick launch access to many common Nuclide features including
the debugger, diff view, diagnostics, etc.

By default, the toolbar is not installed.

> Internally to Facebook the toolbar is installed by default. However, at this point, we did not
> want to presume to install other community packages without the user opting in.

* TOC
{:toc}

## Installing

The toolbar can be installed as part of installing the
[recommended packages](/docs/editor/setup/#post-installation__recommended-packages) through the
Nuclide package settings or it can be installed separately through the normal Atom package
installation process.

### Singular package

If you would prefer not to have all of the recommended Nuclide packages installed, you can install
the toolbar separately.

Go to `Packages | Settings View | Install Packages/Themes`. In the `Search packages` textbox, type
`tool-bar`.

![](/static/images/docs/feature-toolbar-find-package.png)

Click `Install`.

The toolbar will be added to your Nuclide environment (normally either at the top or the left-hand
side of your Atom window).

### Toggling

You can toggle the tool bar either through `Packages | Tool Bar | Toggle` or using `cmd-option-T`
(`ctrl-alt-T`) on Linux.

## Buttons

The toolbar has buttons that, when clicked, take you to a specific feature of Nuclide.

![](/static/images/docs/feature-toolbar-buttons.png)

- ![](/static/images/docs/feature-toolbar-button-nuclide-settings.png) Show the Nuclide settings view.
- ![](/static/images/docs/feature-toolbar-button-nuclide-health.png) Toggle the Nuclide health statistics.
- ![](/static/images/docs/feature-toolbar-button-debugger.png) Toggle the debugger.
- ![](/static/images/docs/feature-toolbar-button-diagnostics.png) Toggle the diagnostics window.
- ![](/static/images/docs/feature-toolbar-button-diff-view.png) Toggle diff view.
- ![](/static/images/docs/feature-toolbar-button-outline-view.png) Toggle outline view.
- ![](/static/images/docs/feature-toolbar-button-test-runner.png) Toggle the test runner.
- ![](/static/images/docs/feature-toolbar-button-buck-toolbar.png) Toggle the Buck toolbar.
- ![](/static/images/docs/feature-toolbar-button-hhvm-toolbar.png) Toggle the HHVM toolbar.
- ![](/static/images/docs/feature-toolbar-button-distraction-free-mode.png) Toggle distraction free mode.

## Uninstalling

You can uninstall the toolbar by following the normal Atom package uninstall mechanism via
`Packages | Settings View | Update Packages/Themes` and clicking `Uninstall` under the `Tool-bar`
package.

> If you [uninstall Nuclide](/docs/editor/uninstall/), the tool-bar is *not* uninstalled.
