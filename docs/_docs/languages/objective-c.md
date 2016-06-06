---
id: language-objective-c
title: Objective-C
layout: docs
permalink: /docs/languages/objective-c/
---

Nuclide has *limited*, built-in support for
[Objective-C](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/Introduction/Introduction.html),
which allows you to build native [iOS](/docs/platforms/ios) applications directly within Nuclide.

* TOC
{:toc}

## Install Objective-C

By installing [Xcode](https://developer.apple.com/xcode/), you will have full access to Objective-C.

> Linux does not have Xcode, However, there are ways to compile Objective-C programs on Linux using
> `gobjc`, [`gnustep`](http://www.gnustep.org/), etc.

However, to get full [feature list](#buck-enabled-features) for Objective-C support, you must
compile your Objective-C program with [Buck](http://buckbuild.com).

## Default Features

Objective-C's integration into Nuclide provides you with productivity features out-of-the-box such
as:

* [Automatic Bracket Completion](#default-features__automatic-bracket-completion)
* [Automatic Colon Indenting](#default-features__automatic-colon-indenting)

### Automatic Bracket Completion

If you forget to put a starting bracket at the end of your target or selector, one will be inserted
for you automatically if you add the ending bracket. And this will work for any number of bracket
levels deep.

For example, if you add an ending bracket here...

![](/static/images/docs/language-objc-before-bracket-insert.png)

... then the beginning bracket is inserted for you automatically.

![](/static/images/docs/language-objc-after-bracket-insert.png)

To enable this setting, go to the Nuclide Settings page either by the
[toolbar](/docs/features/toolbar) or by the menu via `Package | Settings View | Open | Packages`,
and enable automatic bracket completion.

![](/static/images/docs/language-objc-auto-bracket-completion-setting.png)

### Automatic Colon Indenting

Nuclide will automatically indent the colons (`:`) associated with new method arguments to be
aligned with the arguments of that method.

If you start a `:` at the beginning of the next line after the method declaration...

![](/static/images/docs/language-objc-before-colon-indent.png)

... it will be aligned automatically.

![](/static/images/docs/language-objc-after-colon-indent.png)

## Buck-enabled Features

The following features require that your Objective-C project is compiled with
[Buck](http://buckbuild.com).

> You can also generate a `compile_commands.json` file with the
> [`json-compilation-databse` reporter](https://github.com/facebook/xctool#included-reporters)
> of [`xctool`](https://github.com/facebook/xctool) to get these features.

<br/>

* [Code Diagnostics](#buck-enabled-features__code-diagnostics)
* [Inline Type Hints](#buck-enabled-features__type-hints)
* [Autocomplete](#buck-enabled-features__autocomplete)
* [Jump to Definition](#buck-enabled-features__jump-to-definition)

> The [Buck toolbar](/docs/platforms/ios/#running-applications__buck-integration) allows you to
> build and run your Buck-enabled programs.

### Code Diagnostics

If you write code that will cause `clang` errors or warnings, Nuclide's code diagnostics will show
you the error. You can see the error in two places: inline within the
[main text editor](/docs/editor/basics/#editing-area) and in the
[code diagnostics](/docs/editor/basics/#status-bar__code-diagnostics) pane.

![](/static/images/docs/language-objc-code-diagnostics.png)

Hover over the sideways red triangle in the [gutter](/docs/editor/basics/#gutter) to see the
`clang` error inline.

![](/static/images/docs/language-objc-lint-gutter.png)

### Type Hints

Hovering over an Objective-C object will provide you the type of that object inline.

![](/static/images/docs/language-objc-typehint.png)

You can also pin type hints to the [main editor](/docs/editor/basics/#editing-area) so that they
are always visible.

![](/static/images/docs/language-objc-pinned-typehint.png)

> Pinned type hints can be moved around and placed anywhere in the editing window.

### Autocomplete

Buck enhances the understanding of the types of objects in your project so that autocomplete can be
enabled.

![](/static/images/docs/language-objc-autocomplete.png)

> Without Buck, you will still get the default autocomplete feature, but without project and object
> specific information.

### Jump To Definition

Nuclide provides a jump to definition/symbol feature for Objective-C programs.

For example, if you want to go to the definition of `initWithHelloString`, you will hover over
`initWithHelloString` and either press `cmd-<mouse click>` (`ctrl-<mouse click>`) or
`cmd-option-Enter` (`ctrl-alt-Enter` on Linux).

![](/static/images/docs/language-objc-jump-to-definition-link.png)

![](/static/images/docs/language-objc-jump-to-definition-result.png)

### Jump Between Header and Implementation

Using `cmd-option-n` (`ctrl-alt-n` on Linux), you can jump between header (e.g., `.h`) and
implementation files (`.cpp`).

## Debugging

Nuclide has support for both [iOS](/docs/platforms/ios) debugging through
[React Native](/docs/platforms/react-native/#debugging) and native Objective-C (e.g., `.m` files)
applications. This section discusses the latter.

> Debugging Swift applications is currently not supported.

### Buck

Currently, debugging Objective-C applications requires compiling your program with
[Buck](https://buckbuild.com/).

> Optimally it would be nice to run the application directly from Xcode and attach to the
> simulator process associated with that Xcode project. However, due to `lldb` process conflict
> issues, this is currently not possible.

### Open your Project

Open your Objective-C project normally so that it appears in the
[project explorer](/docs/editor/basics/#project-and-file-explorer).

![](/static/images/docs/feature-debugger-languages-ios-project.png)

### Bring up the Buck Toolbar

Using the [Nuclide toolbar](/docs/features/toolbar/#buttons) (or using the
[command-palette](/docs/editor/basics/#command-palette) `Nuclide Buck Toolbar: Toggle`).

![](/static/images/docs/feature-debugger-languages-ios-nuclide-toolbar-buck.png)

![](/static/images/docs/feature-debugger-languages-ios-buck-toolbar.png)

### Find Your Build Target

Nuclide will automatically search your `.buckconfig` file and find your build target. Once you
find the appropriate target, choose it.

![](/static/images/docs/feature-debugger-languages-ios-build-target.png)

### Start Debugging

Set [breakpoints](/docs/features/debugger/#basics__breakpoints) in your Objective-C files and press
the `Debug` button.

You will see Buck starting to compile your application, the iOS simulator appear for your
application, and then the debugger show and stopped on your first breakpoint.

![](/static/images/docs/feature-debugger-languages-ios-debugger-breakpoint.png)

And from here you can [debug normally](/docs/features/debugger/#basics__debugger).

### LLDB Commands

Native iOS debugging uses [LLDB](http://lldb.llvm.org/) as its debugging backend. You can run LLDB
commands directly in the Nuclide debugger [console](#basics__evaluation).

![](/static/images/docs/feature-debugger-languages-ios-console.png)
