---
id: flow
title: Flow and JavaScript
layout: docs
permalink: /docs/languages/flow/
---

Nuclide has deep, built in support for [Flow-enabled](http://flowtype.org) JavaScript (and regular
JavaScript too).

Flow's integration into Nuclide provides you with productivity features such as:

* Linting (Flow errors inline)
* Autocompletion
* Go to Definition
* Inline (mouse over) typehinting

*Currently, Flow is [not supported on Windows](https://github.com/facebook/flow/issues/6), so this
integration is not yet available on that platform.*

## Using Flow

In order to fully use the integration of Flow, you must have Flow installed on your system:

1. [Install Flow](http://flowtype.org/docs/getting-started.html#installing-flow).
2. If you are new to Flow, you can [follow the steps for writing simple Flow programs](http://flowtype.org/docs/five-simple-examples.html). The
key items of note are:
   * `flow` is on your `$PATH`. If it is not on your `$PATH` for any reason, you can specify the
   path to the `flow` binary in `Settings | Packages | Nuclide | Settings |
   nuclide-flow: Path to Flow Executable`.
   * You have an empty `.flowconfig` file in the root of your project.
   * You have `/* @flow */` at the top of your JavaScript (`.js`) file.

## Feature Examples

*Jump To Definition*

![Jump to definition of entity with cmd-click (Mac), ctrl-click (Linux).](/static/images/docs/FlowClickDefine.gif)

*Inline diagnostics and error highlighting*

![Nuclide highlights your errors in real time as you code.](/static/images/docs/FlowInlineError.gif)
