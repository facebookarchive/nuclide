'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _focus;

function _load_focus() {
  return _focus = require('./focus');
}

var _TabbableContainer;

function _load_TabbableContainer() {
  return _TabbableContainer = require('../../nuclide-ui/TabbableContainer');
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
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add('atom-workspace .' + (_TabbableContainer || _load_TabbableContainer()).TABBABLE, {
      'nuclide-tab-focus:focus-next': (_focus || _load_focus()).focusNext,
      'nuclide-tab-focus:focus-previous': (_focus || _load_focus()).focusPrevious
    }));
  }

  dispose() {
    this._disposables.dispose();
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);