---
id: setup
title: Setup
layout: docs
permalink: /docs/setup/
---

## Installation

The easiest way to get Nuclide is to install it from Atom itself.
In Atom, open the **Settings** pane and navigate to the **Install** tab.
From there, you can search for the `nuclide` package and click
the corresponding **Install** button in the search result to install it.

Alternatively, if you are more comfortable using the command line,
you can install it using `apm`:

```bash
$ apm install nuclide
```

### Recommended Dependencies

To benefit from all of Nuclide's features, we recommend you also install the following:

* [Flow](/docs/flow/)
* [Hack](/docs/hack/)
* [Mercurial](/docs/hg/)
* [Watchman](https://facebook.github.io/watchman/) - version 3.2 or above. It must be in
  `/usr/local/bin/` or in your `$PATH`. Without Watchman, Nuclide will lose some functionality: for
  instance, in the
  [hg-repository](https://github.com/facebook/nuclide/tree/master/pkg/nuclide/hg-repository),
  [server](https://github.com/facebook/nuclide/tree/master/pkg/nuclide/server), and
  [quick-open](https://github.com/facebook/nuclide/tree/master/pkg/nuclide/quick-open) packages.

### Building from Source

If you want to build Nuclide from source, you must have the following tools installed:

+ Atom 1.0.0 or later
+ Node 0.12.0 or later
+ `node`, `npm`, `apm`, and `git` must be on your `$PATH`

1. Build and link the Nuclide package like you would other Atom packages:

    ```bash
    # Clone the source
    $ git clone https://github.com/facebook/nuclide.git
    $ cd nuclide
    # Install dependencies
    $ npm install
    # Link the 'nuclide' package to Atom's package directory
    $ apm link
    ```
2. Now open Atom. Nuclide feature settings are listed in the 'nuclide' package in Atom's settings
   view.

## Installing Nuclide Server

If you want to use Nuclide for remote development, you'll also need to setup the NPM `nuclide`
package. Instructions can be found in the [Remote Development docs](/docs/remote/).

## Troubleshooting Installation

### Incompatible native module error

If you switch Atom versions, or if you `npm install nuclide` instead of `apm install nuclide`, you may find yourself with an "incompatible native module" error:

!["incompatible native module" error](/static/images/incompatible-native-module-error.png)

#### (easy) Fixing via the "Incompatible Packages" tool

From the Command Palette, search for "Incompatible Packages: view", or
click the "bug" icon in the status bar. Then select "Rebuild Packages", and restart Atom.

_If you can't find "Incompatible Packages", make sure that the `incompatible-packages` package is enabled via `Settings` `->` `Packages`._

![incompatible packages view](/static/images/incompatible-packages-view.png)

#### (hard) Fixing via the CLI

From the Atom Developer Tools, give the incompatible modules storage a kick:

```js
localStorage.removeItem(
  atom.packages.getLoadedPackage('nuclide')
    .getIncompatibleNativeModulesStorageKey()
)
```

Then, from your terminal:

```sh
$ apm rebuild nuclide
```

## Starting Nuclide

Once you've installed or built Nuclide, just run `Atom` - the initial load after the build process
may be a little slow because of the large number of Babel files that need to be transpiled.
