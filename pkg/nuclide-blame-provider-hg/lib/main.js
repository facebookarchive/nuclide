Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.activate = activate;
exports.provideHgBlameProvider = provideHgBlameProvider;

var blameProvider = undefined;

function activate(state) {}

function provideHgBlameProvider() {
  if (!blameProvider) {
    blameProvider = require('./HgBlameProvider');
  }
  return blameProvider;
}