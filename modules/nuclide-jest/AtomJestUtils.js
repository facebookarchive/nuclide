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

const fs = require('fs');
const path = require('path');

module.exports = {
  getPackage(start) {
    return JSON.parse(fs.readFileSync(
      module.exports.getPackageFile(start), 'utf8'
    ));
  },

  getPackageFile(start) {
    let current = path.resolve(start);
    while (true) {
      const filename = path.join(current, 'package.json');
      if (fs.existsSync(filename)) {
        return filename;
      } else {
        const next = path.join(current, '..');
        if (next === current) {
          return null;
        } else {
          current = next;
        }
      }
    }
  },
};
