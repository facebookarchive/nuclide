'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ObservableDiagnosticUpdater;

function _load_ObservableDiagnosticUpdater() {
  return _ObservableDiagnosticUpdater = _interopRequireDefault(require('./ObservableDiagnosticUpdater'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
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

class DiagnosticUpdater {

  constructor(store) {
    this._observableUpdater = new (_ObservableDiagnosticUpdater || _load_ObservableDiagnosticUpdater()).default(store);
  }

  onFileMessagesDidUpdate(callback, filePath) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._observableUpdater.getFileMessageUpdates(filePath).subscribe(callback));
  }

  onProjectMessagesDidUpdate(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._observableUpdater.projectMessageUpdates.subscribe(callback));
  }

  onAllMessagesDidUpdate(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._observableUpdater.allMessageUpdates.subscribe(callback));
  }

  applyFix(message) {
    this._observableUpdater.applyFix(message);
  }

  applyFixesForFile(file) {
    this._observableUpdater.applyFixesForFile(file);
  }
}
exports.default = DiagnosticUpdater;