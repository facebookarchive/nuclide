'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = patchEditors;

var _atom = require('atom');

var _semver;

function _load_semver() {
  return _semver = _interopRequireDefault(require('semver'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Patch editors in order to avoid some memory leaks while we wait for fixes to land in Atom.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function patchEditors() {
  // Patch `onDidDestroy()` to use `once()`.
  // TODO(T19765423): Remove this when atom/atom#14905 is in the release.
  // $FlowIgnore
  _atom.TextEditor.prototype.onDidDestroy = function (callback) {
    return this.emitter.once('did-destroy', callback);
  };

  // Patch `destroyed()` to null out some properties.
  // TODO(T19765404): This can be removed once atom/atom@ca3395b is in the release.
  if ((_semver || _load_semver()).default.lt(atom.getVersion(), '1.19.0-beta')) {
    // $FlowIgnore
    const originalDestroyed = _atom.TextEditor.prototype.destroyed;
    // $FlowIgnore
    _atom.TextEditor.prototype.destroyed = function () {
      originalDestroyed.call(this);
      if (this.component != null) {
        if (this.component.element != null) {
          this.component.element.component = null;
        }
        this.component = null;
      }
      if (this.lineNumberGutter != null) {
        this.lineNumberGutter.element = null;
      }
    };
  }
}