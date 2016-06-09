---
pageid: quick-start-getting-started
title: Getting Started
layout: docs
permalink: /docs/quick-start/getting-started/
---

This getting started guide walks you through the core features of Nuclide and aims to get you moving
and productive quickly.

* TOC
{:toc}

## Installation

The [installation guides](/docs/editor/setup/) will provide you detailed information to install
Nuclide on your platform, but assuming you have met your platform dependent prerequisites
([Mac](/docs/editor/setup/#mac__prerequisites) | [Linux](/docs/editor/setup/#linux__prerequisites)),
you can install Nuclide with one command:

```bash
apm install nuclide
```

> Nuclide is [not currently supported on Windows](/docs/editor/setup/#windows).

While technically optional, in order for features such as [`Quick Open`](#quick-open) to work
correctly, you will also need to install [`Watchman`](https://facebook.github.io/watchman/) and
ensure it is on your `$PATH`. There are other
[recommended installations](/docs/editor/setup/#post-installation) as well.

## Launch

After installation, you launch Nuclide by [opening Atom](/docs/editor/basics/#opening). Once Atom
is open, you should see the Nuclide home page.

![](/static/images/docs/quick-start-getting-started-home-page.png)

The left-hand side pane is the Nuclide file-tree view. The main pane contains introductory
information about Nuclide and the Quick Launch Menu. This main pane is also where you will be
editing your files (just like in normal Atom). And there is a bottom status bar to show you error
and health statistics.

## Adding a Project

After launching Nuclide, the next common step is to open a project that you would like to work on.
This could be a Hack, Flow or any other project that has a root directory.

To add a project, you can click on the `Add Project Folder` button in the left-hand side pane, use
the keyboard shortcut `Cmd-Shift-O` (`ctrl-shift-O` on Linux), or choose
`File | Add Project Folder` from the Atom menu.

![](/static/images/docs/quick-start-getting-started-add-project.png)

After adding a project you will see the root of your project at the top of the file tree and all
files and folders as a tree hierarchy underneath it.

![](/static/images/docs/quick-start-getting-started-file-tree-view.png)

## Quick Launch Menu

On the Nuclide home page you will find the *Quick Launch Menu* that gives quick access to many of
the popular features of Nuclide. Click on the `Try It` button to use each feature.

![](/static/images/docs/quick-start-getting-started-quick-launch.png)

## Quick Open

Nuclide's [*Quick Open*](/docs/features/quick-open) feature gives you access to Nuclide's file
search mechanism, which includes *omnisearch* which can find anything in your opened project.
Click on `Try It`, or `Cmd-T` (`ctrl-T` on Linux) to access the feature.

![](/static/images/docs/quick-start-getting-started-quick-open.png)

You can also search directly by filename, content within open files and see which files have been
recently opened.

## Remote Connection

Nuclide provides the ability to do [remote development](/docs/features/remote/) out of the box. This
allows you to have Nuclide installed on a local machine, your project on a remote machine, and have
your editing experience be seamless between the two.

Nuclide provides a *server* that bridges your local client with the remote development machine. In
order for remote development to work correctly, you must meet the
[prerequisites](/docs/features/remote/#nuclide-server__prerequisites) on the remote machine before
installing the Nuclide server.

After the prerequisites are met, you then
[install the server](/docs/features/remote/#nuclide-server__setup) on the remote machine.

In order to connect to your remote project, click on the `Try It` button next to
*Remote Connection* in the *Quick Launch Menu*. You can also select `Packages | Connect`, use the
keyboard shortcut `ctrl-shift-cmd-C`, or click on the `Add Remote Project Folder`
in the left-hand pane (if you have other projects open, however, that button will not be there).

![](/static/images/docs/quick-start-getting-started-remote-connection-dialog.png)

Enter all the necessary credentials, including the username to log in to the remote server, the
server's address, the actual root directory of the remote project you want to open, and, assuming
you installed the Nuclide Server as instructed, the *remote server command* would be
`nuclide-start-server`.

Any changes you make in the local Nuclide editor will be communicated back to the remote server and
properly synchronized.

## Diff View

Nuclide has built-in support for [Mercurial-based repositories](/docs/features/hg). If your
project is using Mercurial, one of the features that may help your workflow is the
[*Diff View*](/docs/features/hg/#diff-view). This allows you to quickly see what has changed in the
files you have modified. It shows what has changed from the current committed revision which you
are tracking.

To access the diff view, click on the `Try It` button (or use the `alt-cmd-shift-D` shortcut or
`Packages | Diff View`) after making a change to one of the files in your Mercurial project.

![](/static/images/docs/quick-start-getting-started-diff-view.png)

Notice how the *Diff View* window tab appears. After clicking on a changed file in the right-hand
pane, the *Diff View* window will highlight what changed.
