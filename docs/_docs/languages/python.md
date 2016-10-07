---
pageid: language-python
title: Python
layout: docs
permalink: /docs/languages/python/
---

Nuclide has well-rounded support for Python 2 and 3.

* TOC
{:toc}

## Using Python Features with Buck Projects

If your code uses Buck to manage Python dependencies, you will need to build
your project's `python_binary` target in order for autocomplete and
jump to definition to find results from dependencies.

## Features

Python's integration into Nuclide provides you with productivity features such as:

- [Autocomplete](#features__autocomplete)
- [Jump To Definition](#features__jump-to-definition)
- [Code Formatting](#features__code-formatting)
- [Code Diagnostics](#features__code-diagnostics)
- [Outline View](#features__outline-view)

### Autocomplete

Nuclide integrates [Jedi](http://jedi.jedidjah.ch/) to provide fast,
detailed, and context-aware autocompletion.

![](/static/images/docs/language-python-autocomplete.png)

By default, Nuclide will provide tab-able snippets for function and method
arguments. To turn this behavior on or off:

1. Open the [Nuclide Settings](/docs/editor/basics/#preferences-pane) tab either by pressing `Cmd+,` (`Ctrl-,` on Linux) or by going to `Package | Settings View | Open`.
2. Select **Packages** from the list at the left, and search for `nuclide`.
3. Click on the **Settings** button for the `nuclide` package.
4. Scroll down until you find `nuclide-python`, and select or deselect the **Autocomplete arguments** checkbox.

### Jump to Definition

Nuclide allows you to directly jump to definition for local or imported symbols
alike.

For example, to go to the definition of `get_all_patches()`, you can
hover over `get_all_patches()`and either press `Cmd-<mouse click>`
(`Ctrl-<mouse click>` on Linux) or `Cmd-Option-Enter` (`Ctrl-Alt-Enter` on Linux).

![](/static/images/docs/language-python-jump-to-definition-link.png)

![](/static/images/docs/language-python-jump-to-definition-result.png)

Jump to definition also works for [Buck](http://buckbuild.com) config files.
Since `BUCK` files are written in Python, you can use `Cmd-<mouse-click>`
(`Ctrl-<mouse-click` on Linux) to jump to the various `BUCK` build targets
provided in the given `BUCK` file (e.g., `deps`).

### Code Formatting

With Nuclide, you can easily format your code or configure Nuclide to format on
save as long as you have [yapf](https://github.com/google/yapf) on your machine.

To format your code, press `Cmd-Shift-C` (`Ctrl-Shift-C` on Linux), or choose
the **Format Code** option from the context-aware menu. This will either format only code
within selected text or the whole file if no text is selected.

![](/static/images/docs/language-python-code-format-before.png)

![](/static/images/docs/language-python-code-format-after.png)

In order for the code formatting feature to work, make sure that:

- The code you want to format does not have any outstanding syntax errors.
- `yapf` is executing from the same Python version as the code being formatted. For
example, formatting a Python 3 file while `yapf` is running on Python 2 will likely
not work.

### Code Diagnostics

Nuclide provides built-in diagnostics for Python, currently displaying lint messages
from [flake8](http://flake8.pycqa.org/en/latest/).

![](/static/images/docs/language-python-code-diagnostics.png)

To see lint messages, make sure you have [flake8](http://flake8.pycqa.org/en/latest/)
installed on the machine that your project resides on. You can configure a custom
`flake8` path if needed.

1. Open the [Nuclide Settings](/docs/editor/basics/#preferences-pane) tab either by pressing `Cmd+,` (`Ctrl-,` on Linux) or by going to `Package | Settings View | Open`.
2. Select **Packages** from the list at the left, and search for `nuclide`.
3. Click on the **Settings** button for the `nuclide` package.
4. Scroll down until you find `nuclide-python`, and enter the custom `flake8` path in the **Path to Flake8 Executable** text box.

### Outline View

Nuclide provides an [Outline View](/docs/features/outline-view) to quickly see
and navigate the structure of your Python code.

![](/static/images/docs/language-python-outline-view.png)
