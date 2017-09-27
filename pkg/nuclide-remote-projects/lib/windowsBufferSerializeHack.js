'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = windowsBufferSerializeHack;

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * On Windows, normalizing nuclide://a/b/c results in nuclide:\a\b\c.
 * This causes an EINVAL on Atom startup when Atom attempts to read the path;
 * presumably because nuclide:\ is an invalid drive marker. This actually blocks initialization!
 *
 * Instead, we'll override the buffer serializer to normalize nuclide_\/a/b/c instead,
 * which becomes nuclide_\a\b\c. At the very least, this is enough to allow Atom to start up.
 *
 * Atom startup shouldn't be blocked by such errors, and we should fix that.
 * Until then, this is enough to unblock Windows users.
 */
function windowsBufferSerializeHack() {
  if (process.platform !== 'win32') {
    return new _atom.Disposable();
  }
  let enabled = true;
  // $FlowIgnore: hacks
  const realSerialize = _atom.TextBuffer.prototype.serialize;
  // $FlowIgnore: hacks
  _atom.TextBuffer.prototype.serialize = function () {
    const state = realSerialize.call(this);
    if (enabled) {
      const { filePath } = state;
      if (filePath != null && (_nuclideUri || _load_nuclideUri()).default.isRemote(filePath)) {
        state.filePath = (_utils || _load_utils()).NUCLIDE_PROTOCOL_PREFIX_WIN + filePath.substr((_utils || _load_utils()).NUCLIDE_PROTOCOL_PREFIX.length);
      }
    }
    return state;
  };
  return new _atom.Disposable(() => {
    enabled = false;
  });
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */