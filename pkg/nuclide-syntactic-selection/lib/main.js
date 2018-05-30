'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _SyntacticSelectionManager;

function _load_SyntacticSelectionManager() {
  return _SyntacticSelectionManager = require('./SyntacticSelectionManager');
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

  constructor() {
    this._syntacticSelectionManager = new (_SyntacticSelectionManager || _load_SyntacticSelectionManager()).SyntacticSelectionManager();
  }

  dispose() {
    this._syntacticSelectionManager.dispose();
  }

  consumeSyntacticSelectionProvider(provider) {
    return this._syntacticSelectionManager.addProvider(provider);
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);