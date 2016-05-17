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
exports.deactivate = deactivate;
exports.consumeGadgetsService = consumeGadgetsService;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var disposables = null;

function activate() {
  disposables = new (_atom2 || _atom()).CompositeDisposable();
}

function deactivate() {
  (0, (_assert2 || _assert()).default)(disposables != null);
  disposables.dispose();
  disposables = null;
}

function consumeGadgetsService(api) {
  var Inspector = require('./ui/Inspector');
  (0, (_assert2 || _assert()).default)(disposables != null);
  disposables.add(api.registerGadget(Inspector));
}