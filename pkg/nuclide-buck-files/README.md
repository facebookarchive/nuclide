# nuclide-buck-files

Nuclide feature that adds special handling for `BUCK` files. Features include:

* Syntax highlighting for `BUCK` files.
* "click-to-symbol" support for build targets in `BUCK` files
(if [hyperclick](https://atom.io/packages/hyperclick) is installed).
* Syntax highlighting for `.buckconfig` files (if a package that recognizes the `source.ini`
grammar is available).
