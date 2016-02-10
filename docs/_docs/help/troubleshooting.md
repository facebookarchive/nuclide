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

### Custom `$PATH`

In general, it is perfectly fine to open Atom/Nuclide from something like the Dock. However, if
you have installed certain Nuclide prerequisites outside of a location that is not in your default
`$PATH`, you may run into issues. This is because does not inherit any custom changes to `$PATH` or
other environment variables when opening Atom/Nuclide outside of a command line environment.

For example, if you have installed HHVM in a location that is specified in your `.bashrc`,
Atom/Nuclide will not see that location, and thus not be able to load HHVM for debugging Hack
programs.

However, *opening Atom/Nuclide from the command line* will inherit any custom changes to your
environment variables.

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
