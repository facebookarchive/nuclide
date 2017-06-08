'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.consumeDatatipService = consumeDatatipService;
exports.deactivate = deactivate;

var _UnicodeDatatipManager;

function _load_UnicodeDatatipManager() {
  return _UnicodeDatatipManager = _interopRequireDefault(require('./UnicodeDatatipManager'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let unicodeEscapesManager = null; /**
                                   * Copyright (c) 2015-present, Facebook, Inc.
                                   * All rights reserved.
                                   *
                                   * This source code is licensed under the license found in the LICENSE file in
                                   * the root directory of this source tree.
                                   *
                                   * 
                                   * @format
                                   */

function activate(state) {
  unicodeEscapesManager = new (_UnicodeDatatipManager || _load_UnicodeDatatipManager()).default();
}

function consumeDatatipService(service) {
  if (!(unicodeEscapesManager != null)) {
    throw new Error('Invariant violation: "unicodeEscapesManager != null"');
  }

  return unicodeEscapesManager.consumeDatatipService(service);
}

function deactivate() {
  if (!(unicodeEscapesManager != null)) {
    throw new Error('Invariant violation: "unicodeEscapesManager != null"');
  }

  unicodeEscapesManager.dispose();
  unicodeEscapesManager = null;
}