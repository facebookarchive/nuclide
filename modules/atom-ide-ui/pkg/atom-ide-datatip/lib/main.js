'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModifierKeys = undefined;

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _DatatipManager;

function _load_DatatipManager() {
  return _DatatipManager = require('./DatatipManager');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Borrowed from the LSP API.
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

const ModifierKeys = exports.ModifierKeys = Object.freeze({
  META: 'metaKey',
  SHIFT: 'shiftKey',
  ALT: 'altKey',
  CTRL: 'ctrlKey'
});

class Activation {

  constructor() {
    this._datatipManager = new (_DatatipManager || _load_DatatipManager()).DatatipManager();
  }

  provideDatatipService() {
    return this._datatipManager;
  }

  dispose() {
    this._datatipManager.dispose();
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);