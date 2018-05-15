'use strict';var _createPackage;











function _load_createPackage() {return _createPackage = _interopRequireDefault(require('../../../../nuclide-commons-atom/createPackage'));}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../nuclide-commons/UniversalDisposable'));}var _installTextEditorStyles;
function _load_installTextEditorStyles() {return _installTextEditorStyles = _interopRequireDefault(require('./backports/installTextEditorStyles'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

class Activation {


  activate() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_installTextEditorStyles || _load_installTextEditorStyles()).default)());
  }

  dispose() {
    this._disposables.dispose();
  }} /**
      * Copyright (c) 2017-present, Facebook, Inc.
      * All rights reserved.
      *
      * This source code is licensed under the BSD-style license found in the
      * LICENSE file in the root directory of this source tree. An additional grant
      * of patent rights can be found in the PATENTS file in the same directory.
      *
      * 
      * @format
      */(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);