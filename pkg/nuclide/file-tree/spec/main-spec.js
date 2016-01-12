'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

describe('main', () => {
  // TODO: Loading packages is rightfully slow; it `require`s a lot of files. Possible to inject
  // the `activation` class or move it to its own package to mock `require` it?
  it("disables Atom's builtin tree-view package on activation", () => {
    waitsForPromise(async () => {
      expect(atom.packages.isPackageDisabled('tree-view')).toBe(false);
      await atom.packages.activatePackage('nuclide-file-tree');
      expect(atom.packages.isPackageDisabled('tree-view')).toBe(true);
    });
  });

  // Closing an Atom window calls `deactivate` on loaded packages.
  it("keeps Atom's builtin tree-view package disabled on deactivation", () => {
    waitsForPromise(async () => {
      expect(atom.packages.isPackageDisabled('tree-view')).toBe(false);
      await atom.packages.activatePackage('nuclide-file-tree');
      atom.packages.deactivatePackage('nuclide-file-tree');
      expect(atom.packages.isPackageDisabled('tree-view')).toBe(true);
    });
  });
});
