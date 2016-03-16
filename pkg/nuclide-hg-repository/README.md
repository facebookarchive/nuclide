# nuclide-hg-repository

A Mercurial version of Atom's [`GitRepository`](https://atom.io/docs/api/v0.209.0/GitRepository).

## Features
By default, Atom provides UI to expose information about files that are contained
in a Git repository. This feature adds analogous support for files in Mercurial
repositories.

Specifically, `nuclide-hg-repository` enables the following features when you are
working in a Mercurial-backed project in Atom:
* The Nuclide file tree (`nuclide-file-tree` Nuclide feature) will highlight files that are
modified, as well as the directories that contain them.
* The Atom [`git-diff`](https://github.com/atom/git-diff) package will highlight
the gutter next to lines that have been modified.
* The Atom [`status-bar`](https://github.com/atom/status-bar) will show the
number of added/removed lines of the currently active file, and the
current Mercurial bookmark (note: not Mercurial branch).

![Screenshot of features enabled by this feature](/static/images/Mercurial_features_screenshot.png)

`nuclide-hg-repository` works on local and remote repositories.

## System Requirements
For full functionality [1], you need the following installed on the machine where
your Mercurial repository exists:
* Mercurial. We recommend version 3.4 and above. `hg` must be on your $PATH.
* [Watchman](https://facebook.github.io/watchman/) version 3.2 or above. It must
be in `/usr/local/bin/` or in your $PATH. Note that Watchman is not currently
available on Windows (June 2015).

[1] Without Watchman, `nuclide-hg-repository` will not keep the Nuclide file tree
correctly highlighted.

## How It Works
This feature provides a `atom.repository-provider` service through the Atom
[`service-hub`](https://github.com/atom/service-hub). The service returns an
instance of `HgRepositoryClient`, which is the analogous Mercurial implementation
of Atom's [`GitRepository`](https://atom.io/docs/api/v0.209.0/GitRepository).

## API
This and the following sections explain how to use this feature from the
perspective of a developer who wants to leverage the functionality of
`HgRepositoryClient` in another Atom package.

For each of the features listed in the "Features" section, the packages using the
features of `HgRepositoryClient` don't have Git- and Mercurial-specific logic.
Instead, those packages get a reference to the current repository via:

```js
atom.project.repositoryForDirectory(directory) // recommended
```
or

```js
atom.project.getRepositories()
```

`HgRepositoryClient` provides all of the same methods as Atom's [`GitRepository`](https://atom.io/docs/api/v0.209.0/GitRepository)
as well as some additional ones. In many cases, you should be able to use the
returned "repository" object without having to know whether it is Git or Hg.

There are some exceptions, however; see the "Caveats" and "Additional Features"
sections. If you find you have to do a Git/Hg check, you can distinguish them
using the `getType` method available on both `HgRepositoryClient` and
`GitRepository`.

## API Caveats
1. As of June 2015, `HgRepositoryClient` has a number of methods for parity with
GitRepository that are unimplemented stubs. Please see the code for more details.

2. Perhaps the most notable difference between `HgRepositoryClient` and `GitRepository`
is that `HgRepositoryClient` does not publicly expose any methods that fetch
information from Mercurial synchronously. The synchronous method calls on
`HgRepositoryClient`, such as `getDirectoryStatus`, read from a cache, and thus
may provide stale data. We have, however, added public asynchronous methods that
provide up-to-date data:
  * `getStatuses` is the async version of `getPathStatus`.
  * `getDiffStatsForPath` is the async version of `getDiffStats`.
  * `getLineDiffsForPath` is the async version of `getLineDiffs`.

3. `HgRepositoryClient` updates line diff information on each editor "save" event,
so the line highlighting provided by the `git-diff` package and the number of
added/removed lines displayed in the status bar may be stale in between saves.

## Additional Methods
In addition to implementing the methods available on `GitRepository`,
`HgRepositoryClient` has a few additional methods. See the section labeled
"Repository State at Specific Revisions" in [`HgRepositoryClient`](https://github.com/facebook/nuclide/blob/master/pkg/nuclide-hg-repository/lib/HgRepositoryClient.js).
