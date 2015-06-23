# File tree

This package adds a sidebar for navigating and operating on the filesystem.

## Features

We override the built-in file tree (i.e. the `tree-view` package) to add
several features.

The most notable feature is remote filesystem support. We allow you to connect
to a remote filesystem via SSH using the `nuclide-remote-projects` package.
This asynchronously loads and updates from the remote filesystem, even if the
operations are not directly performed from the file tree UI.

The file tree also displays version control statuses for Git and Mercurial
repositories. Git support for local filesystems is baked into Atom, but we add
special logic to get Mercurial working for local and remote filesystems.

## Re-enable `tree-view`

In order to use the built-in Atom `tree-view`, disable the `nuclide-file-tree`
package in `Settings > Packages`.
