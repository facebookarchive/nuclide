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

const FirstNode = require('../utils/FirstNode');

const getUndeclaredTypes = require('../utils/getUndeclaredTypes');
const jscs = require('jscodeshift');

const {statement} = jscs.template;

function addMissingTypes(root: Collection, options: SourceOptions): void {
  const first = FirstNode.get(root);
  if (!first) {
    return;
  }
  const _first = first; // For flow.

  const {moduleMap} = options;
  const requireOptions = {
    sourcePath: options.sourcePath,
    typeImport: true,
  };

  getUndeclaredTypes(root, options).forEach(name => {
    const node = moduleMap.getRequire(name, requireOptions);
    _first.insertBefore(node);
  });
}

module.exports = addMissingTypes;
