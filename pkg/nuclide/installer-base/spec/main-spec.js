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
      'nuclide-xyz': '7.8.9',
    };
    var config = {
      packages: [
        {
          // Already installed, but requested version does not match.
          name: 'nuclide-abc',
          version: '4.5.6',
        },
        {
          // Not installed with version specified: should use specified version.
          name: 'nuclide-ghi',
          version: '4.5.6',
        },
        {
          // Already installed with requested version: nothing to install.
          name: 'nuclide-xyz',
          version: '7.8.9',
        },
      ],
    };
    expect(findPackagesToInstall(config, installedPackages)).toEqual([
      'nuclide-abc@4.5.6',
      'nuclide-ghi@4.5.6',
    ]);
  });
});
