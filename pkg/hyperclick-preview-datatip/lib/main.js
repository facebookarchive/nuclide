'use strict';

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _HyperclickPreviewManager;

function _load_HyperclickPreviewManager() {
  return _HyperclickPreviewManager = _interopRequireDefault(require('./HyperclickPreviewManager'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const PACKAGE_NAME = 'hyperclick-preview-datatip'; /**
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
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.hyperclickPreviewManager = new (_HyperclickPreviewManager || _load_HyperclickPreviewManager()).default();

    this._disposables.add(this.hyperclickPreviewManager);
  }

  consumeDefinitionService(service) {
    return this.hyperclickPreviewManager.setDefinitionService(service);
  }

  consumeDatatipService(service) {
    const datatipProvider = {
      validForScope: () => true,
      providerName: PACKAGE_NAME,
      inclusionPriority: 1,
      modifierDatatip: (editor, bufferPosition, heldKeys) => this.hyperclickPreviewManager.modifierDatatip(editor, bufferPosition, heldKeys)
    };

    const disposable = service.addModifierProvider(datatipProvider);
    this._disposables.add(disposable);
    return disposable;
  }

  dispose() {
    this._disposables.dispose();
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);