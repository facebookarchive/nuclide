Troubleshooting Installation
============================

## Incompatible native module error

If you switch Atom versions, or if you `npm install nuclide` instead of `apm install nuclide`, you may find yourself with an "incompatible native module" error:

!["incompatible native module" error](images/incompatible-native-module-error.png)

#### (easy) Fixing via the "Incompatible Packages" tool

From the Command Palette, search for "Incompatible Packages: view", or
click the "bug" icon in the status bar. Then select "Rebuild Packages", and restart Atom.

![incompatible packages view](images/incompatible-packages-view.png)

#### (hard) Fixing via the CLI

From the Atom Developer Tools, give the incompatible modules storage a kick:

```js
localStorage.removeItem(
  atom.packages.getLoadedPackage('nuclide')
    .getIncompatibleNativeModulesStorageKey()
)
```

Then, from your terminal:

```sh
$ apm rebuild nuclide
```
