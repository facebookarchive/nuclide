---
id: language-hack
title: Hack
layout: docs
permalink: /docs/languages/hack/
---

Nuclide has been built from the start to provide a great IDE experience for
[Hack](http://hacklang.org) development. Hack is a programming language for
[HHVM](http://hhvm.com).

Hack's integration into Nuclide provides you with productivity features such as:

* Linting
* Autocompletion
* Go to Definition
* Inline (mouse over) typehinting
* Code formatting
* Omni-search

*Currently, HHVM is [not supported on Windows](https://docs.hhvm.com/hhvm/installation/windows), so
this integration has limited viablity on that platform. However, [work is being done](https://github.com/facebook/hhvm/issues/5460) to port HHVM to Windows.*

## Using Hack

In order to fully use the integration of Hack, you must have both Hack and HHVM installed on your
system:

1. [Install HHVM](https://docs.hhvm.com/hhvm/installation/introduction). By default, Hack is
installed with HHVM.
2. If you are new to Hack, you can [follow the steps for writing your first Hack program](https://docs.hhvm.com/hack/getting-started/getting-started#your-first-hack-program). The
key items of note are:
    * The typechecker `hh_client` is on your `$PATH` (if you did the default install of
      HHVM, then it should be there by default).
    * You have an `.hhconfig` file at the root of your project.
    * You have `<?hh` at the top of your `.php` or `.hh` file.

## Feature Examples

Type Hint with mouse hover:

![Hack type hinting](/static/images/docs/HackTypeHinting.png)

Inline error highlighting and diagnostics:

![Hack error highlighting](/static/images/docs/NuclideHackError.gif)

Inline autocomplete for Hack and PHP:

![Inline autocomplete](/static/images/docs/HackAutocomplete.gif)

And an omni-search bar that'll find anything in your project:

![Hack omni-search](/static/images/docs/NuclideSearch.gif)
