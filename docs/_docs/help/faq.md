---
pageid: help-faq
title: FAQ
layout: docs
permalink: /docs/help/faq/
---

Here is an ever-growing list of frequently asked questions around Nuclide.

* TOC
{:toc}

## How do I open Nuclide?

See [opening](/docs/editor/basics/#opening) in the Nuclide [basics](/docs/editor/basics/#opening)
section.

## What version of Nuclide is installed?

Determine which version of Nuclide you have installed with
[Atom Package Manager](https://github.com/atom/apm) (APM) from the command line.

```bash
$ apm list --no-dev --installed
```

The output will contain installed Atom packages and their versions.

```bash
/Users/foobar/.atom/packages (1)
└── nuclide@X.Y.Z
```

Your installed version is the number following either the `nuclide` package or the first package
starting with `nuclide-`. In the example above, the installed version is `X.Y.Z`.
