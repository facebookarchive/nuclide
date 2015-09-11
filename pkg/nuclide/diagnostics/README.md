# nuclide-diagnostics

The `nuclide-diagnostics-*` suite of packages displays diagnostic messages about your code from
arbitrary providers. These can be lint warnings, compiler errors, etc.

Any package that works with the [`linter`](https://atom.io/packages/linter) package should also work
with `nuclide-diagnostics`.

We discourage the use of both `nuclide-diagnostics` and `linter` together, since you will see
duplicate UI for reporting diagnostics. To that end, if you wish to use `nuclide-diagnostics`, we
recommend disabling the `linter` package. If you wish to continue using the `linter`, we recommend
disabling all `nuclide-diagnostics-*` packages. Please note that doing so will disable some Nuclide
features such as Flow and Hack error reporting.

For information about the APIs provided, please see
[`nuclide-diagnostics-store`](https://github.com/facebook/nuclide/tree/master/pkg/nuclide/diagnostics/store).
