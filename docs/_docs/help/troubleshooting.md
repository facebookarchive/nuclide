---
id: troubleshooting
title: Troubleshooting
layout: docs
permalink: /docs/help/troubleshooting/
---

If you are having problems with Nuclide itself, check out some of these troubleshooting tips. More
are being added as we come across common issues found by users. If you have an issue that is not
listed here, please [file a GitHub issue](https://github.com/facebook/nuclide/issues), and
depending on how widespread the problem may be, we will add it here as well.

- [Environment Issues](#environment-issues)
- [Flow Issues](#flow-issues)

## Environment Issues

### `$PATH` changes

If you are finding that Atom is not picking up your changes to `$PATH`, changes to your `$PATH`
made in your `.bashrc` will not be made available to Atom unless you start it from the command line.

This is a [known issue](https://github.com/AtomLinter/Linter/issues/150), and there are possible
[workarounds](http://serverfault.com/a/277034).

## Flow Issues

### Features Not Working

If the Flow features are not working in Nuclide:

- Make sure `flow` is on your [`$PATH`](#flow-issues__flow-and-path).
- Ensure that you have `/* @flow */` at the top of your `.js` file.
- Ensure you have an empty `.flowconfig` file in the root of of your project directory.

### `flow` and `$PATH`

If installed `flow` in a place not on your `$PATH` (e.g., unzipped it in your home directory which
is not on your `$PATH`), then you either have to update your `$PATH` or explicitly specify it.

!["Settings | Packages | Nuclide | Settings | nuclide-flow:Path to Flow Executable"](/static/images/settings-nuclide-flow-executable.png)  
