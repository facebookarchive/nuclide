'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var extend = require('util')._extend;

function immutableExtend(...args) {
  var object = {};
  for (var i = 0; i < args.length; i++) {
    object = extend(object, args[i]);
  }
  return object;
}

module.exports = {
  immutableExtend,
};
