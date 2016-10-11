Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.activate = activate;
exports.consumeDatatipService = consumeDatatipService;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _UnicodeDatatipManager;

function _load_UnicodeDatatipManager() {
  return _UnicodeDatatipManager = _interopRequireDefault(require('./UnicodeDatatipManager'));
}

var unicodeEscapesManager = null;

function activate(state) {
  unicodeEscapesManager = new (_UnicodeDatatipManager || _load_UnicodeDatatipManager()).default();
}

function consumeDatatipService(service) {
  (0, (_assert || _load_assert()).default)(unicodeEscapesManager != null);
  return unicodeEscapesManager.consumeDatatipService(service);
}

function deactivate() {
  (0, (_assert || _load_assert()).default)(unicodeEscapesManager != null);
  unicodeEscapesManager.dispose();
  unicodeEscapesManager = null;
}