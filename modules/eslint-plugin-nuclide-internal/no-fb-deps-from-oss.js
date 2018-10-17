/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @noflow
 * @format
 */
'use strict';

/* eslint nuclide-internal/no-commonjs: 0 */

const path = require('path');
const checkedPackages = new Set();
const {getPackage} = require('./utils');
const fs = require('fs');

function createFobidList(dir) {
  const forbid = [];
  fs.readdirSync(path.join(__dirname, dir)).forEach(p => {
    if (p.startsWith('fb-')) {
      forbid.push(p);
    }
  });

  return forbid;
}

module.exports = function(context) {
  // Forbid fb-* packages in modules and nuclide/pkg.
  const forbidList = new Set(
    createFobidList('../').concat(createFobidList('../../pkg')),
  );
  return {
    Program(node) {
      const file = context.getFilename();
      const dir = path.dirname(file);
      if (checkedPackages.has(dir)) {
        return;
      }
      checkedPackages.add(dir);

      const {configPath, json} = getPackage(dir, true);
      if (json == null || json.dependencies == null) {
        return;
      }

      const containingDir = path
        .dirname(configPath)
        .split(path.sep)
        .pop();
      if (containingDir.startsWith('fb')) {
        return;
      }

      const deps = Object.keys(json.dependencies);
      for (const key of deps) {
        if (forbidList.has(key)) {
          context.report({
            node,
            message: `Can't require fb dependency from non-fb package. This package requires dependency ${key} in ${configPath}`,
          });
        }
      }
    },
  };
};
