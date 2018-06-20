'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _LanguageStatusManager;

function _load_LanguageStatusManager() {
  return _LanguageStatusManager = require('./LanguageStatusManager');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor(state) {
    this._languageStatusManager = new (_LanguageStatusManager || _load_LanguageStatusManager()).LanguageStatusManager();
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
  }

  // FOR TESTING
  triggerProviderChange() {
    this._languageStatusManager._providersChanged.next();
  }
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

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);