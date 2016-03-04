---
id: language-cpp
title: C++
layout: docs
permalink: /docs/languages/cpp/
---

Nuclide provides support for C++ developers.

* TOC
{:toc}

## Supported Compilers

Beyond basic syntax highlighting and a generic autocomplete, in order to get the full features for
a C++ project, you must build your project with either [Buck](http://buckbuild.com) or the
combination of [CMake](https://cmake.org/) and
[Clang](http://clang.llvm.org/)/[GNU Compiler](https://gcc.gnu.org/) with the
[`CMAKE_EXPORT_COMPILE_COMMANDS`](http://clang.llvm.org/docs/JSONCompilationDatabase.html) flag.

### Installing CMake and Clang

*CMake*

You can install CMake using one of the [pre-compiled binaries](https://cmake.org/install/) for
Linux and Mac.

*Clang*

Clang is generally provided by default on all major Linux distributions. You can use your packaging
system to install it (e.g., `sudo apt-get install clang libclang`)

> You can [build clang from source](http://clang.llvm.org/get_started.html) on Linux as well.

On a Mac, install clang by installing [Xcode](https://developer.apple.com/xcode/).

> Xcode is required because one of its commands is used to find the Clang library `libclang`

*Verify Install*

You can verify that clang is installed by typing `clang++ --version` at the command line.

> A similar install process occurs for GNU `g++`. It is provided with Xcode. And you can install
> it via a Linux package (e.g., `sudo apt-get install g++`).

*Building*

Once Clang is installed, you need to build your C++ project with `cmake`, passing in the
`CMAKE_EXPORT_COMPILE_COMMANDS` flag. This will create a `compile_commands.json` file which lives
in the root of your project and provides the necessary information for the
[Nuclide C++ feature support](#features).

> If you use [Buck](#supported-compilers__installing-buck), you will not need to build with this
> flag.

### Installing Buck

Buck is [available](https://buckbuild.com/setup/install.html) via Homebrew on a Mac, or you can
build from source on Linux.

*Building*

Your C++ project must be set up for a Buck build by creating
[rules and targets](https://buckbuild.com/about/overview.html).

## Features

C++'s integration into Nuclide provides you with productivity features such as:

- [Code Diagnostics](#features__code-diagnostics)
- [Autocomplete](#features__autocomplete)
- [Jump To Declaration](#features__jump-to-declaration)
- [Jump Between Header and Implementation](#features__jump-between-header-and-implementation)
- [Type Hinting](#features__type-hinting)
- [Code Formatting](#features__code-formatting)
- [Debugger Support](/docs/features/debugger/#language-specific-debugging__c)

> Remember that these features are only fully-enabled when used with a
> [supported compiler](#supported-compiler).

### Code Diagnostics

If you write code that will not compile correctly, Nuclide will warn you through its
[code diagnostics](/docs/editor/basics/#code-diagnostics) pane, as well with inline
[gutter](/docs/editor/basics/#gutter) tooltips (represented by a sideways red triangle).

![](/static/images/docs/language-cpp-code-diagnostics.png)

For [gutter diagnostics](/docs/editor/basics/#gutter), you will sometimes see a `Fix` button. For
some common errors (e.g. missing semicolon), you can click the `Fix` button and it will fix the
problem for you.

In this example, clicking the `Fix` button will insert a semicolon for you.

![](/static/images/docs/language-cpp-code-diagnostics-gutter-fix.png)

### Autocomplete

Nuclide uses metadata from your Clang or Buck build to understand the objects within your project.
This allows for a detailed autocomplete feature, providing you hints on what is available for a
given object.

![](/static/images/docs/language-cpp-autocomplete.png)

### Jump to Declaration

You can click on a function call for your project and be taken directly to the declaration for that
function.

Using `cmd-<mouse-click>` or `cmd-option-Enter` (`ctrl-<mouse-click>` or `ctrl-alt-Enter` on
Linux), the function call will be underlined.

![](/static/images/docs/language-cpp-jump-to-declaration-link.png)

Then, you will be taken to the declaration for that function.

![](/static/images/docs/language-cpp-jump-to-declaration-result.png)

### Jump Between Header and Implementation

Using `cmd-option-n` (`ctrl-alt-n` on Linux), you can jump between header (e.g., `.h`) and
implementation files (`.cpp`).

### Type Hinting

If you hover over a variable, Nuclide will show you a datatip with its type.

![](/static/images/docs/language-cpp-type-hint.png)

You can even pin type hints to the [main editor](/docs/editor/basics/#editing-area) so that they
are always shown.

Click on the pin on the type hint to pin the hint and the `x` to remove the pinned hint. You can
even move the type hints anywhere within the editor.

![](/static/images/docs/language-cpp-type-hint-pinned.png)

> Hovering over a pinned type hint will highlight the variable associated with it. This is useful
> if you have two pinned type hints for variables on the same line.

### Code Formatting

If you place your cursor on a function or line of code, Nuclide will format that code based on a
set of default Clang standards.

You can press `cmd-shift-c` (`ctrl-shift-c` on Linux) or use the context-aware menu and choose
`Format Code` to take a piece of code that looks like this...

![](/static/images/docs/language-cpp-code-formatting-before.png)

... and format it like this:

![](/static/images/docs/language-cpp-code-formatting-after.png)
