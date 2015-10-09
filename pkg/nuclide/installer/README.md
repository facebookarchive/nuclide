# Nuclide

This is the only Atom package you need to install to get Nuclide.

Because Nuclide is a collection of packages, this package
is used to ensure that you have the entire suite of Nuclide packages
for your current version of Atom.

## FAQ

**Why must I install the full suite of Nuclide packages instead of just the ones I care about?**

In the future, we may provide options to install subsets of
Atom packages tailored to a specific feature, such as remote editing,
Flow, Hack, or Mercurial. Currently, some Atom packages
have interdependencies that make this tricky.

For example, both `nuclide-hg-repository` and `nuclide-remote-projects`
need `nuclide-file-tree-deux` to provide their full set of features.
Because only one version of an Atom package can be installed at a time,
it is critical that all three packages are compatible if they are
installed together. Installing the full suite of Nuclide packages ensures this
is the case.

In the meantime, Nuclide is committed to reducing the impact of packages
that you do not use so they do not add any drag to your Atom usage.
