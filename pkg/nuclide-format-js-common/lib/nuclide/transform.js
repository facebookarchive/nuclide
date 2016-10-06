

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function transform(source, options) {
  var blacklist = options.blacklist || new Set();
  if (blacklist.has('nuclide.fixHeader')) {
    return source;
  }
  return source.replace('\'use babel\';\n\n/* @flow */', '\'use babel\';\n/* @flow */');
}

module.exports = transform;