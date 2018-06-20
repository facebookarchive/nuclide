'use strict';

var _disablePackage;

function _load_disablePackage() {
  return _disablePackage = _interopRequireDefault(require('../../commons-atom/disablePackage'));
}

var _disablePackage2;

function _load_disablePackage2() {
  return _disablePackage2 = require('../../commons-atom/disablePackage');
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _ImageEditor;

function _load_ImageEditor() {
  return _ImageEditor = _interopRequireDefault(require('./ImageEditor'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor(state) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.workspace.addOpener(openUri),
    // If you enable this package, we need to disable image-view.
    (0, (_disablePackage || _load_disablePackage()).default)('image-view', { reason: (_disablePackage2 || _load_disablePackage2()).DisabledReason.REIMPLEMENTED }));
  }

  deserializeImageEditor(state) {
    return new (_ImageEditor || _load_ImageEditor()).default(state.filePath);
  }

  dispose() {
    this._disposables.dispose();
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

function openUri(uri) {
  return (_nuclideUri || _load_nuclideUri()).default.looksLikeImageUri(uri) ? new (_ImageEditor || _load_ImageEditor()).default(uri) : null;
}