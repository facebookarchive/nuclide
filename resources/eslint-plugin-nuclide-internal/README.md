## `eslint-plugin-nuclide-internal`

### Developing

Changes to this code are not immediately reflected in the Nuclide lint results. `apm install` will
copy the files in this directory over, rather than symlink them. So, to develop you need to get a
symlink set up:

In the root `Nuclide` directory:

`$ npm link resources/eslint-plugin-nuclide-internal`

Now, hack away.

To undo this, run

```
$ npm unlink eslint-plugin-nuclide-internal
$ npm unlink -g eslint-plugin-nuclide-internal
```

You will also need to re-run the Nuclide setup script since this will remove
`eslint-plugin-nuclide-internal` from `node_modules` entirely.

### Releasing

As part of your commit which changes these lint rules, you should bump the version in the
`package.json` in this directory and in the `npm-shrinkwrap.json` file in the root `Nuclide`.
That way, `apm install` in Nuclide will re-install these files. If you don't bump the version,
other developers will be running the previous version until they remove and re-install their
`node_modules` directory.

### Pro-tips

* To run a single rule in isolation:

```sh
./node_modules/.bin/eslint \
  --no-eslintrc \
  --parser=babel-eslint \
  --rulesdir=resources/eslint-plugin-nuclide-internal \
  --rule='consistent-import-name: 1' \
  -- file.js
```

* Direct symlinking:

```sh
rm -rf node_modules/eslint-plugin-nuclide-internal
ln -s ../resources/eslint-plugin-nuclide-internal node_modules
```
