'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _range;

function _load_range() {
  return _range = require('nuclide-commons-atom/range');
}

var _range2;

function _load_range2() {
  return _range2 = require('nuclide-commons/range');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// An atom$Range-aware, single-item cache for the common case of requerying
// a definition (such as previewing hyperclick and then jumping to the
// destination). It invalidates whenever the originating editor changes.
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

class DefinitionCache {
  constructor() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  dispose() {
    this._disposables.dispose();
  }

  get(editor, position, getImpl) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      // queryRange is often a list of one range
      if (_this._cachedResultRange != null && _this._cachedResultEditor === editor && (0, (_range2 || _load_range2()).isPositionInRange)(position, _this._cachedResultRange)) {
        return _this._cachedResultPromise;
      }

      // invalidate whenever the buffer changes
      const invalidateAndStopListening = function () {
        _this._cachedResultEditor = null;
        _this._cachedResultRange = null;
        _this._cachedResultRange = null;
        _this._disposables.remove(editorDisposables);
        editorDisposables.dispose();
      };
      const editorDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(editor.onDidChange(invalidateAndStopListening), editor.onDidDestroy(invalidateAndStopListening));
      _this._disposables.add(editorDisposables);

      const wordGuess = (0, (_range || _load_range()).wordAtPosition)(editor, position);
      _this._cachedResultRange = wordGuess && wordGuess.range;
      _this._cachedResultPromise = getImpl();

      return _this._cachedResultPromise;
    })();
  }
}

exports.default = DefinitionCache;