# UI Component Tools Commons

## Overview

See [fb-ui-component-tools/README.md](../fb-ui-component-tools/README.md).
This package provides functionality for indexing metadata about React components
such as their required props and deprecation status.
It is intended that a Language Server Protocol provider such as
`nuclide-js-imports-server` utilizes the interface exposed in this package in an
effort to share the resources involved in file indexing operations and being an
LSP provider.

## Why does this package exist?

`fb-ui-component-tools` is an Atom package/Nuclide module and as such cannot
have its contents imported from a node module containing an LSP provider.
This package is thus a separate node package that will aim to be decoupled from
the details of `watchman` and running a server.

## Support & Filing Bugs

It's likely that bugs produced by this package are discovered by its
accompanying Nuclide package, `fb-ui-component-tools`.

- Task template: https://fburl.com/tasks/xc9m2db6
- Workplace Group: https://fb.facebook.com/groups/168429210503909/

## Features

…

## Architecture

…
