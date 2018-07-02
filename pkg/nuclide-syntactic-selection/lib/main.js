"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _SyntacticSelectionManager() {
  const data = require("./SyntacticSelectionManager");

  _SyntacticSelectionManager = function () {
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
  constructor() {
    this._syntacticSelectionManager = new (_SyntacticSelectionManager().SyntacticSelectionManager)();
  }

  dispose() {
    this._syntacticSelectionManager.dispose();
  }

  consumeSyntacticSelectionProvider(provider) {
    return this._syntacticSelectionManager.addProvider(provider);
  }

}

(0, _createPackage().default)(module.exports, Activation);