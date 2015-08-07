# Nuclide Changelog

## 0.0.30

* **Bug Fix**
  * [#163](https://github.com/facebook/nuclide/issues/163)

## 0.0.29

* **Bug Fix**
  * Fixed the transpilation issue identified in [#162](https://github.com/facebook/nuclide/issues/162).

## 0.0.28

* **New Feature**
  * Babel files in Node and Atom packages are now pre-transpiled prior to publishing. This should
reduce initial startup time for `nuclide-server` as well as for Atom, post-Nuclide install.
Both `nuclide-server` and Atom have schemes to cache their transpilations, but

## 0.0.27

*Scrubbed this release because it would have missed [55efd78b](
https://github.com/facebook/nuclide/commit/55efd78b3eb949129fe582657b5988ce0aa70159).*

## 0.0.26

* **Bug Fix**
  * [#157](https://github.com/facebook/nuclide/issues/157)

## 0.0.25

* **New Feature**
  * Was long overdue for a release. There were 222 commits since `0.0.24`.
  * New Atom package: `nuclide-arcanist`.
  * New Atom package: `nuclide-diagnostics-store`.
  * New Atom package: `nuclide-diagnostics-ui`.
  * New Atom package: `nuclide-find-references`.
  * New Atom package: `nuclide-ocaml`.

## 0.0.24

* **Bug Fix**
  * Back out Facebook-specific code.

## 0.0.23

* **New Feature**
  * Was overdue for a release. There were 76 commits since `0.0.22`.

## 0.0.22

* **Polish**
 * Various small fixes in preparation for [CodeConf 2015](http://codeconf.com/) demo.

## 0.0.21

* **New Feature**
  * Target `linter-plus` rather than `linter` Atom package: [1fc2358e](
https://github.com/facebook/nuclide/commit/1fc2358e646d779c9fe9cb39b22b7c21ad61fa6c).

## 0.0.20

*Initial public release of Nuclide.*
