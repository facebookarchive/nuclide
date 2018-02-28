'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let connectionToPythonService = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (connection) {
    const pythonService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getPythonServiceByConnection)(connection);
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
})(); /**
       * Copyright (c) 2015-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the license found in the LICENSE file in
       * the root directory of this source tree.
       *
       * 
       * @format
       */

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

var _LinkTreeLinter;

function _load_LinkTreeLinter() {
  return _LinkTreeLinter = _interopRequireDefault(require('./LinkTreeLinter'));
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

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _pythonPlatform;

function _load_pythonPlatform() {
  return _pythonPlatform = require('./pythonPlatform');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const atomConfig = {
  name: 'Python',
  grammars: (_constants || _load_constants()).GRAMMARS,
  outline: {
    version: '0.1.0',
    priority: 1,
    analyticsEventName: 'python.outline'
  },
  codeFormat: {
    version: '0.1.0',
    priority: 1,
    analyticsEventName: 'python.formatCode',
    canFormatRanges: false,
    canFormatAtPosition: false
  },
  findReferences: {
    version: '0.1.0',
    analyticsEventName: 'python.get-references'
  },
  autocomplete: {
    inclusionPriority: 5,
    suggestionPriority: 5, // Higher than the snippets provider.
    disableForSelector: '.source.python .comment, .source.python .string',
    excludeLowerPriority: false,
    analytics: {
      eventName: 'nuclide-python',
      shouldLogInsertedSuggestion: false
    },
    autocompleteCacherConfig: {
      updateResults: (_nuclideLanguageService || _load_nuclideLanguageService()).updateAutocompleteResults,
      updateFirstResults: (_nuclideLanguageService || _load_nuclideLanguageService()).updateAutocompleteFirstResults
    }
  },
  definition: {
    version: '0.1.0',
    priority: 20,
    definitionEventName: 'python.get-definition'
  },
  evaluationExpression: {
    version: '0.0.0',
    analyticsEventName: 'python.evaluationExpression',
    matcher: { kind: 'default' }
  },
  typeHint: {
    version: '0.0.0',
    priority: 1,
    analyticsEventName: 'python.hover'
  }
};

function resetServices() {
  (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getPythonServiceByConnection)(null).reset();
  (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.getAllConnections().forEach(conn => {
    (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getPythonServiceByConnection)(conn).reset();
  });
}

class Activation {

  constructor(rawState) {
    this._pythonLanguageService = new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(connectionToPythonService, atomConfig);
    this._pythonLanguageService.activate();
    this._linkTreeLinter = new (_LinkTreeLinter || _load_LinkTreeLinter()).default();
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._pythonLanguageService, atom.commands.add('atom-workspace', 'nuclide-python:reset-language-services', resetServices));
  }

  provideLint() {
    return {
      grammarScopes: Array.from((_constants || _load_constants()).GRAMMAR_SET),
      scope: 'file',
      lintOnFly: (0, (_config || _load_config()).getLintOnFly)(),
      name: 'flake8',
      lint: editor => (_LintHelpers || _load_LintHelpers()).default.lint(editor)
    };
  }

  consumeLinterIndie(register) {
    const linter = register({ name: 'Python' });
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(linter, this._linkTreeLinter.observeMessages().subscribe(messages => linter.setAllMessages(messages)));
    this._subscriptions.add(disposable);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(disposable, () => this._subscriptions.remove(disposable));
  }

  consumePlatformService(service) {
    const disposable = service.register((_pythonPlatform || _load_pythonPlatform()).providePythonPlatformGroup);
    this._subscriptions.add(disposable);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._subscriptions.remove(disposable);
    });
  }

  consumeBuckTaskRunner(service) {
    return this._linkTreeLinter.consumeBuckTaskRunner(service);
  }

  consumeCwdApi(api) {
    return this._linkTreeLinter.consumeCwdApi(api);
  }

  dispose() {
    this._subscriptions.dispose();
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);