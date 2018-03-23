'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _CodeActionManager;

function _load_CodeActionManager() {
  return _CodeActionManager = require('./CodeActionManager');
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

class Activation {

  constructor() {
    this._codeActionManager = new (_CodeActionManager || _load_CodeActionManager()).CodeActionManager();
  }

  dispose() {
    this._codeActionManager.dispose();
  }

  consumeCodeActionProvider(provider) {
    return this._codeActionManager.addProvider(provider);
  }

  consumeDiagnosticUpdates(diagnosticUpdater) {
    return this._codeActionManager.consumeDiagnosticUpdates(diagnosticUpdater);
  }

  provideCodeActionFetcher() {
    return this._codeActionManager.createCodeActionFetcher();
  }

  consumeIndie(register) {
    return this._codeActionManager.consumeIndie(register);
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);