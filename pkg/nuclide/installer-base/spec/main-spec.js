'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {
  findPackagesToInstall,
} = require('../lib/main').__test__;

describe('findPackagesToInstall', () => {
  it('installs only packages that are not installed with the requested version', () => {
    var installedPackages = {
      'nuclide-abc': '1.2.3',
      'nuclide-def': '4.5.6',
      'nuclide-ghi': '7.8.9',
    };
    var config = {
      packages: [
        {
          // Already installed, but requested version is older: nothing to install.
          name: 'nuclide-abc',
          version: '1.1.0',
        },
        {
          // Already installed with requested version: nothing to install.
          name: 'nuclide-def',
          version: '4.5.6',
        },
        {
          // Already installed, but requested version is newer: should install with newer version.
          name: 'nuclide-ghi',
          version: '7.8.10',
        },
        {
          // Package not installed already: should be installed with specified version.
          name: 'nuclide-xyz',
          version: '1.0.0',
        },
      ],
    };
    expect(findPackagesToInstall(config, installedPackages)).toEqual([
      'nuclide-ghi@7.8.10',
      'nuclide-xyz@1.0.0',
    ]);
  });
});
