'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {sep: pathSeperator, normalize} = require('path');

function containsPath(rootPath: string, checkPath: string): boolean {
  var normalizedRootPath = normalize(rootPath);
  var normalizedCheckPath = normalize(checkPath);
  var rootPathNumberOfParts = normalizedRootPath.split(pathSeperator).length;
  // Extract the matching piece of the normalized path to compare with the root path.
  var rootPathMatch = normalizedCheckPath.split(pathSeperator).slice(0, rootPathNumberOfParts).join(pathSeperator);
  return rootPathMatch === normalizedRootPath;
}

module.exports = {
  containsPath,
};
