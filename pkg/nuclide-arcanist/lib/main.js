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
exports.dactivate = dactivate;
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

var subscriptions = null;

var busySignalProvider = null;

function getBusySignalProvider() {
  if (busySignalProvider == null) {
    var _require = require('../../nuclide-busy-signal');

    var DedupedBusySignalProviderBase = _require.DedupedBusySignalProviderBase;

    busySignalProvider = new DedupedBusySignalProviderBase();
  }
  return busySignalProvider;
}

function activate() {
  if (subscriptions) {
    return;
  }

  subscriptions = new (_atom2 || _atom()).CompositeDisposable();

  var _require2 = require('../../nuclide-atom-helpers');

  var registerGrammarForFileExtension = _require2.registerGrammarForFileExtension;

  registerGrammarForFileExtension('source.json', '.arcconfig');
}

function dactivate() {
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
  var _require3 = require('./ArcanistDiagnosticsProvider');

  var ArcanistDiagnosticsProvider = _require3.ArcanistDiagnosticsProvider;

  var provider = new ArcanistDiagnosticsProvider(getBusySignalProvider());
  (0, (_assert2 || _assert()).default)(subscriptions != null);
  subscriptions.add(provider);
  return provider;
}