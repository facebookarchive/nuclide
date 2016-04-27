

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var wrapStatement = require('../../wrappers/simple/wrapStatement');

function printDebuggerStatement(print, node) {
  var wrap = function wrap(x) {
    return wrapStatement(print, node, x);
  };
  return wrap(['debugger;']);
}

module.exports = printDebuggerStatement;