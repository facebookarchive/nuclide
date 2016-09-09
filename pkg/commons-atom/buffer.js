Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.observeBuffers = observeBuffers;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function observeBuffers(observeBuffer) {
  atom.project.getBuffers().forEach(observeBuffer);
  return atom.project.onDidAddBuffer(observeBuffer);
}