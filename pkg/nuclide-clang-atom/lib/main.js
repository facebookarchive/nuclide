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
exports.createAutocompleteProvider = createAutocompleteProvider;
exports.createTypeHintProvider = createTypeHintProvider;
exports.getHyperclickProvider = getHyperclickProvider;
exports.provideBusySignal = provideBusySignal;
exports.provideCodeFormat = provideCodeFormat;
exports.provideDiagnostics = provideDiagnostics;
exports.provideOutlineView = provideOutlineView;
exports.deactivate = deactivate;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _atom = require('atom');

var _TypeHintProvider = require('./TypeHintProvider');

var _constants = require('./constants');

var busySignalProvider = null;
var diagnosticProvider = null;
var subscriptions = null;

function getBusySignalProvider() {
  if (!busySignalProvider) {
    var _require = require('../../nuclide-busy-signal');

    var BusySignalProviderBase = _require.BusySignalProviderBase;

    busySignalProvider = new BusySignalProviderBase();
  }
  return busySignalProvider;
}

function getDiagnosticsProvider() {
  if (!diagnosticProvider) {
    var provider = require('./ClangDiagnosticsProvider');
    diagnosticProvider = new provider(getBusySignalProvider());
  }
  return diagnosticProvider;
}

function activate() {
  subscriptions = new _atom.CompositeDisposable();
  // Provide a 'Clean and rebuild' command to restart the Clang server for the current file
  // and reset all compilation flags. Useful when BUCK targets or headers change,
  // since those are heavily cached for performance. Also great for testing!
  subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-clang:clean-and-rebuild', _asyncToGenerator(function* () {
    var editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return;
    }
    var path = editor.getPath();
    if (path == null) {
      return;
    }

    var _require2 = require('./libclang');

    var reset = _require2.reset;

    yield reset(editor);
    if (diagnosticProvider != null) {
      diagnosticProvider.invalidateBuffer(editor.getBuffer());
      diagnosticProvider.runDiagnostics(editor);
    }
  })));
}

/** Provider for autocomplete service. */

function createAutocompleteProvider() {
  var _require3 = require('./AutocompleteProvider');

  var AutocompleteProvider = _require3.AutocompleteProvider;

  var autocompleteProvider = new AutocompleteProvider();
  var getSuggestions = autocompleteProvider.getAutocompleteSuggestions.bind(autocompleteProvider);

  return {
    selector: '.source.objc, .source.objcpp, .source.cpp, .source.c',
    inclusionPriority: 1,
    suggestionPriority: 5, // Higher than the snippets provider.
    getSuggestions: getSuggestions
  };
}

function createTypeHintProvider() {
  return {
    inclusionPriority: 1,
    providerName: _constants.PACKAGE_NAME,
    selector: Array.from(_constants.GRAMMAR_SET).join(', '),
    typeHint: function typeHint(editor, position) {
      return _TypeHintProvider.TypeHintProvider.typeHint(editor, position);
    }
  };
}

function getHyperclickProvider() {
  return require('./HyperclickProvider');
}

function provideBusySignal() {
  return getBusySignalProvider();
}

function provideCodeFormat() {
  return require('./CodeFormatProvider');
}

function provideDiagnostics() {
  return getDiagnosticsProvider();
}

function provideOutlineView() {
  return {
    name: _constants.PACKAGE_NAME,
    priority: 10,
    grammarScopes: Array.from(_constants.GRAMMAR_SET),
    getOutline: function getOutline(editor) {
      var _require4 = require('./OutlineViewProvider');

      var OutlineViewProvider = _require4.OutlineViewProvider;

      return OutlineViewProvider.getOutline(editor);
    }
  };
}

function deactivate() {
  if (diagnosticProvider != null) {
    diagnosticProvider.dispose();
    diagnosticProvider = null;
  }
  if (subscriptions != null) {
    subscriptions.dispose();
    subscriptions = null;
  }
}