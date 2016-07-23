'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AbsolutePath, Identifier, Literal, RelativePath} from '../types/common';

import StringUtils from './StringUtils';
import nuclideUri from '../../../commons-node/nuclideUri';

function getIdentifiersFromPath(filePath: AbsolutePath): Set<Identifier> {
  const ids = new Set();

  const baseName = nuclideUri.basename(filePath);

  // Get rid of extensions like, '.js', '.jsx', '.react.js', etc.
  const noExtensions = baseName.split('.')[0];

  // These are not valid tokens in an identifier so we have to remove them.
  const splits = noExtensions.split(/[^\w]/);

  // Just a standard identifier.
  ids.add(splits.join(''));

  // Then a camel case identifier (or possibly title case based on file name).
  const camelCaseSplits = [splits[0]];
  for (let i = 1; i < splits.length; i++) {
    camelCaseSplits.push(StringUtils.capitalize(splits[i]));
  }
  ids.add(camelCaseSplits.join(''));

  return ids;
}

function getLiteralFromPath(filePath: AbsolutePath): Literal {
  const baseName = nuclideUri.basename(filePath);
  return nuclideUri.stripExtension(baseName);
}

function relativizeForRequire(
  sourcePath: AbsolutePath,
  destPath: AbsolutePath,
): RelativePath {
  const relativePath = nuclideUri.relative(nuclideUri.dirname(sourcePath), destPath);
  const noFileType = nuclideUri.stripExtension(relativePath);
  return nuclideUri.ensureLocalPrefix(noFileType);
}

const ModuleMapUtils = {
  getIdentifiersFromPath,
  getLiteralFromPath,
  relativizeForRequire,
};

module.exports = ModuleMapUtils;
