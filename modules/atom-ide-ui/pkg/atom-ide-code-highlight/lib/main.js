'use strict';var _createPackage;













function _load_createPackage() {return _createPackage = _interopRequireDefault(require('../../../../nuclide-commons-atom/createPackage'));}var _CodeHighlightManager;
function _load_CodeHighlightManager() {return _CodeHighlightManager = _interopRequireDefault(require('./CodeHighlightManager'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

class Activation {


  constructor() {
    this._codeHighlightManager = new (_CodeHighlightManager || _load_CodeHighlightManager()).default();
  }

  dispose() {
    this._codeHighlightManager.dispose();
  }

  addProvider(provider) {
    return this._codeHighlightManager.addProvider(provider);
  }} /**
      * Copyright (c) 2017-present, Facebook, Inc.
      * All rights reserved.
      *
      * This source code is licensed under the BSD-style license found in the
      * LICENSE file in the root directory of this source tree. An additional grant
      * of patent rights can be found in the PATENTS file in the same directory.
      *
      *  strict-local
      * @format
      */(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);