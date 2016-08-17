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
exports.provideBusySignal = provideBusySignal;
exports.provideDiagnostics = provideDiagnostics;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsAtomRegisterGrammar2;

function _commonsAtomRegisterGrammar() {
  return _commonsAtomRegisterGrammar2 = _interopRequireDefault(require('../../commons-atom/register-grammar'));
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideBusySignal2;

function _nuclideBusySignal() {
  return _nuclideBusySignal2 = require('../../nuclide-busy-signal');
}

var _ArcanistDiagnosticsProvider2;

function _ArcanistDiagnosticsProvider() {
  return _ArcanistDiagnosticsProvider2 = require('./ArcanistDiagnosticsProvider');
}

var subscriptions = null;

var busySignalProvider = null;

function getBusySignalProvider() {
  if (busySignalProvider == null) {
    busySignalProvider = new (_nuclideBusySignal2 || _nuclideBusySignal()).DedupedBusySignalProviderBase();
  }
  return busySignalProvider;
}

function activate() {
  if (subscriptions) {
    return;
  }

  subscriptions = new (_atom2 || _atom()).CompositeDisposable();

  (0, (_commonsAtomRegisterGrammar2 || _commonsAtomRegisterGrammar()).default)('source.json', '.arcconfig');
}

function deactivate() {
  if (subscriptions) {
    subscriptions.dispose();
    subscriptions = null;
  }
  busySignalProvider = null;
}

function provideBusySignal() {
  return getBusySignalProvider();
}

function provideDiagnostics() {
  var provider = new (_ArcanistDiagnosticsProvider2 || _ArcanistDiagnosticsProvider()).ArcanistDiagnosticsProvider(getBusySignalProvider());
  (0, (_assert2 || _assert()).default)(subscriptions != null);
  subscriptions.add(provider);
  return provider;
}