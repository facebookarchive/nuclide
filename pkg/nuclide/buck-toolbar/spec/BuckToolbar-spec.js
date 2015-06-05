'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {dotAppDirectoryForAppleBundleOutput} = require('../lib/helpers');

describe('BuckToolbar', () => {
  it('.dotAppDirectoryForAppleBundleOutput()', () => {
    var zipPath = 'buck-out/gen/Apps/Example/ExampleApp.zip';
    expect(dotAppDirectoryForAppleBundleOutput(zipPath)).toBe(
      'buck-out/gen/Apps/Example/ExampleApp/ExampleApp.app');
  });
});
