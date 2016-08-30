---
pageid: feature-buck
title: Buck
layout: docs
permalink: /docs/features/buck/
---

Nuclide supports many common workflows with the [Buck](https://buckbuild.com/)
build system. See the [Buck website](https://buckbuild.com/setup/getting_started.html)
for instructions on how to install Buck and create a Buck project.

* TOC
{:toc}

## Getting Started

First, open a Buck project (any project with a `.buckconfig` file) as a project
in Nuclide.

> [Enabling Buck's httpserver interface](https://buckbuild.com/concept/buckconfig.html#httpserver)
> is recommended for better Buck output in Nuclide.

If you have multiple projects open, or if your Buck project is a subdirectory
of one of your project roots, you'll need to mark the Buck project root as the
*Current Working Root*. You can do this by right clicking on the root folder
in the file tree and selecting `Set as Current Working Root`.

There are a few ways to trigger Buck commands from Nuclide:

### Via the Task Runner

Buck tasks live in the Task Runner toolbar.

1. Press the Task Runner icon (play button) from the toolbar. Alternatively,
   from the Nuclide menu press `Nuclide > Task Runner > Toggle Toolbar Visibility`.
2. Choose any of the Buck tasks from the Task Runner toolbar's dropdown.

<img src="/static/images/docs/feature-buck-task-runner.png" width="495" />

### Via the Nuclide menu

The Nuclide top-level menu contains a `Buck` submenu:

<img src="/static/images/docs/feature-buck-nuclide-menu.png" width="435" />

### Via Atom's Command Palette

Open the Command Palette (`cmd-shift-p` or `ctrl-shift-p` on Linux/Windows)
and type "buck":

<img src="/static/images/docs/feature-buck-command-palette.png" width="568" />

> You can use these commands to add keybindings in Atom's keymap:
>
> ```
> 'atom-workspace':
>   # note: commands are case-sensitive
>   'cmd-b': 'nuclide-task-runner:toggle-Buck-toolbar'
>   'f5': 'nuclide-task-runner:Buck-build'
>   'f6': 'nuclide-task-runner:Buck-test'
>   ...
> ```

## Workflows

Nuclide supports the following Buck workflows, matching the corresponding Buck command-line tasks.

- [Build](#build)
- [Run](#run)
- [Test](#test)
- [Debug](#debug)

### Build

The "Build" task invokes [`buck build`](https://buckbuild.com/command/build.html),
displaying build output in the Console.

In the Task Runner toolbar textbox, type in the name of the build target exactly
as you would specify to Buck on the command line, i.e. `//path/to/dir:target_name#flavor`.

Note that the usual leading `//` is optional.

<img src="/static/images/docs/feature-buck-build.png" />

Pressing the Settings (gear) button will bring up a dialog where you can provide extra flags to Buck.

<img src="/static/images/docs/feature-buck-build-settings.png" width="625" />

Upon pressing build, output will appear in a new Console pane. Build progress
will be displayed via a blue progress bar below the toolbar, and also periodically
via messages in the Console.

Press the stop button at any time to cancel an ongoing build.

<img src="/static/images/docs/feature-buck-build-console.png" />

In addition to showing up in the console, C++ compilation errors will additionally
be surfaced in [Diagnostics](/docs/editor/basics/#code-diagnostics).
Buck diagnostics will be cleared upon triggering a new build.

<img src="/static/images/docs/feature-buck-build-diagnostics.png" />

### Run

The "Run" task is only enabled for iOS and Android application targets
(`apple_bundle`, `android_binary`, and `apk_genrule` rules). It invokes
[`buck install --run`](https://buckbuild.com/command/install.html)
and builds, installs, and then runs the app.
Build output will be reported as documented in the [Build workflow](#build).

<img src="/static/images/docs/feature-buck-run.png" />

For iOS rules, the simulator type can be explicitly provided via the toolbar dropdown. <br />
The `React Native Server Mode` checkbox optionally starts the React Native packager
and debugging server while the app installs.

### Test

The "Test" task invokes [`buck test`](https://buckbuild.com/command/test.html),
building and running valid test targets (e.g. `cxx_test`).
Build output will be reported as documented in the [Build workflow](#build).

### Debug

The "Debug" task is only enabled for the following target types:

- iOS applications (`apple_bundle`)
- C++ unit tests (`cxx_test`)
- C++ binaries (`cxx_binary`)

The [LLDB debugger](/docs/languages/cpp/#debugging) is invoked after a
successful build in all three cases, but with slight variations.

*iOS Applications*

For iOS applications, the "Debug" task invokes
[`buck install --run --wait-for-debugger`](https://buckbuild.com/command/install.html)
and then attaches LLDB to the simulator process once the app starts.

As with the "Run" task, the simulator type can be selected from a dropdown.
`React Native Server Mode` must be checked for React Native apps to enable
JavaScript debugging.

*C++ unit tests*

For C++ unit tests, LLDB is launched against the unit test binary
with the `args` and `env` parameters
[specified by the `cxx_test` target](https://buckbuild.com/rule/cxx_test.html)
after a successful `buck build`.

*C++ binaries*

For C++ binaries, LLDB is launched directly against the output binary
after a successful `buck build`.
Extra launch arguments can be specified using the Settings (gear) button:

<img src="/static/images/docs/feature-buck-debug.png" width="564" />
