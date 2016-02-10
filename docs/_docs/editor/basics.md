---
id: editor-basics
title: Basics
layout: docs
permalink: /docs/editor/basics/
---

Nuclide is a code editor built on the backbone of [GitHub's Atom text editor](https://atom.io).
Like other code editors and IDEs, there is a familiar look and feel to Nuclide. On the left-hand
side is your project tree, which includes associated files and folders. On the right-hand side is
the main editor that contains the code and text for files in your project. And on the bottom is a
status bar providing quick-look information such as errors, the path of the current file relative
to your project root, the type of file that is open, and other context-aware data.

![](/static/images/docs/editor-basics-intro.png)

## Opening

Assuming you have it [installed](/docs/editor/setup/), Nuclide is opened by opening Atom via mouse
(Dock, Applications folder, etc.) or at the command-line in a terminal window by running:

```bash
$ atom
```

By default, when you open Nuclide, the Home page appears.

![](/static/images/docs/editor-basics-homepage.png)

The Nuclide Home page gives you quick access to common Nuclide tools and features, as well as
information regarding how to provide feedback.

## Project and File Explorer

The project and file explorer is on the left-hand side of Nuclide. This is where you can open
projects, navigate through your project to open files in the [editor](#editor),
create new files and folders, etc.

### Adding Projects

The first time you open Nuclide, there will be no projects or files open. Instead you will see two
options in the explorer. The first is to open a local project. The second is to open a project on a
[remote machine](/docs/remote/).

![](/static/images/docs/editor-basics-adding-projects.png)

When you choose a project to open, you are choosing the root directory of that project. Upon
opening, the file explorer turns into a file tree, with the top of tree as the root.

![](/static/images/docs/editor-basics-file-tree.png)

To remove a project from the explorer, `right-click` on the root, and choose
`Remove Project Folder`.

### Multiple Projects

You can have more than one project open at a time. To open a second project, `right-click` anywhere
in the explorer window and choose `Add Project Folder` or `Add Remote Project Folder`.

> You can have both local and remote projects open at the same time.

With multiple projects open, default searching for files and in files will span both projects.
However, features such as debugging and error checking will still occur per project.

> For the `Find | Find In Project` task, you can add project-level granularity by specifying the
> root of the desired project as a filter for the search.

### Changed Files

If your project is under source control, the explorer will highlight the files that have changed in
your project since your last commit.

![](/static/images/docs/editor-basics-explorer-changed-files.png)

### Context-Aware Menu

The explorer has a context-aware menu that is shown when you `right-click`. This menu provides
options such as adding new projects, searching within the project, opening the current file in
Diff View (assuming you are working in a Mercurial repository), etc.

![](/static/images/docs/editor-basics-explorer-context-aware.png)

## Editor

### File Navigation

### Panes

### Search

### Context-Aware Menu

## Status Bar

### Errors and Warnings

### File Encoding

### Language Selection

### Branch

## Command Palette
