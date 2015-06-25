# Flow

This package provides integration with [Flow](http://flowtype.org/), a static
type checker for JavaScript.

It requires that Flow is already present on your system. Follow [these
instructions](http://flowtype.org/docs/getting-started.html) to install Flow
if you do not already have it. Unfortunately Flow currently has [no Windows
support](https://github.com/facebook/flow/issues/6), so this package will not
work on Windows.

This is what you need to do to get Flow working on your system:

* Install Flow.
* Make sure `flow` is on your `$PATH`, or specify the path to the `flow` binary in
  the settings for this package.
* Create a `.flowconfig` file in the root of your project (this can be empty).
* Add `/* @flow */` to the top of JavaScript files that you want checked.

Visit the [Flow page](http://flowtype.org/) for more detailed instructions.

# Overview

* Shows Flow errors inline
* Provides Flow-drive inline autocomplete
* `cmd-click` on a symbol jumps to its definition
* Hovering over an expression exposes its type

# Examples

This package shows Flow errors inline:

![Inline Errors](./images/FlowInlineError.gif)

This package also integrates click to symbol with Flow, so a `cmd-click` on a
symbol will jump to its definition.

![Click to Symbol](./images/FlowClickDefine.gif)
