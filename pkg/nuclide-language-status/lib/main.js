"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _LanguageStatusManager() {
  const data = require("./LanguageStatusManager");

  _LanguageStatusManager = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class Activation {
  constructor(state) {
    this._languageStatusManager = new (_LanguageStatusManager().LanguageStatusManager)();

    this._languageStatusManager.deserialize(state);
  }

  dispose() {
    this._languageStatusManager.dispose();
  }

  serialize() {
    const serialized = this._languageStatusManager.serialize();

    return serialized;
  }

  consumeLanguageStatusProvider(provider) {
    return this._languageStatusManager.addProvider(provider);
  } // FOR TESTING


  triggerProviderChange() {
    this._languageStatusManager._providersChanged.next();
  }

}

(0, _createPackage().default)(module.exports, Activation);