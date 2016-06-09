---
pageid: advanced-linter-package-compatibility
title: Linter Package Compatibility
layout: docs
permalink: /docs/advanced-topics/linter-package-compatibility/
---

Nuclide Diagnostics displays diagnostic messages about your code from arbitrary providers. These can be lint warnings, compiler errors, etc.

Any package that works with the [`linter`](https://atom.io/packages/linter) package should also work with Nuclide Diagnostics.

We discourage the use of both Nuclide Diagnostics and `linter` together, since you will see duplicate UI for reporting diagnostics. To that end, if you wish to use Nuclide Diagnostics, we recommend disabling the `linter` package. If you wish to continue using the `linter`, we recommend disabling all `nuclide-diagnostics-*` Nuclide features. Please note that doing so will disable some Nuclide capabilities such as Flow and Hack error reporting.
