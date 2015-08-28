'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AbsolutePath} from '../types/common';
import type {Collection} from '../types/ast';

var jscs = require('jscodeshift');

var getFirstNodePath = require('../utils/getFirstNodePath');
var getUndeclaredIdentifiers = require('../utils/getUndeclaredIdentifiers');
var getUndeclaredJSXIdentifiers = require('../utils/getUndeclaredJSXIdentifiers');
var {findModuleMap} = require('../options');

function addMissingRequires(root: Collection, sourcePath: AbsolutePath): void {
  var first = getFirstNodePath(root);
  if (!first) {
    return;
  }

  var moduleMap = findModuleMap(sourcePath);

  // Add the missing requires.
  getUndeclaredIdentifiers(root, sourcePath).forEach(name => {
    var node = moduleMap.getRequire(name, {path: sourcePath});
    first.insertAfter(node);
  });

  // Add missing JSX requires.
  getUndeclaredJSXIdentifiers(root, sourcePath).forEach(name => {
    var node = moduleMap.getRequire(name, {
      path: sourcePath,
      jsxIdentifier: true,
    });
    first.insertAfter(node);
  });
}

module.exports = addMissingRequires;
