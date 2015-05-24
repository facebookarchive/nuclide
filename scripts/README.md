# Scripts folder

This directory contains scripts that are designed to be run by end users.

The code to support these scripts should be in `lib/` or some other subdirectory
to help keep this directory clean.

All scripts should be able to be run as-is, which means they should not depend
on any sort of pre-execution step, such as running `npm install`. As such, to
simplify the bootstrapping process, many of these scripts are written in Python
rather than Node. We target Python 2.6 to maximize backwards compatibility.

## `setup`

The primary script that you need to run is `./scripts/dev/setup`. As explained in
[the primary `README.md`](../README.md), this is used to install Nuclide.
It also configures the repository for iterative development of Nuclide itself.

## `test`

Run `test` to run the full suite of tests across all Nuclide packages.

## `packages`

Run `packages` to get a list of the Nuclide packages (includes options for filtering).
