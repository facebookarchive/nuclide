"use strict";

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _LinkTreeLinter() {
  const data = _interopRequireDefault(require("./LinkTreeLinter"));

  _LinkTreeLinter = function () {
    return data;
  };

  return data;
}

function _LintHelpers() {
  const data = _interopRequireDefault(require("./LintHelpers"));

  _LintHelpers = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _nuclideOpenFiles() {
  const data = require("../../nuclide-open-files");

  _nuclideOpenFiles = function () {
    return data;
  };

  return data;
}

function _nuclideLanguageService() {
  const data = require("../../nuclide-language-service");

  _nuclideLanguageService = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _config() {
  const data = require("./config");

  _config = function () {
    return data;
  };

  return data;
}

function _pythonPlatform() {
  const data = require("./pythonPlatform");

  _pythonPlatform = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
async function connectionToPythonService(connection) {
  const pythonService = (0, _nuclideRemoteConnection().getPythonServiceByConnection)(connection);
  const fileNotifier = await (0, _nuclideOpenFiles().getNotifierByConnection)(connection);
  const languageService = await pythonService.initialize(fileNotifier, {
    showGlobalVariables: (0, _config().getShowGlobalVariables)(),
    autocompleteArguments: (0, _config().getAutocompleteArguments)(),
    includeOptionalArguments: (0, _config().getIncludeOptionalArguments)()
  });
  return languageService;
}

function getAtomConfig() {
  return {
    name: 'Python',
    grammars: _constants().GRAMMARS,
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
      suggestionPriority: 5,
      // Higher than the snippets provider.
      disableForSelector: '.source.python .comment, .source.python .string',
      excludeLowerPriority: false,
      analytics: {
        eventName: 'nuclide-python',
        shouldLogInsertedSuggestion: false
      },
      autocompleteCacherConfig: {
        updateResults: _nuclideLanguageService().updateAutocompleteResults,
        updateFirstResults: _nuclideLanguageService().updateAutocompleteFirstResults
      },
      supportsResolve: false
    },
    definition: {
      version: '0.1.0',
      priority: 20,
      definitionEventName: 'python.get-definition'
    },
    typeHint: {
      version: '0.0.0',
      priority: 5,
      analyticsEventName: 'python.hover'
    },
    signatureHelp: (0, _config().getShowSignatureHelp)() ? {
      version: '0.1.0',
      priority: 1,
      triggerCharacters: new Set(['(', ',']),
      analyticsEventName: 'python.signatureHelp'
    } : undefined
  };
}

function resetServices() {
  (0, _nuclideRemoteConnection().getPythonServiceByConnection)(null).reset();

  _nuclideRemoteConnection().ServerConnection.getAllConnections().forEach(conn => {
    (0, _nuclideRemoteConnection().getPythonServiceByConnection)(conn).reset();
  });
}

class Activation {
  constructor(rawState) {
    this._pythonLanguageService = new (_nuclideLanguageService().AtomLanguageService)(connectionToPythonService, getAtomConfig());

    this._pythonLanguageService.activate();

    this._linkTreeLinter = new (_LinkTreeLinter().default)();
    this._subscriptions = new (_UniversalDisposable().default)(this._pythonLanguageService, atom.commands.add('atom-workspace', 'nuclide-python:reset-language-services', resetServices));
  }

  provideLint() {
    return {
      grammarScopes: Array.from(_constants().GRAMMAR_SET),
      scope: 'file',
      name: 'flake8',
      lint: editor => _LintHelpers().default.lint(editor)
    };
  }

  consumeLinterIndie(register) {
    const linter = register({
      name: 'Python'
    });
    const disposable = new (_UniversalDisposable().default)(linter, this._linkTreeLinter.observeMessages().subscribe(messages => linter.setAllMessages(messages)));

    this._subscriptions.add(disposable);

    return new (_UniversalDisposable().default)(disposable, () => this._subscriptions.remove(disposable));
  }

  consumePlatformService(service) {
    const disposable = service.register(_pythonPlatform().providePythonPlatformGroup);

    this._subscriptions.add(disposable);

    return new (_UniversalDisposable().default)(() => {
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

(0, _createPackage().default)(module.exports, Activation);