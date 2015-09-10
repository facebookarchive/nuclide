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

var FirstNode = require('../utils/FirstNode');

var getUndeclaredTypes = require('../utils/getUndeclaredTypes');
var jscs = require('jscodeshift');

var {statement} = jscs.template;

function addMissingTypes(root: Collection, options: SourceOptions): void {
  var first = FirstNode.get(root);
  if (!first) {
    return;
  }
  var _first = first; // For flow.

  var {moduleMap} = options;
  var requireOptions = {
    path: options.sourcePath,
    typeImport: true,
  };

  getUndeclaredTypes(root, options).forEach(name => {
    var node = moduleMap.getRequire(name, requireOptions);
    _first.insertBefore(node);
  });
}

module.exports = addMissingTypes;
