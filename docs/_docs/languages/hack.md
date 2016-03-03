---
id: language-hack
title: Hack
layout: docs
permalink: /docs/languages/hack/
---

Nuclide has been built from the start to provide a great IDE experience for
[Hack](http://hacklang.org) development. Hack is a programming language for
[HHVM](http://hhvm.com).

> Currently, HHVM is [not supported on Windows](https://docs.hhvm.com/hhvm/installation/windows), so
> this integration has limited viablity on that platform. However,
> [work is being done](https://github.com/facebook/hhvm/issues/5460) to port HHVM to Windows.

* TOC
{:toc}

## Installing Hack

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

> If you are planning on developing with Hack [remotely](/docs/features/remote), ensure HHVM and
> Hack are installed on the *remote* machine.

## Features

Hack's integration into Nuclide provides you with productivity features such as:

* [Code Diagnostics](#features__code-diagnostics)
* [Autocomplete](#features__autocomplete)
* [Jump to Definition](#features__jump-to-definition)
* [Inline (mouse over) typehinting](#features__type-hinting)
* [Code formatting](#features__code-formatting)
* [Debugging](/docs/features/debugger/#language-specific-debugging__php-and-hack)
* [Omnisearch](/docs/features/quick-open), with a special
  [Hack symbol](/docs/features/quick-open#hack-symbols) search pane.

### Code Diagnostics

If you write code that will not correctly
[typecheck](https://docs.hhvm.com/hack/typechecker/introduction), Nuclide has code diagnostics that
will show you the error. You can see the error in two places, inline within the
[main text editor](/docs/editor/basics/#editing-area) and in the
[code diagnostics](/docs/editor/basics/#status-bar__code-diagnostics) pane.

![](/static/images/docs/language-hack-code-diagnostics.png)

Hover over the sideways red triangle in the [gutter](/docs/editor/basics/#gutter) to see the Hack
error inline.

![](/static/images/docs/language-hack-code-diagnostics-gutter.png)

### Autocomplete

Given that Nuclide has access to all of the type information within your project and the built-in
types provided by Hack, autocomplete just works.

![](/static/images/docs/language-hack-autocomplete.png)

### Jump to Definition

Nuclide provides a jump to definition/symbol feature for Hack programs.

> In order for this to work, you must have a `.hhconfig` file in the root of your project and a
> running `hh_server` monitoring the root as well.

For example, if you want to go to the definition of `getPages()`, you will hover over `getPages()`
and either press `cmd-<mouse click>` or `cmd-option-Enter` (`ctrl-alt-Enter` on Linux).

![](/static/images/docs/language-hack-jump-to-definition-link.png)

![](/static/images/docs/language-hack-jump-to-definition-result.png)

### Type Hinting

If you hover over a variable in your Hack file, you can get the type of the variable directly
inline.

![](/static/images/docs/language-hack-typehint.png)

In fact, you can even pin that type hint so that it always shows as well. Just click on the pin
when hovering over a variable and it will be pinned.

![](/static/images/docs/language-hack-pinned-typehint.png)

The highlighted variables show that their type variables have been pinned. If you hover over the
type hint, its associated variable will have motion in its highlight.

Click the `x` to remove the pinned type hint.

> Pinned type hints can be moved anywhere within the editor.

### Code Formatting

Nuclide can take your Hack code and format it according to a built-in set of coding standards
(e.g, two-space indents, bracket location, etc.).

For example, here is a bit of code that looks relatively haphazard from a formatting perspective.

![](/static/images/docs/language-hack-badly-formatted.png)

If your cursor is inside the function and you `cmd-shift-C` (`ctrl-shift-C` on Linux), your will be
formatted.

![](/static/images/docs/language-hack-well-formatted.png)
