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
var getUndeclaredTypes = require('../utils/getUndeclaredTypes');
var {findModuleMap} = require('../options');

var {statement} = jscs.template;

function addMissingTypes(root: Collection, sourcePath: AbsolutePath): void {
  var first = getFirstNodePath(root);
  if (!first) {
    return;
  }

  var moduleMap = findModuleMap(sourcePath);
  var requireOptions = {
    path: sourcePath,
    typeImport: true,
  };

  getUndeclaredTypes(root, sourcePath).forEach(name => {
    var node = moduleMap.getRequire(name, requireOptions);
    first.insertAfter(node);
  });
}

module.exports = addMissingTypes;
