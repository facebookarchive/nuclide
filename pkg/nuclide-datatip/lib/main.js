'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.provideDatatipService = provideDatatipService;
exports.deactivate = deactivate;

var _DatatipManager;

function _load_DatatipManager() {
  return _DatatipManager = require('./DatatipManager');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

let datatipManager = null;

function activate(state) {
  if (datatipManager == null) {
    datatipManager = new (_DatatipManager || _load_DatatipManager()).DatatipManager();
  }
}

function provideDatatipService() {
  if (!datatipManager) {
    throw new Error('Invariant violation: "datatipManager"');
  }

  return datatipManager;
}

function deactivate() {
  if (datatipManager != null) {
    datatipManager.dispose();
    datatipManager = null;
  }
}