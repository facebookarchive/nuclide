'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let connectionToPythonService = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (connection) {
    const pythonService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByConnection)(PYTHON_SERVICE_NAME, connection);
    const fileNotifier = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection);
    const languageService = yield pythonService.initialize(fileNotifier, {
      showGlobalVariables: (0, (_config || _load_config()).getShowGlobalVariables)(),
      autocompleteArguments: (0, (_config || _load_config()).getAutocompleteArguments)(),
      includeOptionalArguments: (0, (_config || _load_config()).getIncludeOptionalArguments)()
    });

    return languageService;
  });

  return function connectionToPythonService(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.activate = activate;
exports.provideLint = provideLint;
exports.provideBusySignal = provideBusySignal;
exports.deactivate = deactivate;

var _nuclideBusySignal;

function _load_nuclideBusySignal() {
  return _nuclideBusySignal = require('../../nuclide-busy-signal');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

var _LintHelpers;

function _load_LintHelpers() {
  return _LintHelpers = _interopRequireDefault(require('./LintHelpers'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _nuclideLanguageService;

function _load_nuclideLanguageService() {
  return _nuclideLanguageService = require('../../nuclide-language-service');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const PYTHON_SERVICE_NAME = 'PythonService';

let busySignalProvider = null;

const atomConfig = {
  name: 'Python',
  grammars: (_constants || _load_constants()).GRAMMARS,
  outline: {
    version: '0.0.0',
    priority: 1,
    analyticsEventName: 'python.outline'
  },
  codeFormat: {
    version: '0.0.0',
    priority: 1,
    analyticsEventName: 'python.formatCode',
    formatEntireFile: true
  },
  findReferences: {
    version: '0.0.0',
    analyticsEventName: 'python.get-references'
  },
  autocomplete: {
    version: '2.0.0',
    inclusionPriority: 5,
    suggestionPriority: 5, // Higher than the snippets provider.
    disableForSelector: '.source.python .comment, .source.python .string',
    excludeLowerPriority: false,
    analyticsEventName: 'nuclide-python:getAutocompleteSuggestions',
    autocompleteCacherConfig: null,
    onDidInsertSuggestionAnalyticsEventName: 'nuclide-python.autocomplete-chosen'
  },
  definition: {
    version: '0.0.0',
    priority: 20,
    definitionEventName: 'python.get-definition',
    definitionByIdEventName: 'python.get-definition-by-id'
  }
};

let pythonLanguageService = null;

function activate() {
  busySignalProvider = new (_nuclideBusySignal || _load_nuclideBusySignal()).DedupedBusySignalProviderBase();
  if (pythonLanguageService == null) {
    pythonLanguageService = new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(connectionToPythonService, atomConfig);
    pythonLanguageService.activate();
  }
}

function provideLint() {
  return {
    grammarScopes: Array.from((_constants || _load_constants()).GRAMMAR_SET),
    scope: 'file',
    lintOnFly: (0, (_config || _load_config()).getLintOnFly)(),
    name: 'nuclide-python',
    invalidateOnClose: true,
    lint(editor) {
      if (!busySignalProvider) {
        throw new Error('Invariant violation: "busySignalProvider"');
      }

      return busySignalProvider.reportBusy(`Python: Waiting for flake8 lint results for \`${editor.getTitle()}\``, () => (_LintHelpers || _load_LintHelpers()).default.lint(editor));
    }
  };
}

function provideBusySignal() {
  if (!busySignalProvider) {
    throw new Error('Invariant violation: "busySignalProvider"');
  }

  return busySignalProvider;
}

function deactivate() {
  if (pythonLanguageService != null) {
    pythonLanguageService.dispose();
    pythonLanguageService = null;
  }
}