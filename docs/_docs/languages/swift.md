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

- [Building a Swift package](#features__building-a-swift-package)
- [Running a Swift package's tests](#features__running-a-swift-packages-tests)
- [Autocomplete](#features__autocomplete)

### Building a Swift package

1. Click the **Toggle Task Runner Toolbar** button on the [Nuclide toolbar](/docs/features/toolbar/#buttons) (or use the [Command Palette](/docs/editor/basics/#command-palette) to issue the **Nuclide Task Runner: Toggle Swift Toolbar** command) to display options for building a Swift package.<br /><br />
![](/static/images/docs/language-swift-build-toolbar.png)

2. Select **Build** from the Swift Task drop-down menu.
3. Enter the path to a Swift package's root directory, then click the **Build** button to build the package. (This path is entered automatically if your project root is set to
a Swift package root.) Build output is displayed in the [Console](/docs/features/debugger/#basics__evaluation) below the [Editing Area](/docs/editor/basics/#editing-area).

![](/static/images/docs/language-swift-build-output.png)

You can customize build settings, such as whether to build the package in a "Debug" or "Release" configuration, by clicking the gear icon to the right
of the Swift Task toolbar.

![](/static/images/docs/language-swift-build-toolbar-settings.png)

### Running a Swift package's tests

1. Select **Test** from the Swift Task drop-down menu to display options for running a Swift package's tests.<br /><br />
![](/static/images/docs/language-swift-test-toolbar.png)

2. Enter the path to a Swift package's root directory, then click the **Test** button to run the package's tests. (This path is entered automatically if your project root is set
to a Swift package root.) Test output is displayed in the [Console](/docs/features/debugger/#basics__evaluation) below the [Editing Area](/docs/editor/basics/#editing-area).

![](/static/images/docs/language-swift-test-output.png)

Clicking the gear icon to the right of the Swift Task toolbar displays additional settings for running your Swift package's tests.

### Autocomplete

Once you have [built your Swift package](#features__building-a-swift-package) via the Swift Task Runner toolbar,
Nuclide will be able to provide autocompletion suggestions for Swift source code.

![](/static/images/docs/language-swift-autocompletion.png)
