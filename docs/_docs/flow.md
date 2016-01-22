---
id: flow
title: Flow and JavaScript
layout: docs
permalink: /docs/flow/
---

Nuclide has built in support for [Flow-enabled](http://flowtype.org) JavaScript (and regular JavaScript too), including
click-to-define (`cmd-click`):

![Nuclide click to define](/static/images/docs/FlowClickDefine.gif)

Inline diagnostics and error highlighting:

![Nuclide error highlighting](/static/images/docs/FlowInlineError.gif)

There is also support for inline autocomplete of JavaScript functions and methods.

### Getting Flow to Work With Nuclide

If there is a .flowconfig file in the same directory as the .js file you are editing (or in a
parent directory), then Nuclide will leverage Flow to add support when editing your .js files.

If some of the features do not seem to be working, make sure you remembered to include
`/* @flow */` at the top of your .js file, and make sure [Flow is installed](http://flowtype.org)
on your machine.

If you visit the preferences for the Flow package, you can specify the location of Flow on your
system if it is not on your $PATH.
