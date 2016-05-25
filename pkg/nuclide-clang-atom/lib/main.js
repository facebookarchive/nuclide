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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideBusySignal2;

function _nuclideBusySignal() {
  return _nuclideBusySignal2 = require('../../nuclide-busy-signal');
}

var _AutocompleteHelpers2;

function _AutocompleteHelpers() {
  return _AutocompleteHelpers2 = _interopRequireDefault(require('./AutocompleteHelpers'));
}

var _CodeFormatHelpers2;

function _CodeFormatHelpers() {
  return _CodeFormatHelpers2 = _interopRequireDefault(require('./CodeFormatHelpers'));
}

var _HyperclickHelpers2;

function _HyperclickHelpers() {
  return _HyperclickHelpers2 = _interopRequireDefault(require('./HyperclickHelpers'));
}

var _OutlineViewHelpers2;

function _OutlineViewHelpers() {
  return _OutlineViewHelpers2 = _interopRequireDefault(require('./OutlineViewHelpers'));
}

var _TypeHintHelpers2;

function _TypeHintHelpers() {
  return _TypeHintHelpers2 = _interopRequireDefault(require('./TypeHintHelpers'));
}

var _ClangDiagnosticsProvider2;

function _ClangDiagnosticsProvider() {
  return _ClangDiagnosticsProvider2 = _interopRequireDefault(require('./ClangDiagnosticsProvider'));
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _libclang2;

function _libclang() {
  return _libclang2 = require('./libclang');
}

var busySignalProvider = null;
var diagnosticProvider = null;
var subscriptions = null;

function activate() {
  subscriptions = new (_atom2 || _atom()).CompositeDisposable();
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
    yield (0, (_libclang2 || _libclang()).reset)(editor);
    if (diagnosticProvider != null) {
      diagnosticProvider.invalidateBuffer(editor.getBuffer());
      diagnosticProvider.runDiagnostics(editor);
    }
  })));

  busySignalProvider = new (_nuclideBusySignal2 || _nuclideBusySignal()).BusySignalProviderBase();
  diagnosticProvider = new (_ClangDiagnosticsProvider2 || _ClangDiagnosticsProvider()).default(busySignalProvider);
  subscriptions.add(diagnosticProvider);
}

/** Provider for autocomplete service. */

function createAutocompleteProvider() {
  return {
    selector: '.source.objc, .source.objcpp, .source.cpp, .source.c',
    inclusionPriority: 1,
    suggestionPriority: 5, // Higher than the snippets provider.
    getSuggestions: function getSuggestions(request) {
      return (_AutocompleteHelpers2 || _AutocompleteHelpers()).default.getAutocompleteSuggestions(request);
    }
  };
}

function createTypeHintProvider() {
  return {
    inclusionPriority: 1,
    providerName: (_constants2 || _constants()).PACKAGE_NAME,
    selector: Array.from((_constants2 || _constants()).GRAMMAR_SET).join(', '),
    typeHint: function typeHint(editor, position) {
      return (_TypeHintHelpers2 || _TypeHintHelpers()).default.typeHint(editor, position);
    }
  };
}

function getHyperclickProvider() {
  var IDENTIFIER_REGEXP = /([a-zA-Z_][a-zA-Z0-9_]*)/g;
  return {
    // It is important that this has a lower priority than the handler from
    // fb-diffs-and-tasks.
    priority: 10,
    providerName: (_constants2 || _constants()).PACKAGE_NAME,
    wordRegExp: IDENTIFIER_REGEXP,
    getSuggestionForWord: function getSuggestionForWord(editor, text, range) {
      return (_HyperclickHelpers2 || _HyperclickHelpers()).default.getSuggestionForWord(editor, text, range);
    }
  };
}

function provideBusySignal() {
  (0, (_assert2 || _assert()).default)(busySignalProvider);
  return busySignalProvider;
}

function provideCodeFormat() {
  return {
    selector: Array.from((_constants2 || _constants()).GRAMMAR_SET).join(', '),
    inclusionPriority: 1,
    formatEntireFile: function formatEntireFile(editor, range) {
      return (_CodeFormatHelpers2 || _CodeFormatHelpers()).default.formatEntireFile(editor, range);
    }
  };
}

function provideDiagnostics() {
  (0, (_assert2 || _assert()).default)(diagnosticProvider);
  return diagnosticProvider;
}

function provideOutlineView() {
  return {
    name: (_constants2 || _constants()).PACKAGE_NAME,
    priority: 10,
    grammarScopes: Array.from((_constants2 || _constants()).GRAMMAR_SET),
    updateOnEdit: false,
    getOutline: function getOutline(editor) {
      return (_OutlineViewHelpers2 || _OutlineViewHelpers()).default.getOutline(editor);
    }
  };
}

function deactivate() {
  if (subscriptions != null) {
    subscriptions.dispose();
    subscriptions = null;
  }
}