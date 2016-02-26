This package provides a service for setting and observing the "current"
directory. This is important because Atom allows multiple folders per project
but many operations (e.g. building a project) expect to operate on a single
folder. Rather than giving each of these operations UI for choosing the target
folder, we introduce the concept of an "active" project directory. Other
packages can then assume this folder as a target.

Notes:

- Currently, we only allow project roots to be used as current working
  directories. This is valuable for simple mental model but may change if we
  require.
- Packages need not assume that the current folder itself represents a project,
  but instead should use it as a base for recursing up the file tree, searching
  for "marker files" like package.json, .buckconfig, etc.
