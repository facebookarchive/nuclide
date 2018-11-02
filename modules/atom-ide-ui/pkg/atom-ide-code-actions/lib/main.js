"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _CodeActionManager() {
  const data = require("./CodeActionManager");

  _CodeActionManager = function () {
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
 *  strict-local
 * @format
 */
class Activation {
  constructor() {
    this._codeActionManager = new (_CodeActionManager().CodeActionManager)();
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

(0, _createPackage().default)(module.exports, Activation);