# nuclide-buck

Buck integration for Nuclide. Features include:

* Syntax highlighting for `BUCK` files.
* "click-to-symbol" support (if [hyperclick](https://atom.io/packages/hyperclick) is installed) for:
  * build targets in `BUCK` files
  * build targets in `BUCK.autodeps` files
  * file paths in `BUCK` files
* Syntax highlighting for `.buckconfig` files (if a package that recognizes the `source.ini`
grammar is available).
* A Buck build system for the nuclide-task-runner toolbar.
