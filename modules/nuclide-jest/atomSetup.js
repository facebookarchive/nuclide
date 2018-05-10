/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @noflow
 */
'use strict';

/* eslint
  comma-dangle: [1, always-multiline],
  prefer-object-spread/prefer-object-spread: 0,
  nuclide-internal/no-commonjs: 0,
  */

const temp = require('temp');
const {getPackage} = require('./AtomJestUtils');
const pkg = getPackage(atom.getLoadSettings().testPaths[0]);
const nuclideConfig = pkg.atomConfig || (pkg.nuclide && pkg.nuclide.config);

beforeEach(() => {
  // Since the FeatureLoader creates the config for all feature packages,
  // and it doesn't load for unit tests, it's necessary to manually
  // construct any default config that they define.
  Object.keys(nuclideConfig).forEach(key => {
    global.atom.config.setSchema(
      `${pkg.name}.${key}`,
      nuclideConfig[key]
    );
  });

  atom.confirm = jest.fn();
});

afterEach(() => {
   // Atom intercepts "process.exit" so we have to do our own manual cleanup.
   return new Promise((resolve, reject) => {
     temp.cleanup((err, stats) => {
       resolve();
       if (err && err.message !== 'not tracking') {
         // eslint-disable-next-line no-console
         console.log('temp.cleanup() failed.', err);
       }
     });
   });
});
