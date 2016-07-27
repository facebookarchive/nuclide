---
pageid: language-swift
title: Swift
layout: docs
permalink: /docs/languages/swift/
---

Nuclide has *limited*, built-in support for [Swift](https://swift.org/) and the [Swift package manager](https://github.com/apple/swift-package-manager).

> Nuclide's built-in Swift support is not endorsed by Apple. The Swift
  logo is a registered trademark of Apple Inc.

<br/>

* TOC
{:toc}

## Configuring Nuclide for Swift Package Development

Nuclide will attempt to find a Swift executable automatically:

- On macOS, it will use the latest version of Swift installed, at `/Library/Developer/Toolchains/swift-latest.xctoolchain`.
- On Linux, it will find a Swift executable based on your PATH.

You may use a specific version of Swift by setting the "Swift Toolchain Path"
in the Nuclide settings:

![](/static/images/docs/language-swift-toolchain-path.png)

## Features

Swift integration in Nuclide provides you with productivity features such as:

- [Building a Swift package](#features__building-a-swift-package)
- [Running a Swift package's tests](#features__running-a-swift-packages-tests)

### Building a Swift package

Select `Swift > Build` from the [Nuclide toolbar](/docs/features/toolbar/#buttons)
(or use the [command-palette](/docs/editor/basics/#command-palette) `Nuclide Task Runner: Toggle Swift Toolbar`)
to display options for building a Swift package.

![](/static/images/docs/language-swift-build-toolbar.png)

Enter the path to a Swift package's root directory, then click "Build" to build
the package. (This path is entered automatically if your project root is set to
a Swift package root.) Build output is displayed in the console.

![](/static/images/docs/language-swift-build-output.png)

You can customize build settings, such as whether to build the package in a
"Debug" or "Release" configuration, by clicking the gear icon on the right
of the toolbar.

![](/static/images/docs/language-swift-build-toolbar-settings.png)

### Running a Swift package's tests

Select `Swift > Test` from the [Nuclide toolbar](/docs/features/toolbar/#buttons)
to display options for running a Swift package's tests.

![](/static/images/docs/language-swift-test-toolbar.png)

Enter the path to a Swift package's root directory, then click "Test" to run the
package's tests. (This path is entered automatically if your project root is set
to a Swift package root.) Test output is displayed in the console.

![](/static/images/docs/language-swift-test-output.png)

As with the Swift build toolbar, clicking the gear icon displays additional
settings for running your Swift package's tests.
