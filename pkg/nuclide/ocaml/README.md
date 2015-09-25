# nuclide-ocaml

This experimental package provides rudimentary support for OCaml via [`ocamlmerlin`](https://github.com/the-lambda-church/merlin). Merlin can be installed from source or by installing the `merlin` OPAM package.

It requires that `ocamlmerlin` be installed on your system and properly configured for your project. `ocamlmerlin` should be on your `PATH`. If it is not, you may specify the path to `ocamlmerlin` in the settings for this package.

## Features

* Autocomplete: You should see autocomplete results with types appear as you type.
* Jump to definition: If you install the [`hyperclick`](https://atom.io/packages/hyperclick) package, you will be able to `cmd` or `alt` click on a symbol to jump to the location where it is defined.
