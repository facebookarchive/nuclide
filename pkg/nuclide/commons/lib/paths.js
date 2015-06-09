'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var path = require('path');

/**
 * @param filePath A file path.
 * @return The file path with a trailing separator, if it doesn't already have one.
 */
function ensureTrailingSeparator(filePath: string): string {
  if (filePath.endsWith(path.sep)) {
    return filePath;
  } else {
    return filePath + path.sep;
  }
}

module.exports = {
  ensureTrailingSeparator,
};
