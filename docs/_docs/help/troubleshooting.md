---
pageid: help-troubleshooting
title: Troubleshooting
layout: docs
permalink: /docs/help/troubleshooting/
---

If you are having problems with Nuclide itself, check out some of these troubleshooting tips. More
are being added as we come across common issues found by users. If you have an issue that is not
listed here, please [file a GitHub issue](https://github.com/facebook/nuclide/issues), and
depending on how widespread the problem may be, we will add it here as well.

* TOC
{:toc}

## Nuclide Server

### Installation

If you are having issues installing the [Nuclide Server](/docs/features/remote#nuclide-server),
check out the following tips:

*Node Version*

A version of [Node](https://nodejs.org/) that is equal to or greater than that specified in ["node" (under "engines") in the package information](https://github.com/facebook/nuclide/blob/master/package.json) is required. Use the command-line to verify your Node version by running:

```bash
node --version
```

*Permissions*

If you get `EACCESS` errors when you run the `npm install` command, you likely do not have your NPM properly
configured for installing global packages without root permissions. To fix this problem, install in
a directory your user owns like this:

```bash
npm config set prefix '~/.npm_packages'
```

and add

```bash
PATH=$PATH:$HOME/.npm_packages/bin; export PATH
```

to the end of your `.profile`.  Now you should be able to run:

```bash
npm install -g nuclide
```

without errors.

If you previously ran `npm install` as root, you may need to correct the permissions on your `.npm`
directory by running:

```bash
sudo chown -R userid:userid .npm
```

where `userid` is your userid.  If you still get errors you may need to clear your NPM cache with:

```bash
npm clear cache
```

### Files Not Syncing

Sometimes you'll have a setup that used to work, but starts to fail. Here some things you can try to make it work again:

* If you have a version mismatch between your client and remote server Nuclide installations, you'll want to run `npm update -g nuclide` on the server and make sure you have the same version on the client as well.
* Other tools that watch files may cause problems as well. Try stopping that process and stopping the file watcher as well via `watchman shutdown-server`. Then try to reconnect to the server again from Atom.
* Use `killall node` on the server side, then try reconnecting.

## Environment Issues

### Uninstalling Older Versions of Nuclide

[Nuclide v0.0.35](https://github.com/facebook/nuclide/releases/tag/v0.0.35) and earlier were released
as many separate Atom packages. If you have any packages starting with `nuclide-`, you likely have
some part of <=v0.0.35 still installed.

Run the uninstall command below, which contains the full list of Nuclide's packages when they were
last released on 25 November 2015. This is safe to run even if you only have a subset of the
packages installed; `apm` will ignore any packages that are not present.

```bash
$ apm uninstall \
hyperclick \
nuclide-arcanist \
nuclide-blame \
nuclide-blame-provider-hg \
nuclide-blame-ui \
nuclide-buck-files \
nuclide-busy-signal \
nuclide-clang-atom \
nuclide-clipboard-path \
nuclide-code-format \
nuclide-code-highlight \
nuclide-debugger-atom \
nuclide-debugger-hhvm \
nuclide-debugger-lldb \
nuclide-diagnostics-store \
nuclide-diagnostics-ui \
nuclide-diff-view \
nuclide-file-tree \
nuclide-file-watcher \
nuclide-find-references \
nuclide-flow \
nuclide-format-js \
nuclide-fuzzy-filename-provider \
nuclide-hack \
nuclide-hack-symbol-provider \
nuclide-health \
nuclide-hg-repository \
nuclide-home \
nuclide-installer \
nuclide-language-hack \
nuclide-move-pane \
nuclide-objc \
nuclide-ocaml \
nuclide-open-filenames-provider \
nuclide-quick-open \
nuclide-react-native-inspector \
nuclide-recent-files-provider \
nuclide-recent-files-service \
nuclide-remote-projects \
nuclide-test-runner \
nuclide-toolbar \
nuclide-type-hint \
nuclide-url-hyperclick
```

## Flow Issues

### Features Not Working

If the Flow features are not working in Nuclide:

- Make sure `flow` is in your [`$PATH`](#flow-issues__flow-and-path) environment variable.
- Ensure that you have `/* @flow */` at the top of your `.js` file.
- Ensure you have an empty `.flowconfig` file in the root of of your project directory.

### `flow` and `$PATH`

If you installed `flow` in a place not in your `$PATH` environment variable (e.g., unzipped it in your home directory), then you either have to update your `$PATH` environment variable or explicitly specify it.

1. Open the Nuclide Settings tab either by pressing `Cmd+,` (`Ctrl-,` on Linux) or by going to `Package | Settings View | Open`.
2. Select **Packages** from the list at the left, and search for `nuclide`.
3. Click on the **Settings** button for the `nuclide` package.
4. Scroll down until you find `nuclide-flow`.
5. Set the location of your `flow` installation in the **Path to Flow Executable** text box.

<img src="/static/images/help/troubleshooting-flow-executable-setting.png" align="middle" style="width:800px"/>

### Module Not Found

If you are [running Nuclide from source](/docs/advanced-topics/building-from-source/), you may
occasionally run into a `Cannot find module` error.

![](/static/images/help/troubleshooting-module-not-found.png)

As Nuclide is continuously updated, new modules may be added as dependencies. When you rebase to
the latest code and run Nuclide, the new module will not have been installed, so it will not be
found.

Running `npm update` will get you the latest modules so that you should be able to open Nuclide
successfully again.
