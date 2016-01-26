# Nuclide Changelog

## 0.114.0

### Added

* Output:
  * Panel for displaying log messages.
  * adb-logcat provider (and commands for starting and stopping `adb` logcat).
* Hack: XHP syntax to language grammar.

### Fixed

* Server connection flakiness.
* File-tree: clicking on a selected node with preview tabs enabled opens the file.

### Changed

## 0.113.0

### Added

* Type Hints:
  * Better (faster) UX for triggering and interacting with type hints.
  * ESC/cancel closes current type hint.
  * Experimental support for flow "hint trees" (interactive UI for exploring nested types in type hints). To try it out, enable the "nuclide-flow: Enable Tree-structured Type Hints" setting.
* Lint: Autofix is now enabled by default.
  * Eligible lint errors will have a "Fix" button in the gutter popup.
  * `alt+shift+a` will fix all eligible errors in the current file.
* Debugger: HPHPD-style leading `=` syntax for evaluating expressions is now supported in the debugger console.
* Debugger: Pass multi args to hhvm in script debugging.
* HHVM Debugger: Scripts launched from the HHVM toolbar can now be passed command line arguments.
* Debugger: Add a new contextual menu for regular breakpoints (conditional breakpoints in the works).
* Tool Bar: Add "Hide Tool Bar" context menu for Buck/HHVM.

### Fixed

* ctags: Improve relevancy for JS development, shows results even if Hack service is available.
* C++: Hyperclick performance improvements, better compile error messaging.
* Nuclide Server: Diagnostic improvements.

### Changed

* Blame: Replaced individual show/hide commands with toggle.
* UI: Move Health icon from statusbar to toolbar.

## 0.112.0

### Added

* Dedicated toolbar shortcut icons for toggling the HHVM and Buck top bar.
* Include type information with clang results.
* Quick open for ctags.
* "Reload Atom" on server crash button.
* Connection profiles got a total makeover.

### Fixed

* Reduced clang cache memory consumption.
* diff-view context menu items appear both in Nuclide's file-tree and in Atom's tree-view.
* fb-watchman exceptions.
* Race condition that prevented the diff-view from re-opening on restart.
* React Native debugging for newer versions of React Native (Note: Node v4 still needs to be on Atom's path).

### Changed

* Continued improvements to the experimental filename search.
* hg-repository now checks `default` instead of fb-specific `remote/master`.

## 0.111.0

Nuclide is now a single Atom package named 'nuclide'. All 'nuclide-*' packages are deprecated and
will be unpublished after this release.

* Node Debugger:
  * Now works on node processes running any major version of node/iojs including 0.10.x, 0.12.x,
  1.x, 2.x, 4.x, 5.x.
* Hyperclick:
  * Anything that looks like it might be a valid web address is clickable. Eg. http://cats.com
    (http://cats.com/) (a word with a valid TLD).
  * ctags support: any symbols in a valid 'tags' file in your project directory should be clickable.
  * Fix Hyperclick errors with split panes.
* Settings:
  * All settings are in one spot: Preferences → Packages → Nuclide → Settings.
* File Tree:
  * Preview Tab support. Enable from Packages →  tabs →  Use Preview Tabs.
* Buck Toolbar
  * RN Server checkbox value now remembered after restart
  * Output window can now be moved and split
* C++ support:
  * Significant performance improvements for diagnostics, autocompletion, and click-to-declaration
  * Loading indicator will display in status bar while C++ files are parsing
  * Stability: clang errors should no longer cause the Nuclide server to crash
  * “Find References” support for clang-enabled projects (right click on any symbol)
* More robust Watchman integration for Mercurial and file-change reload features.
* Fix Mercurial blame for remote projects.
* Fix Diff View offset rendering for large diffs and split panes errors.
* Arc lint autofix beta:
  * In the settings for the Nuclide package, check nuclide-diagnostics-ui: enableAutofix.
  * There will then be a 'Fix' button in the popup for eligible lint problems.

## 0.0.35

* Improvements to prevent spawning many Mercurial processes.
* Diff View:
  * Performance Optimizations (Caching and avoid expensive calls when Diff View is closed).
  * Add a 'Navigation Bar' for easier (add/delete/change) line change scrolling
* Hyperclick / Go to definition Improvements:
  * Go to definition doesn't collide with multi-cursor feature (not end up with multiple cursors).
  * Hack: Go to definition shows a navigable suggestion list when hh_server can't determine the
    exact location of the (e.g. dynamically-typed method calls).
  * Hack: XHP go to definition highlights XHP tags correctly (while it still jumps to the right
    place).
  * UX: Fix cursor indicator for loading and result-ready.
* Support formatting of `const` requires in format-js

## 0.0.34

npm-only release. Our Node packages were released so that external packages could consume them, but
we did not update any Atom packages.

## 0.0.33

This was tagged but not released due to an issue.

## 0.0.32

* **Bug Fix**
  * Exclude `nuclide-debugger-node` from `nuclide-installer` until we can fix the issue with
  its native dependencies getting built properly. Fixes
  [#193](https://github.com/facebook/nuclide/issues/193).
  * Hack and Flow diagnostics are now removed appropriately when the corresponding project folder
  is removed.

* **Documentation**
  * Added [README for `nuclide-diagnostics-store`](
  https://github.com/facebook/nuclide/tree/master/pkg/nuclide/diagnostics/store#readme).

## 0.0.31

* **New Feature**

  * **New Diagnostics UI** Previously, we encouraged Nuclide users to install the third-party
[linter](https://atom.io/packages/linter) package in order to see errors from our Flow and Hack
packages, but now we include our own packages for displaying diagnostics as part of Nuclide. We
divided this functionality across two Atom packages:
[nuclide-diagnostics-store](https://atom.io/packages/nuclide-diagnostics-store) and
[nuclide-diagnostics-ui](https://atom.io/packages/nuclide-diagnostics-ui). The former is the
model/controller component where diagnostics are reported and broadcast out to registered listeners.
The latter is the view component that subscribes to the model and presents diagnostics to the user
via editor gutters and a table view. The `nuclide-diagnostics-store` is capable of consuming
providers that conform to the `linter` API in addition to its own API. This means that even if you
disable the `linter` package, you will still see all of the same errors and warnings from packages
that adhere to the `linter` API in Nuclide.
![](https://raw.githubusercontent.com/facebook/nuclide/master/pkg/nuclide/diagnostics/ui/docs/diagnostics-ui.png)
  * **Buck** We now support building with [Buck](https://buckbuild.com/) in Nuclide. If the active
  editor corresponds to a file in a Buck project (which means it has a `.buckconfig` file in its
  ancestor directory), then the Buck toolbar will be displayed at the top of your Atom window.
  From there, you can enter a Buck [build target](https://buckbuild.com/concept/build_target.html)
  or alias, and then choose to build, run, or debug that target. (Note that like most features in
  Nuclide, this also works if you are [working with remote files](http://nuclide.io/docs/remote/).) We
  also syntax highlight `BUCK` files and make it possible to `cmd-click` on build targets to navigate
  between `BUCK` files. As Buck supplies all sorts of information about the structure of your project
  to Nuclide, you can expect us to provide even more integration with Buck going forward.
  * **iOS support** This release builds on top of the new Buck support to also provide support for
  iOS. The major caveat is that your iOS project must be configured to
  [build with Buck](https://buckbuild.com/rule/apple_bundle.html) in order to get support for iOS
  development in Nuclide. Once you have made this investment, common IDE features, such as
  autocomplete, click-to-symbol, and diagnostics reporting will be available for your iOS code in
  Nuclide. You can also build, run, and yes, *debug* your iOS app from Nuclide. As is common in most
  IDEs, you can click in the gutter of an editor to set a breakpoint. When running your app in debug
  mode and you encounter a breakpoint, you can inspect it via the familiar
  [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools/) UI. Note that the
  Console in the DevTools is wired up to the LLDB REPL, so you can issue LLDB commands such as
  `thread backtrace`.
  * **cxx support** In many ways, iOS support is just a special case of supporting the C-family of
  languages. However, the same caveat still applies: your cxx project needs to
  [build with Buck](https://buckbuild.com/rule/cxx_binary.html) in order to get support for
  autocomplete, click-to-symbol, and diagnostics.
  * **Hack** improvements:
    * Use `hh_client` for the diagnostics result if available for better accuracy and consistency
    and eliminate the false positives of cases not known for the local Hack model.
    * Prioritize Hack's context-sensitive autocompletions over grammar snippets.
    * Autocomplete of static and instance methods does not require a typed prefix (to be more
    predictable).
    * Updated [hh_ide.js](
    https://github.com/facebook/nuclide/blob/master/pkg/nuclide/hack/static/hh_ide.js) to the
    latest HHVM build.
  * **Flow** improvements:
    * Display all Flow errors in the entire project, rather than just those in files that have been
    recently opened.
    * Fix Flow autocomplete, and use snippets to pre-fill function arguments.
  * **hg blame** From the initial launch of Nuclide, one of our most unique features compared to
  most editors is tight integration with Mercurial. In this release, we take things one step further
  by adding support for `hg blame`. If your current file belongs to an Hg repository, you can
  right-click in the editor and choose **Show Blame** from the context menu to see the author and
  changeset ID for each line in a custom gutter. Right-click again and choose **Hide Blame** to
  remove the blame information. (Note that as stated in the
  [README](https://github.com/facebook/nuclide/blob/master/pkg/nuclide/hg-repository/README.md),
  this has been tested with Hg 3.4 and above.)
  * **Diff View** (works only for mercurial repositories): The Diff View now offers more help
  discovering the uncommitted source control changes by showing a highlighted up-to-date file status
  changes in a list on the right and changing the right pane editor to be editable and savable to
  allow previewing the changes in realtime and saving the contents to the filesystem, when ready.
  The Diff View is not yet able to detect and diff against the fork base of the source control to
  allow amend commit diffs iterating on the same commit.
  Usage (Open, Navigate, Edit and Save) is as follows:
    * For a certain file, either choose **Open in Diff View** from the context menu or
    **Packages > Open Diff View** from the Atom's menu bar.
    * Double-clicking changed files in the change list will load the diff for that file.
    * Edit the right pane editor with an updated change and see the diff in real-time.
    * (`cmd-s`) or **File > Save** will save the new contents to the filesystem.
  * **Connection Status:** We now display an icon in the status bar to indicate whether a file is
  local or remote, and whether the server is connected or disconnected.
  * **nuclide-file-tree-deux** We have heard your complaints about
  [nuclide-file-tree](https://github.com/facebook/nuclide/tree/master/pkg/nuclide/file-tree) loud
  and clear, so we have embarked on a [rewrite of our file tree package](
  https://github.com/facebook/nuclide/tree/master/pkg/nuclide/file-tree-deux) named
  `nuclide-file-tree-deux` that uses proper React/Flux design patterns to ensure the tree is
  performant for the largest of directory structures. The new package has not reached feature
  parity with the existing `nuclide-file-tree` quite yet, so it is available for dogfooding, but
  it is not enabled by default. Once we have achieved feature parity, we will replace the code for
  `nuclide-file-tree` with that of `nuclide-file-tree-deux` and will delete the
  `nuclide-file-tree-deux` package.
  * **New service framework** One of the primary features of Nuclide is support for developing
  remote files. This is more than just the ability to edit files on a remote machine: it also means
  surfacing information from developer tools that are running locally on that machine, such as Buck,
  Mercurial, Clang, Hack, and Flow. To that end, we design our integration with these tools to use
  asynchronous APIs that are agnostic to where the tools are running. Our pattern for doing this has
  been continuously evolving, but our most recent implementation focuses on definition files written
  in JavaScript/Flow with RPCs that return promises or observables. Our [nuclide-buck-base](
  https://github.com/facebook/nuclide/tree/master/pkg/nuclide/buck/base) package is the first to
  take advantage of this new framework, but we plan to retrofit the rest of our codebase to use this
  soon. We also intend to document it so that you can define your own remote services that plug into
  [nuclide-server](https://github.com/facebook/nuclide/tree/master/pkg/nuclide/server).
  * **New package: nuclide-move-pane** The [`nuclide-move-pane` package](
  https://atom.io/packages/nuclide-move-pane) overrides the default behavior of `cmd/ctrl-k arrow`
  to *move* the pane rather than split it.
  If you want the original behavior, we encourage you to disable this package.
  * **New package: nuclide-format-js** This package is meant to help format JavaScript code in order
  to speed up development. Currently, it has support for automatically adding, removing, and sorting
  requires. It also understands Flow types and will promote or demote a `require()` when
  appropriate. This feature is still in an experimental phase: please see the
  [README](https://github.com/facebook/nuclide/tree/master/pkg/nuclide/format-js#readme) for the
  heuristics involved and how best to integrate it into your workflow. In the future we will be
  adding more AST based transformations that can be configured on and off.

* **Bug Fix**
  * Improve [`nuclide-ocaml`](https://atom.io/packages/nuclide-ocaml) behavior when `ocamlmerlin` is
missing or errors. Previously this could cause a crash.

## 0.0.30

* **Bug Fix**
  * [#163](https://github.com/facebook/nuclide/issues/163)

## 0.0.29

* **Bug Fix**
  * Fixed the transpilation issue identified in [#162](https://github.com/facebook/nuclide/issues/162).

## 0.0.28

* **New Feature**
  * Babel files in Node and Atom packages are now pre-transpiled prior to publishing. This should
reduce initial startup time for `nuclide-server` as well as for Atom, post-Nuclide install.
Both `nuclide-server` and Atom have schemes to cache their transpilations, but

## 0.0.27

*Scrubbed this release because it would have missed [55efd78b](
https://github.com/facebook/nuclide/commit/55efd78b3eb949129fe582657b5988ce0aa70159).*

## 0.0.26

* **Bug Fix**
  * [#157](https://github.com/facebook/nuclide/issues/157)

## 0.0.25

* **New Feature**
  * Was long overdue for a release. There were 222 commits since `0.0.24`.
  * New Atom package: `nuclide-arcanist`.
  * New Atom package: `nuclide-diagnostics-store`.
  * New Atom package: `nuclide-diagnostics-ui`.
  * New Atom package: `nuclide-find-references`.
  * New Atom package: `nuclide-ocaml`.

## 0.0.24

* **Bug Fix**
  * Back out Facebook-specific code.

## 0.0.23

* **New Feature**
  * Was overdue for a release. There were 76 commits since `0.0.22`.

## 0.0.22

* **Polish**
 * Various small fixes in preparation for [CodeConf 2015](http://codeconf.com/) demo.

## 0.0.21

* **New Feature**
  * Target `linter-plus` rather than `linter` Atom package: [1fc2358e](
https://github.com/facebook/nuclide/commit/1fc2358e646d779c9fe9cb39b22b7c21ad61fa6c).

## 0.0.20

*Initial public release of Nuclide.*
