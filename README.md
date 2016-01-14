# Nuclide

[Nuclide](http://nuclide.io/) is a collection of packages for [Atom](https://atom.io/)
to provide IDE-like functionality for a variety of programming languages and
technologies.

## Installing Nuclide v0.111.0

Nuclide v0.111.0 is a single Atom package. To install it, you can either search for the
['nuclide' Atom package](https://atom.io/packages/nuclide) in *Atom > Packages > Install* or install
it from the command line with `apm`. While this release focuses on moving to a single package, it
does include fixes and improvements that you can find in the
[CHANGELOG.md](https://github.com/facebook/nuclide/blob/v0.111.0/CHANGELOG.md).

```bash
$ apm install nuclide
```

#### Installing Nuclide Server v0.111.0

Nuclide's server has moved into the ['nuclide' NPM package](https://www.npmjs.com/package/nuclide).
The server is required only if you intend to edit remote files from within Atom+Nuclide, and it
should be installed on the host where the remote files live. We recommend installing the server as
a global module using NPM's `-g` flag so its binaries are available in '/usr/local/bin'.

```bash
$ npm install -g nuclide
```
