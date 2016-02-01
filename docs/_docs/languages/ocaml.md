---
id: ocaml
title: OCaml
layout: docs
permalink: /docs/languages/ocaml/
---

This **experimental** feature provides rudimentary support for OCaml via
[`ocamlmerlin`](https://github.com/the-lambda-church/merlin). Merlin can be installed from source
or by installing the `merlin` OPAM package.

OCaml's integration into Nuclide provides you with productivity features such as:

* Autocomplete
* Jump to Definition

It requires that `ocamlmerlin` be installed on your system and properly configured for your
project. `ocamlmerlin` should be on your `PATH`. If it is not, you may specify the path to
`ocamlmerlin` in the settings for the 'nuclide' package.
