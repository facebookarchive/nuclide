---
id: uninstall
title: Uninstalling
layout: docs
permalink: /docs/editor/uninstall/
---

The uninstallation process for Nuclide differs depending on which version you have installed.

## Determining Installed Version

Determine which version of Nuclide you have installed with
[Atom Package Manager](https://github.com/atom/apm) (APM) from the command line.

```bash
$ apm list --no-dev --installed
```

The output will contain installed Atom packages and their versions.

```bash
/Users/foobar/.atom/packages (1)
└── nuclide@X.Y.Z
```

Your installed version is the number following either the `nuclide` package or the first package
starting with `nuclide-`. In the example above, the installed version is `X.Y.Z`.

## Uninstalling 'nuclide'

### Current Release

If you only have the package named 'nuclide' installed, uninstall it with the following command:

```bash
$ apm uninstall nuclide
```

#### Re-activate Disabled Core Packages

Nuclide replaces Atom's 'tree-view' package in order to support remote file systems. When
uninstalling Nuclide, you need to re-activate the 'tree-view' package yourself. The following are
two ways to do that:

* Re-activate through Atom's Settings page
  1. Go to `Atom > Preferences > Packages > tree-view`
  2. Click the "Enable" button
    ![](/static/images/re-enable-atom-tree-view.png)

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

### v0.0.35 and Prior

[Nuclide v0.0.35](https://github.com/facebook/nuclide/releases/tag/v0.0.35) and earlier was released
as many separate Atom packages. If you have any packages starting with `nuclide-`, you likely have
some part of <=v0.0.35 still installed.

Run the uninstall command below, which contains the full list of Nuclide's packages when they were
last released on 25 November 2015. This is safe to run even if you only have a subset of the
packages installed; `apm` will ignore any packages that are not present.

```bash
$ apm uninstall \
hyperclick \
nuclide-arcanist \
nuclide-blame \
nuclide-blame-provider-hg \
nuclide-blame-ui \
nuclide-buck-files \
nuclide-busy-signal \
nuclide-clang-atom \
nuclide-clipboard-path \
nuclide-code-format \
nuclide-code-highlight \
nuclide-debugger-atom \
nuclide-debugger-hhvm \
nuclide-debugger-lldb \
nuclide-diagnostics-store \
nuclide-diagnostics-ui \
nuclide-diff-view \
nuclide-file-tree \
nuclide-file-watcher \
nuclide-find-references \
nuclide-flow \
nuclide-format-js \
nuclide-fuzzy-filename-provider \
nuclide-hack \
nuclide-hack-symbol-provider \
nuclide-health \
nuclide-hg-repository \
nuclide-home \
nuclide-installer \
nuclide-language-hack \
nuclide-move-pane \
nuclide-objc \
nuclide-ocaml \
nuclide-open-filenames-provider \
nuclide-quick-open \
nuclide-react-native-inspector \
nuclide-recent-files-provider \
nuclide-recent-files-service \
nuclide-remote-projects \
nuclide-service-monitor \
nuclide-test-runner \
nuclide-toolbar \
nuclide-type-hint \
nuclide-url-hyperclick
```
