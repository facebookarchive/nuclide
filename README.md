# Nuclide

[Nuclide](http://nuclide.io/) is a collection of packages for [Atom](https://atom.io/)
to provide IDE-like functionality for a variety of programming languages and
technologies.

Most developers choose to maintain individual Node and Atom packages in their
own repositories. Because Nuclide is composed of so many packages, we chose to
organize all of its code in a single repository rather than across a multitude of
repositories. As such, this repository is organized as follows:

* `pkg/` Source code for Nuclide packages.
* `scripts/` Utilities for developing and deploying Nuclide packages.

## Installation

Currently, Nuclide can be installed only from source. That is, during early access,
Nuclide packages are not publicly available in [npm](https://www.npmjs.com/) or
[apm](https://atom.io/packages). Fortunately, building Nuclide is fairly straightforward.

**System Requirements**

* Python 2.6 or later.
* Atom v0.199.0 or later.
* `node`, `npm`, and `apm` must be on your `$PATH`. (Node must be v0.12.0 or later.)
* *Optional, but strongly recommended:* install the Atom [linter](https://atom.io/packages/linter) package.

**Build and install Nuclide**

Run the following command from the root of the repository:

```
./scripts/dev/setup
```

This will fetch the appropriate dependencies from [npm](https://www.npmjs.com/) and
perform any necessary build steps. When complete, you should see several `nuclide-`
packages in your `~/.atom/packages` directory. Starting Atom after running `./scripts/dev/setup`
for the first time may be a little slow because of the large number of Babel files that
need to be transpiled. (The results of transpilation are cached for future use.
You can see how many files were transpiled from [Timecop](https://atom.io/packages/timecop).)

## Features

Currently, Nuclide contains the following Atom packages:

* `nuclide-flow` Adds support for [Flow](http://flowtype.org/). If `flow` is on your `$PATH`,
then opening `.js` files with the `/* @flow */` pragma under a directory with a `.flowconfig`
should expose information from Flow directly in Atom.
* `nuclide-hack` Adds support for [Hack](http://hacklang.org/).
* `nuclide-hg-repository` Local changes to files in a [Mercurial](http://mercurial.selenic.com)
repository will be reflected in Atom's file tree and gutter UI as Atom does
natively for Git repositories.

Nuclide also adds support for *remote development*. See the [`nuclide-server`](pkg/nuclide/server)
package for more information on setting up remote development.

## Development

Read the [packages overview](./pkg/README.md) to learn how to develop Nuclide.
