---
id: feature-debugger
title: Debugger
layout: docs
permalink: /docs/features/debugger/
---

One of the key features of Nuclide is its multiple-language debugging support. The Nuclide debugger
is provided within the familiar [Chrome DevTools](https://developer.chrome.com/devtools) interface.

The Nuclide debugger provides many capabilities allowing you to have a productive debug loop,
including inspection and watches, setting breakpoints, step in/over/out, etc.

* TOC
{:toc}

## Instantiation

In general, the debugger is instantiated via `cmd-shift-Y` (`ctrl-shift-Y` on Linux). You can also
toggle the debugger through the [command palette](/docs/editor/basics/#command-palette) and the
Nuclide toolbar.

## Basics

Nuclide supports debugging for [multiple languages](#language-specific-debugging). However,
there are some basic debugging concepts that apply across all languages. Debugging a Node project
will be used to help illustrate the points described here.

### Debuggable Target

Specific details are provided for [each platform](#language-specific-debugging), but, in general,
to begin debugging code in Nuclide, you need to either launch a debug process from within Nuclide
(e.g., iOS from the Buck toolbar) or attach to a  currently running process (e.g., `node`) for
debugging.

*Example*

If you have a Node project running (e.g, via `npm start` or `node yourfile.js`), first press
`cmd-shift-Y` (`ctrl-shift-Y` on Linux) to toggle the debugger. Then, attach Nuclide to the
relevant `node` process. The number in `()` is the process id (pid).

![](/static/images/docs/feature-debugger-basics-target-process.png)

> If you have multiple processes running with the same name, you can use something similar to
> `ps aux | grep <process-name>` or Apple's Activity Monitor to find the process ID (pid) that
> matches with the process in the process list in Nuclide.

> If you stop your process and restart it again, make sure you press the `Refresh List` button since
> the pid will have changed.

Once you attach to a process, you may see a confirmation of the attachment on the command-line for
that process.

```bash
$ node read.js
Starting debugger agent.
Debugger listening on port 5858
```

After attaching to the process by pressing `Attach`, you should see the debugger UI showing you
both the main Debugger and `Console` tabs.

> The main debugging tab is titled `Sources`. However, since we don't display source code in this
> tab, it is currently a misnomer. We may retitle this to `Debugger` in the future.  

![](/static/images/docs/feature-debugger-basics-target-after-attach.png)

### Breakpoints

To set a breakpoint in Nuclide, you use the [gutter](/docs/editor/basics#gutter). Click to the left
of each line number in the file(s) on which you want Nuclide to break the running program. Then
as the program in running, if a line on which a breakpoint is set is hit, the program halts and you
are able to perform debugging tasks such as [step](#basics__stepping) and
[evaluation](#basics__evaluation) from that point.

> There is currently only one type of breakpoint called a *source breakpoint*. This is a breakpoint
> on one line of code. We are looking into ways to support functional, conditional, and other types
> of breakpoints.

*Example*

Here we have breakpoints on lines 13 and 18 of `read.js`.

![](/static/images/docs/feature-debugger-basics-breakpoints-gutter.png)

In the [main debugging](#basics__debugger) tab of the debugger, you will see what
breakpoints are set as well.

![](/static/images/docs/feature-debugger-basics-breakpoints-main-debugging-tab.png)

### Debugger

The main debugging tab is the information control center for the Nuclide debugger.

![](/static/images/docs/feature-debugger-basics-main-debugging-tab.png)

In additions to specialized areas described below, it also provides mouse-clickable execution,
[stepping](#basics__stepping), and breakpoint options.

*Watches*

The `Watch` area is for you to keep track of the values of global and local variables. Press `+` to
add a variable. Right-clicking in the area will give you context-aware options to add and delete
watch expressions.

![](/static/images/docs/feature-debugger-basics-debugger-watch-menu.png)

*Call Stack*

The `Call Stack` area shows you were you came from to get to your current point in the code. The
top function is where you currently are, the function below the top is the one that called the
current function, and so on. Clicking on any function in the call stack will change the scope
information so that it is relevant to that function.

*Scope*

The `Scope` area shows you scope information based upon the current point in the running of the
code. For example, local scope will show you the name and values of local variables.

*Breakpoints*

The `Breakpoints` area shows you all the places in your project where you have breakpoints set. If
any are highlighted, that means that you have now hit that breakpoint while running the code. Right
clicking in the area will give you context-aware options to add, remove, activate and deactivate
breakpoints.

![](/static/images/docs/feature-debugger-basics-debugger-breakpoint-menu.png)

*Unresolved Breakpoints*

These are breakpoints that cannot be resolved by the debugger. The most likely cause of an
unresolved breakpoint is putting a breakpoint on code that is not part of the project on which the
debugger process is attached.

*Detaching*

You can detach the debugger from the current process by clicking on
![](/static/images/docs/feature-debugger-basics-debugger-detach.png) in the upper-right corner.
This will stop the entire debugging session for that process.

*Web Inspector*

You can open the web inspector by clicking on the settings icon
![](/static/images/docs/feature-debugger-basics-debugger-web-inspector.png). This will bring up
a [Chrome Developer Tools window](https://developers.google.com/web/tools/chrome-devtools/) for the
current debugging frame.

*Example*

Here we have a breakpoints set on line 10 of `read.js` and line 3 of `math.js`. We set watches on
the two global variables in `read.js`, `num1` and `num2`. The call stack shows that we are
currently in the `processSum` method and started from the `onData` method.

![](/static/images/docs/feature-debugger-basics-debugger-example.png)

### Stepping

It is essential for any debugger to have a mechanism to step into, over and out of code. The
Nuclide debugger provides stepping functionality with shortcuts within the debugger itself and
via the [keyboard](/docs/editor/keyboard-shortcuts/#debugger).

![](/static/images/docs/feature-debugger-basics-stepping-icons.png)

*Example*

Assume we have a breakpoint set at line 22 of `read.js` (before the call to `processSum()`).

![](/static/images/docs/feature-debugger-basics-stepping-example-start.png)

The following shows what happens when you step into the function. We step into the actual
`processSum()` function itself.

![](/static/images/docs/feature-debugger-basics-stepping-example-step-in.png)

The following shows what happens when you step over the function. `processSum()` is fully executed
and we move on to closing the `readline` object.

![](/static/images/docs/feature-debugger-basics-stepping-example-step-over.png)

You can even step into a function that exists in another module.

![](/static/images/docs/feature-debugger-basics-stepping-example-start-other-module.png)

### Evaluation

The Nuclide debugger supports
[REPL](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop) via the `Console` tab.

When you hit a breakpoint during your debugging session, you can use the `Console` to write
expressions, call functions, etc. using the current state of the program at the breakpoint.

> For Hack and PHP debugging, hitting a breakpoint is not necessary to use the REPL support of
> the Nuclide debugger. If you do not hit a breakpoint, then REPL is run in the global context as
> opposed to the current stack frame if breakpoint is hit.

> For LLDB-based debugging, REPL runs LLDB debugger commands as opposed to evaluating code in the
> debuggee.

*Example*

Here we have a breakpoint before printing out the sum of the two global variables `num1` and `num2`.
This shows printing out the values of the global and local variables, writing simple expressions,
calling a function in another module (`math.add()`), and inspecting objects.

![](/static/images/docs/feature-debugger-basics-evaluation-example.png)

## Language Specific Debugging

While the [general process](#basics) for debugging in Nuclide is similar, there are platform and
language specific debugging workflows that require discussion and illustration.

- [Hack and PHP](/docs/languages/hack/#debugging)

### Node

The [general Nuclide debugging section](#basics) is centered around debugging with Node. If your
project is written in [Flow or JavaScript](/docs/languages/flow/), you can use Nuclide's Node
debugging.

### C++

Nuclide supports [LLDB](http://lldb.llvm.org/) as the backend for its native C++ debugging.

> At a minimum, you must have a C++ compiler (e.g., `g++` or `clang++`) and the LLVM Debugger
> (`lldb`) installed to use this feature. For example, on a Mac, if you install
> [Xcode](https://developer.apple.com/xcode/) with its command-line tools, these will be installed
> for you.

> Your C++ code must be compiled with debug symbols. For `g++` or `clang++`, this is accomplished
> by using `-g`. e.g., `clang++ hello.cpp -g -o hello.cpp`. If you are using `cmake` or some other
> build management system, ensure that you are compiling in debug mode with symbols.

Debugging C++ requires attaching to a running C++ process (after
[adding a C++ project](/docs/quick-start/getting-started/#adding-a-project) to Nuclide). Once you
compile your code, run it.

> Currently, unless your program has a built-in execution blocking mechanism, you are going to have
> to add a block (e.g., via something like a `getChar()`) in order to pause execution such that the
> debugger can run. In the future, we are planning to support *launching* your C++ program from
> Nuclide itself where this will not be necessary.

Bring up the debugger target pane via `cmd-shift-Y` (`ctrl-shift-Y` on Linux). In the process list
you should find your program name prefixed by `lldb:` and postfixed by the process id.

![](/static/images/docs/feature-debugger-languages-cpp-attach.png)

After you attach to the process, the actual Nuclide Debugger appears. And you can debug your
code [normally](#basics), by first pressing the [resume execution button](#basics__stepping).

![](/static/images/docs/feature-debugger-languages-cpp-breakpoint.png)

> In order to actually break into debug mode, you may have to click the resume execution button one
> time. If, when the debugger appears, you are paused, click the button and debugging should begin.

![](/static/images/docs/feature-debugger-languages-cpp-quirk.png)

*LLDB Commands*

You can run LLDB commands directly in the Nuclide debugger [console](#basics__evaluation).

![](/static/images/docs/feature-debugger-languages-cpp-console.png)

### React Native

[React Native](https://facebook.github.io/react-native/) has first-class support within Nuclide.
The debugger is no exception.

From Nuclide, you can start a React Native development server, inspect React Native elements and
use the [debugger](#basics) to set and stop on breakpoints, etc.

> In order to use React Native within Nuclide, you must
[install](https://facebook.github.io/react-native/docs/getting-started.html) it.

*Loading a React Native Project*

You open a React Native project the
[usual way](/docs/quick-start/getting-started/#adding-a-project). Nuclide will automatically
establish that you have a React Native project by seeing the `node_modules/react-native` directory
from the root of your project.

*Command Palette*

All React Native features are currently available from the
[command palette](/docs/editor/basics/#command-palette).

![](/static/images/docs/feature-debugger-languages-react-native-command-palette.png)

*React Native Server*

The first step to debugging React Native is to launch the React Native Server from within Nuclide.
Using the [command palette](/docs/editor/basics/#command-palette), launch
`Nuclide React Native: Start Packager`. This will bring up a tab in the
[main editing](/docs/editor/basics/#editing-area) area titled "React Native Server".

![](/static/images/docs/feature-debugger-languages-react-native-server.png)

Notice that the server is running on the default port `8081`. You can stop and restart the server
at anytime.

*Prime the Debugger*

After starting the server, you can prime the React Native debugger for when the application begins
running. From the [command palette](/docs/editor/basics/#command-palette), launch
`Nuclide React Native: Start Debugging`.

You might see that the Nuclide debugger will not load yet; instead showing you a waiting condition.

![](/static/images/docs/feature-debugger-languages-react-native-debugger-priming.png)

This means that the debugger is waiting to attach to the actually running process of the React
Native application.

*Run the React Native Application*

Start the React Native Application. If running from the command-line, ensure that you are in the
root directory of the React Native project.

Here is an example of how you might run the Application

```bash
$ react-native run-ios
```

This should bring up the simulator with your running application inside.

*Enable Debugging from the Application*

From the simulator, you will want to enable debugging the application. Press `cmd-D` (`ctrl-D` on
Linux). This will bring up the debug options for your application. Choose `Debug in Chrome`.

![](/static/images/docs/feature-debugger-languages-react-native-application-debug-options.png)

> `Debug in Chrome` in this case is a bit of a misnomer since you will actually be debugging
> through the Nuclide debugger (based on Chrome Dev Tools).

> If you have enabled debugging in a previous session, then debugging will still be enabled; thus,
> this step will not be necessary.

*Start Debugging*

After you enable debugging from the simulated application, Nuclide will attach to that debugging
process automatically, since we primed the debugger above. You can now set breakpoints, watches,
etc.

> You can set breakpoints, watches, etc. earlier than this step, but access to them will not be
> available until the debugging has been enabled.

> In order to actually break into debug mode, you may have to click the resume execution button
> (![](/static/images/docs/feature-debugger-languages-react-native-debugger-resume.png)) one time.
> If, when the debugger appears, you are
> paused (![](/static/images/docs/feature-debugger-languages-react-native-debugger-pause.png)),
> click the button and debugging should begin.

Now you can start debugging your React Native application as [normal](#basics).

![](/static/images/docs/feature-debugger-languages-react-native-debugging.png)

*Element Inspector*

The React Native debugger in Nuclide also provides an Element Inspector, where you can view and
toggle properties of your application.

From the [command palette](/docs/editor/basics/#command-palette), choose
`Nuclide React Native Inspector: Show`. This will bring up a tab in the
[main editing](/docs/editor/basics/#editing-area) area titled "React Native Inspector".

![](/static/images/docs/feature-debugger-languages-react-native-element-inspector.png)

To see the actual elements highlighted in the Nuclide element inspector also highlighted in the
simulator, you must enable the simulator inspctor as well. Press `cmd-D` (`ctrl-D on Linux`) within
the simulator and choose `Show Inspector`.

![](/static/images/docs/feature-debugger-languages-react-native-application-show-inspector.png)

### iOS

While Nuclide has support for iOS debugging is through
[React Native](#language-specific-debugging__react-native), it also has support for debugging native
[Objective-C](/docs/languages/objective-c) (e.g., `.m` files) applications.

> Debugging Swift applications is currently not supported.

*Buck*

Currently, debugging Objective-C applications requires compiling your program with
[Buck](https://buckbuild.com/).

> Optimally it would be nice to run the application directly from XCode and attach to the
> simulator process associated with that XCode project. However, due to `lldb` process conflict
> issues, this is currently not possible.

*Open your Project*

Open your Objective-C project normally so that it appears in the
[project explorer](/docs/editor/basics/#project-and-file-explorer).

![](/static/images/docs/feature-debugger-languages-ios-project.png)

*Bring up the Buck Toolbar*

Using the [Nuclide toolbar](/docs/features/toolbar/#buttons) (or using the
[command-palette](/docs/editor/basics/#command-palette) `Nuclide Buck Toolbar: Toggle`).

![](/static/images/docs/feature-debugger-languages-ios-nuclide-toolbar-buck.png)

![](/static/images/docs/feature-debugger-languages-ios-buck-toolbar.png)

*Find Your Build Target*

Nuclide will automatically search your `.buckconfig` file and find your build target. Once you
find the appropriate target, choose it.

![](/static/images/docs/feature-debugger-languages-ios-build-target.png)

*Start Debugging*

Set [breakpoints](/docs/features/debugger/#basics__breakpoints) in your Objective-C files and press
the `Debug` button.

You will see Buck starting to compile your application, the iOS simulator appear for your
application, and then the debugger show and stopped on your first breakpoint.

![](/static/images/docs/feature-debugger-languages-ios-debugger-breakpoint.png)

And from here you can [debug normally](/docs/features/debugger/#basics__debugger).

*LLDB Commands*

Native iOS debugging uses [LLDB](http://lldb.llvm.org/) as its debugging backend. You can run LLDB
commands directly in the Nuclide debugger [console](#basics__evaluation).

![](/static/images/docs/feature-debugger-languages-ios-console.png)

### Android

Debugging Android applications is currently not supported except through the logs provided
by Nuclide's [Android Debug Bridge (ADB) Logcat support](/docs/platform/android/emulator-logs).
