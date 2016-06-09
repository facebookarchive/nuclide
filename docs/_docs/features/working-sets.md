---
pageid: feature-working-sets
title: Working Sets
layout: docs
permalink: /docs/features/working-sets/
---

It can be common to have a
[large project](/docs/editor/basics/#project-and-file-explorer__adding-projects) with a root folder
that has a bunch of children folders and files underneath it. However, the work that relates to you
in that project may only exist in one or a few of the files within the project. The rest of the
files are just noise in the [file tree](/docs/editor/basics/#project-and-file-explorer).

`Working Sets` allows you to select a subset of folders or files in your project file tree that you
are interested in, hiding all of the other folders and files.

* TOC
{:toc}

## Defining Working Sets

To define a working set, go to the upper right corner of the
[project and file tree explorer](/docs/editor/basics/#project-and-file-explorer). As
you move your mouse there, you will see a `+` button appear.

![](/static/images/docs/feature-working-set-begin.png)

Clicking on the `+` toggles the file tree to allow for folder and file section that will be added
to the working set you are currently creating.

After selecting the folders and files that you want in the working set, enter a name for that set
in the box next to the checkmark.

![](/static/images/docs/feature-working-set-add.png)

> Click on the `-` to cancel the creation of the working set.

Once you create the working set you will see the file tree reduced to only those files and folders
that you selected.

![](/static/images/docs/feature-working-set-created.png)

You can create as many working sets as you would like. Just click on the `+` again. Every time you
create a new working set, you will see the entirety of the project tree again for choosing files
and folders.

> Files and folders can overlap in working sets. This might be useful when
> [toggling working sets](#toggling-working-sets).

## Toggling Working Sets

By default, all working sets are active as you create them. This means all of the files and folders
for every working set is shown combined in the file tree.

Here is an example of three working sets shown.

![](/static/images/docs/feature-working-set-all-working-sets.png)

However, you can toggle which working sets are active.

![](/static/images/docs/feature-working-set-select-active.png)

> You can also press `ctrl-S` or go to `Packages | Working Sets | Select Active` to choose your
> active working sets.

To deactivate a working set, click on the name of the working set. You will see the check mark
disappear, and the folders and files of that working set will be removed from the file tree.

![](/static/images/docs/feature-working-set-deactivate.png)

> Pressing `ctrl-shift-S` or going to `Packages | Working Sets | Toggle Last Selected` will allow
> you to toggle between the full project tree and the currently active working set(s).

## Editing Working Sets

You can also edit and delete working sets.

![](/static/images/docs/feature-working-set-edit.png)

By clicking on the trash can, the working set is deleted and, if active, the files and folders of
that working set will be removed from the file tree.

> If a folder or file is part of another active working set, then it will remain in the file tree.

By clicking on the pencil, you can add or remove folders and files from that working set. You can
also rename the working set as well.

## Opening Non-Working Set Files

You can open files that do not belong to a working set. If, for example, you use
[`Quick Open`](/docs/features/quick-open) to open a file that is not part of a working set, then that file and its parent folders
will be shown in the file tree *grayed out*

![](/static/images/docs/feature-working-set-not-working-set-file.png)

> If you close the non-working set file, it will be removed from the file tree.
