Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.observeBuffers = observeBuffers;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

// Once https://github.com/atom/atom/pull/12501 is released, switch to
// `atom.project.observeBuffers`.

function observeBuffers(observeBuffer) {
  atom.project.getBuffers().filter(function (buffer) {
    return !(_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.isBrokenDeserializedUri(buffer.getPath());
  }).forEach(observeBuffer);
  return atom.project.onDidAddBuffer(function (buffer) {
    if (!(_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.isBrokenDeserializedUri(buffer.getPath())) {
      observeBuffer(buffer);
    }
  });
}