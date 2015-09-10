'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Collection} from '../types/ast';
import type {SourceOptions} from '../options/SourceOptions';

var jscs = require('jscodeshift');

var getFirstNodePath = require('../utils/getFirstNodePath');
var getUndeclaredTypes = require('../utils/getUndeclaredTypes');

var {statement} = jscs.template;

function addMissingTypes(root: Collection, options: SourceOptions): void {
  var first = getFirstNodePath(root);
  if (!first) {
    return;
  }

  var {moduleMap} = options;
  var requireOptions = {
    path: options.sourcePath,
    typeImport: true,
  };

  getUndeclaredTypes(root, options).forEach(name => {
    var node = moduleMap.getRequire(name, requireOptions);
    first.insertAfter(node);
  });
}

module.exports = addMissingTypes;
