"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _range() {
  const data = require("../../../../nuclide-commons-atom/range");

  _range = function () {
    return data;
  };

  return data;
}

function _range2() {
  const data = require("../../../../nuclide-commons/range");

  _range2 = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
// An atom$Range-aware, single-item cache for the common case of requerying
// a definition (such as previewing hyperclick and then jumping to the
// destination). It invalidates whenever the originating editor changes.
class DefinitionCache {
  constructor() {
    this._disposables = new (_UniversalDisposable().default)();
  }

  dispose() {
    this._disposables.dispose();
  }

  getCached(editor, position) {
    if (this._cachedResultRange != null && this._cachedResultEditor === editor && (0, _range2().isPositionInRange)(position, this._cachedResultRange)) {
      return this._cachedResultPromise;
    }
  }

  async get(editor, position, getImpl) {
    const cached = this.getCached(editor, position);

    if (cached != null) {
      return cached;
    } // invalidate whenever the buffer changes


    const invalidateAndStopListening = () => {
      // Make sure we don't invalidate a newer cache result.
      if (this._cachedResultPromise === promise) {
        this._cachedResultEditor = null;
        this._cachedResultRange = null;
        this._cachedResultPromise = null;
      }

      this._disposables.remove(editorDisposables);

      editorDisposables.dispose();
    };

    const editorDisposables = new (_UniversalDisposable().default)(editor.getBuffer().onDidChangeText(invalidateAndStopListening), editor.onDidDestroy(invalidateAndStopListening));

    this._disposables.add(editorDisposables);

    const wordGuess = (0, _range().wordAtPosition)(editor, position);
    this._cachedResultRange = wordGuess && wordGuess.range;
    this._cachedResultEditor = editor;
    const promise = getImpl().then(result => {
      // Rejected providers turn into null values here.
      // Invalidate the cache to ensure that the user can retry the request.
      if (result == null) {
        invalidateAndStopListening();
      }

      return result;
    });
    this._cachedResultPromise = promise;
    return this._cachedResultPromise;
  }

}

var _default = DefinitionCache;
exports.default = _default;