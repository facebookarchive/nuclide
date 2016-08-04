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

import FirstNode from '../utils/FirstNode';
import getUndeclaredIdentifiers from '../utils/getUndeclaredIdentifiers';
import getUndeclaredJSXIdentifiers from '../utils/getUndeclaredJSXIdentifiers';

function addMissingRequires(root: Collection, options: SourceOptions): void {
  const first = FirstNode.get(root);
  if (!first) {
    return;
  }
  const _first = first; // For flow.

  const {moduleMap} = options;

  // Add the missing requires.
  getUndeclaredIdentifiers(root, options).forEach(name => {
    const node = moduleMap.getRequire(name, {sourcePath: options.sourcePath});
    _first.insertBefore(node);
  });

  // Add missing JSX requires.
  getUndeclaredJSXIdentifiers(root, options).forEach(name => {
    const node = moduleMap.getRequire(name, {
      sourcePath: options.sourcePath,
      jsxIdentifier: true,
    });
    _first.insertBefore(node);
  });
}

module.exports = addMissingRequires;
