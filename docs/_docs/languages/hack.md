---
pageid: language-hack
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

<br/>

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
* [Omnisearch](/docs/features/quick-open), with a special
* [Hack symbol](/docs/features/quick-open#hack-symbols) search pane.

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

## Debugging

Nuclide has support for debugging PHP and Hack projects.
[HHVM](https://docs.hhvm.com/hhvm/installation/introduction) is required for debugging
Hack and PHP code.

> Theoretically, PHP debugging should work on other XDebug-compatible runtimes like Zend, but we
> have only tested this with HHVM.

> Currently, we only support debugging [remote](/docs/features/remote/) projects.

### XDebug

In order for the Nuclide debugger to attach properly to the HHVM process, you must enable
[XDebug](https://xdebug.org/) in your HHVM configuration.

> Your remote server may already have the appropriate settings so that this step is not necessary.

You do this by specifying [XDebug configuration](https://xdebug.org/docs/all_settings) information
in a `.ini` file that will be passed to the HHVM executable. Here is an example `.ini` file that can
be used:

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

### Debugging: HHVM Toolbar

Nuclide provides an HHVM toolbar. You can launch the toolbar from the
[Nuclide toolbar](/docs/features/toolbar/#buttons) or from the
[command-palette](/docs/editor/basics/#command-palette) with `Nuclide HHVM Toolbar: Toggle`.

> You have to have a Hack or PHP file open to successfully launch the toolbar.

![](/static/images/docs/feature-debugger-languages-hack-php-hhvm-toolbar.png)

Now you can choose between debugging a webserver or a script.

![](/static/images/docs/feature-debugger-languages-hack-php-hhvm-toolbar-webserver-script.png)

Set [breakpoints](/docs/features/debugger/#basics__breakpoints) in your code.

Once you decide the type of debugging you plan to do, click `Attach`. This will bring up the
debugger UI and stop at the first breakpoint you set.

You can then follow the [basic debugging information](/docs/features/debugger/#basics) provided
above and use the additional features of the Output Window, Evaluation and other HHVM-specific
debugging settings as described below to debug your code.

Here is an example of debugging a running HHVM server:

![](/static/images/docs/feature-debugger-languages-hack-php-server-debugging.png)

In both the script and server launching/attaching scenarios, the line at which you've set a
breakpoint will highlight in blue when the breakpoint is hit. When this happens, execution of your
code is paused and you can use the debugger to step, evaluate expressions, inspect the current
callstack, etc.

### Debugging: Command-Line

You can also debug without using the HHVM Toolbar by debugging directly from the command-line.

1. Have a PHP or Hack file active in the [editing area](/docs/editor/basics/#editing-area).
2. `cmd-shift-Y` to bring up the process attachment UI.
3. Choose the remote server that has your project and HHVM installed from the attachment UI.
It should look similar to:

    ![](/static/images/docs/feature-debugger-languages-hack-php-attach.png)

4. Click `Attach`.
5. Set [breakpoints](/docs/features/debugger/#basics__breakpoints) in your code.
6. Run your PHP/Hack script or server
    1. If you are running a script: `hhvm -c xdebug.ini your-script.php`
    2. If you are running a server: `hhvm -c xdebug.ini -m server`
7. Start Debugging.
    1. If you are debugging a server, you will need to send a request to that server in order for
    the server breakpoint to be hit.

### Output Window

When you launch the debugger for Hack and PHP, an `Output` window will appear in a tab in a
separate pane. When debugging, HHVM will send its stdout to this window. This includes output from
`print()` (or similar) statements and stacktraces.

### Evaluation

Basic [evaluation](/docs/features/debugger/#basics__evaluation) in the REPL works out of the box.  
You can also load bindings from your project so that you can interact with them in the console. To
do this, make sure there is a `.hhconfig` file checked in at the root of your project, and also a
`scripts/xdebug_includes.php` file.  `xdebug_includes.php` must contain at least one call to the
`xdebug_break` function.  Here is an example of such a file:

```php
<?hh

// This file is named 'xdebug_includes.php' and lives inside a directory named 'scripts/'.

// Put code here that loads context into the environment.  For example, you can use PHP's require to
// import function and variable bindings, which will then be available via the REPL.

xdebug_break(); // Pauses the runtime's execution when xdebug mode is enabled.
```

Now when you debug your Hack or PHP project, the nuclide debugger will also make a separate
connection to the runtime and launch this script.  Any context loaded before calling
`xdebug_break()` will be accessible via the REPL.

### Filtering

After you attach to a remote server with HHVM, the debugger will then utilize the *first* instance
of HHVM that is run with the correct `.ini` configuration, etc. If you are running multiple
instances of HHVM with that configuration, you might start debugging on code on which you did not
intend.

Nuclide provides a mechanism to filter out the proper, intended script. For example, if you know
the script name that will be debugged, then use that as the filter.

Go to `Settings | Packages | Nuclide | Settings` and look for:

![](/static/images/docs/feature-debugger-languages-hack-php-filtering.png)

### Other Settings

There are other Hack and PHP debug settings that can be set as they pertain to HHVM. These include:

- Filtering debugging connections by user name (`idekey`). By default, this is set to the user that started the HHVM process (can override with `xdebug.idekey` in a `.ini` file).
- HHVM logging level. The default is `INFO`.
- Debugging Port. The default is `9000`. If you override this is in an `.ini` file, ensure that your setting matches this setting.

Go to `Settings | Packages | Nuclide | Settings` and look for the `nuclide-debugger-php` settings.
