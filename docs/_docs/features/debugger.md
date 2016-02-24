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

While the [general process](#basics) for debugging in Nuclide is similar, it is useful to discuss
and illustrate platform and language specific debugging workflows.

### PHP and Hack

Nuclide has support for debugging PHP and Hack projects.
[HHVM](https://docs.hhvm.com/hhvm/installation/introduction) is required for debugging
Hack and PHP code.

> Theoretically, PHP debugging should work on other XDebug-compatible runtimes like Zend, but we
> have only tested this with HHVM.

> Currently, we only support debugging [remote](/docs/features/remote/) projects.

*XDebug*

In order for the Nuclide debugger to attach properly to the HHVM process, you must enable
[XDebug](https://xdebug.org/) in your HHVM configuration. You do this by specifying
[XDebug configuration](https://xdebug.org/docs/all_settings) information in a `.ini` file that will
be passed to the HHVM executable. Here is an example `.ini` file that can be used:

```bash
xdebug.enable = 1
xdebug.remote_enable = 1
xdebug.remote_autostart = 1
xdebug.overload_var_dump = 0
xdebug.remote_port = 9000
```

> In the Nuclide Settings, there is an option to specify the remote port as well. If you specify
> the port in an ini file via `xdebug.remote_port`, make sure that setting matches what is in the
> Nuclide setting.

*Debugging*

The [basic debugging information](#basics) generally apply to PHP and Hack projects.

1. Have a PHP or Hack file active in the [editing area](/docs/editor/basics/#editing-area).
2. `cmd-shift-Y` to bring up the process attachment UI.
3. Choose the remote server that has your project and HHVM installed from the attachment UI.
It should look similar to:

    ![](/static/images/docs/feature-debugger-languages-hack-php-attach.png)

4. Click `Attach`.
5. Set [breakpoints](#basics__breakpoints) in your code.
6. Run your PHP/Hack script or server
    1. If you are running a script: `hhvm -c xdebug.ini your-script.php`
    2. If you are running a server: `hhvm -c xdebug.ini -m server`
7. Start Debugging.
    1. If you are debugging a server, you will need to send a request to that server in order for
    the server breakpoint to be hit.

Here is an example of debugging a running HHVM server:

![](/static/images/docs/feature-debugger-languages-hack-php-server-debugging.png)

In both the script and server launching/attaching scenarios, the line at which you've set a
breakpoint will highlight in blue when the breakpoint is hit. When this happens, execution of your
code is paused and you can use the debugger to step, evaluate expressions, inspect the current
callstack, etc.

*Output Window*

When you launch the debugger for Hack and PHP, an `Output` window will appear in a tab in a
separate pane. When debugging, HHVM will send its stdout to this window. This includes output from
`print()` (or similar) statements and stacktraces.

*Filtering*

After you attach to a remote server with HHVM, the debugger will then utilize the *first* instance
of HHVM that is run with the correct `.ini` configuration, etc. If you are running multiple
instances of HHVM with that configuration, you might start debugging on code on which you did not
intend.

Nuclide provides a mechanism to filter out the proper, intended script. For example, if you know
the script name that will be debugged, then use that as the filter.

Go to `Settings | Packages | Nuclide | Settings` and look for:

![](/static/images/docs/feature-debugger-languages-hack-php-filtering.png)

*Other Settings*

There are other Hack and PHP debug settings that can be set as they pertain to HHVM. These include:

- Filtering debugging connections by user name (`idekey`). By default, this is set to the user that started the HHVM process (can override with `xdebug.idekey` in a `.ini` file).
- HHVM logging level. The default is `INFO`.
- Debugging Port. The default is `9000`. If you override this is in an `.ini` file, ensure that your setting matches this setting.

Go to `Settings | Packages | Nuclide | Settings` and look for the `nuclide-debugger-hhvm` settings.

### Node

### C++

### React Native

### iOS
