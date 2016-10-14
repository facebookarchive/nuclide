---
pageid: language-swift
title: Swift
layout: docs
permalink: /docs/languages/swift/
---

Nuclide has *limited*, built-in support for [Swift](https://swift.org/) and the [Swift Package Manager](https://github.com/apple/swift-package-manager).

> Nuclide's built-in Swift support is not endorsed by Apple. The Swift
  logo is a registered trademark of Apple Inc.

<br/>

* TOC
{:toc}

## Configuring Nuclide for Swift Package Development

Nuclide will attempt to find a Swift executable automatically:

- On macOS, it will use the latest version of Swift installed at `/Library/Developer/Toolchains/swift-latest.xctoolchain`.
- On Linux, it will find a Swift executable based on your `$PATH`.

You may use a specific version of Swift by setting the **Swift Toolchain Path** in the Nuclide settings:

1. Open the [Nuclide Settings](/docs/editor/basics/#preferences-pane) tab either by pressing `Cmd+,` (`Ctrl-,` on Linux) or by going to `Package | Settings View | Open`.
2. Select **Packages** from the list at the left, and search for `nuclide`.
3. Click on the **Settings** button for the `nuclide` package.
4. Scroll down until you find `nuclide-swift`, and enter the Toolchain path in the **Swift Toolchain Path** text box.

![](/static/images/docs/language-swift-toolchain-path-setting.png)

Nuclide uses [SourceKitten](https://github.com/jpsim/SourceKitten) to provide features such as [Autocomplete]((#features__autocomplete)).

On macOS, Nuclide expects to find a SourceKitten executable at `/usr/local/bin/sourcekitten`. Installing SourceKitten via [Homebrew](http://brew.sh/), by running `brew install sourcekitten` at the command line, places it in this location.

> Unfortunately, SourceKitten is not yet available on Linux. As a result,
  features such as [Autocomplete](#features__autocomplete) are only available on macOS.

You may configure Nuclide to use a SourceKitten executable at a different location by setting the **Path to SourceKitten Executable** in the Nuclide
settings.

1. Open the [Nuclide Settings](/docs/editor/basics/#preferences-pane) tab either by pressing `Cmd+,` (`Ctrl-,` on Linux) or by going to `Package | Settings View | Open`.
2. Select **Packages** from the list at the left, and search for `nuclide`.
3. Click on the **Settings** button for the `nuclide` package.
4. Scroll down until you find `nuclide-swift`, and enter the custom SourceKitten path in the **Path to SourceKitten Executable** text box.

## Features

Swift integration in Nuclide provides you with productivity features such as:

- [Building and Testing Swift packages](#features__building-and-testing-swift-packages)
- [Autocomplete](#features__autocomplete)

### Building and Testing Swift packages

The [Task Runner toolbar](/docs/features/task-runner) is used to build and test Swift packages.  To open the Task Runner toolbar, click on the **Toggle Task Runner Toolbar** button in the [Nuclide toolbar](/docs/features/toolbar/#buttons) or search for `Nuclide Task Runner: Toggle Swift Toolbar` in the [Command Palette](/docs/editor/basics/#command-palette).

See the [Task Runner Swift guide](/docs/features/task-runner/#swift) for how to build and test Swift packages.

### Autocomplete

Once you have [built your Swift package](#features__building-a-swift-package) via the [Task Runner's](/docs/features/task-runner) [Swift toolbar](/docs/features/task-runner/#swift), Nuclide will be able to provide autocompletion suggestions for Swift source code.

![](/static/images/docs/language-swift-autocompletion.png)
