"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AtomLanguageService = void 0;

function _nuclideOpenFiles() {
  const data = require("../../nuclide-open-files");

  _nuclideOpenFiles = function () {
    return data;
  };

  return data;
}

function _FileEventHandlers() {
  const data = require("./FileEventHandlers");

  _FileEventHandlers = function () {
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

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _AdditionalLogFileProvider() {
  const data = require("./AdditionalLogFileProvider");

  _AdditionalLogFileProvider = function () {
    return data;
  };

  return data;
}

function _CodeHighlightProvider() {
  const data = require("./CodeHighlightProvider");

  _CodeHighlightProvider = function () {
    return data;
  };

  return data;
}

function _OutlineViewProvider() {
  const data = require("./OutlineViewProvider");

  _OutlineViewProvider = function () {
    return data;
  };

  return data;
}

function _RenameProvider() {
  const data = require("./RenameProvider");

  _RenameProvider = function () {
    return data;
  };

  return data;
}

function _StatusProvider() {
  const data = require("./StatusProvider");

  _StatusProvider = function () {
    return data;
  };

  return data;
}

function _TypeCoverageProvider() {
  const data = require("./TypeCoverageProvider");

  _TypeCoverageProvider = function () {
    return data;
  };

  return data;
}

function _DefinitionProvider() {
  const data = require("./DefinitionProvider");

  _DefinitionProvider = function () {
    return data;
  };

  return data;
}

function _TypeHintProvider() {
  const data = require("./TypeHintProvider");

  _TypeHintProvider = function () {
    return data;
  };

  return data;
}

function _CodeFormatProvider() {
  const data = require("./CodeFormatProvider");

  _CodeFormatProvider = function () {
    return data;
  };

  return data;
}

function _FindReferencesProvider() {
  const data = require("./FindReferencesProvider");

  _FindReferencesProvider = function () {
    return data;
  };

  return data;
}

function _AutocompleteProvider() {
  const data = require("./AutocompleteProvider");

  _AutocompleteProvider = function () {
    return data;
  };

  return data;
}

function _DiagnosticsProvider() {
  const data = require("./DiagnosticsProvider");

  _DiagnosticsProvider = function () {
    return data;
  };

  return data;
}

function _CodeActionProvider() {
  const data = require("./CodeActionProvider");

  _CodeActionProvider = function () {
    return data;
  };

  return data;
}

function _SignatureHelpProvider() {
  const data = require("./SignatureHelpProvider");

  _SignatureHelpProvider = function () {
    return data;
  };

  return data;
}

function _SyntacticSelectionProvider() {
  const data = require("./SyntacticSelectionProvider");

  _SyntacticSelectionProvider = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
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
 *  strict-local
 * @format
 */
class AtomLanguageService {
  constructor(languageServiceFactory, config, onDidInsertSuggestion, logger = (0, _log4js().getLogger)('nuclide-language-service')) {
    this._config = config;
    this._onDidInsertSuggestion = onDidInsertSuggestion;
    this._logger = logger;
    this._subscriptions = new (_UniversalDisposable().default)();
    const lazy = true;
    this._connectionToLanguageService = new (_nuclideRemoteConnection().ConnectionCache)(languageServiceFactory, lazy);

    this._subscriptions.add(this._connectionToLanguageService);
  }

  _selector() {
    return this._config.grammars.join(', ');
  }

  activate() {
    let busySignalService = null;
    const busySignalProvider = {
      reportBusyWhile(message, f) {
        if (busySignalService != null) {
          return busySignalService.reportBusyWhile(message, f);
        } else {
          return f();
        }
      }

    };

    this._subscriptions.add(atom.packages.serviceHub.consume('atom-ide-busy-signal', '0.1.0', service => {
      this._subscriptions.add(service);

      busySignalService = service;
      return new (_UniversalDisposable().default)(() => {
        this._subscriptions.remove(service);

        busySignalService = null;
      });
    }));

    const highlightConfig = this._config.highlight;

    if (highlightConfig != null) {
      this._subscriptions.add(_CodeHighlightProvider().CodeHighlightProvider.register(this._config.name, this._config.grammars, highlightConfig, this._connectionToLanguageService));
    }

    const outlineConfig = this._config.outline;

    if (outlineConfig != null) {
      this._subscriptions.add(_OutlineViewProvider().OutlineViewProvider.register(this._config.name, this._config.grammars, outlineConfig, this._connectionToLanguageService));
    }

    const coverageConfig = this._config.coverage;

    if (coverageConfig != null) {
      this._subscriptions.add(_TypeCoverageProvider().TypeCoverageProvider.register(this._config.name, this._selector(), coverageConfig, this._connectionToLanguageService));
    }

    const definitionConfig = this._config.definition;

    if (definitionConfig != null) {
      this._subscriptions.add(_DefinitionProvider().DefinitionProvider.register(this._config.name, this._config.grammars, definitionConfig, this._connectionToLanguageService));
    }

    const typeHintConfig = this._config.typeHint;

    if (typeHintConfig != null) {
      this._subscriptions.add(_TypeHintProvider().TypeHintProvider.register(this._config.name, this._selector(), typeHintConfig, this._connectionToLanguageService));
    }

    const codeFormatConfig = this._config.codeFormat;

    if (codeFormatConfig != null) {
      this._subscriptions.add(_CodeFormatProvider().CodeFormatProvider.register(this._config.name, this._config.grammars, codeFormatConfig, this._connectionToLanguageService));
    }

    const findReferencesConfig = this._config.findReferences;

    if (findReferencesConfig != null) {
      this._subscriptions.add(_FindReferencesProvider().FindReferencesProvider.register(this._config.name, this._config.grammars, findReferencesConfig, this._connectionToLanguageService));
    }

    const renameConfig = this._config.rename;

    if (renameConfig != null) {
      this._subscriptions.add(_RenameProvider().RenameProvider.register(this._config.name, this._config.grammars, renameConfig, this._connectionToLanguageService));
    }

    const autocompleteConfig = this._config.autocomplete;

    if (autocompleteConfig != null) {
      this._subscriptions.add(_AutocompleteProvider().AutocompleteProvider.register(this._config.name, this._config.grammars, autocompleteConfig, this._onDidInsertSuggestion, this._connectionToLanguageService));
    }

    const diagnosticsConfig = this._config.diagnostics;

    if (diagnosticsConfig != null) {
      this._subscriptions.add((0, _DiagnosticsProvider().registerDiagnostics)(this._config.name, this._config.grammars, diagnosticsConfig, this._logger, this._connectionToLanguageService, busySignalProvider));
    }

    const codeActionConfig = this._config.codeAction;

    if (codeActionConfig != null) {
      this._subscriptions.add(_CodeActionProvider().CodeActionProvider.register(this._config.name, this._config.grammars, codeActionConfig, this._connectionToLanguageService));
    }

    const {
      signatureHelp
    } = this._config;

    if (signatureHelp != null) {
      this._subscriptions.add(_SignatureHelpProvider().SignatureHelpProvider.register(this._config.grammars, signatureHelp, this._connectionToLanguageService));
    }

    const syntacticSelection = this._config.syntacticSelection;

    if (syntacticSelection != null) {
      this._subscriptions.add(_SyntacticSelectionProvider().SyntacticSelectionProvider.register(this._config.name, this._config.grammars, syntacticSelection, this._connectionToLanguageService));
    }

    const status = this._config.status;

    if (status != null) {
      this._subscriptions.add(_StatusProvider().StatusProvider.register(this._config.name, this._config.grammars, status, this._connectionToLanguageService));
    }

    const fileEventHandlersConfig = this._config.fileEventHandlers;

    if (fileEventHandlersConfig != null) {
      if (fileEventHandlersConfig.supportsOnWillSave) {
        this._subscriptions.add(this._registerOnWillSave(fileEventHandlersConfig));
      }
    }

    this._subscriptions.add(_AdditionalLogFileProvider().LanguageAdditionalLogFilesProvider.register(this._config.name, this._connectionToLanguageService));
  }

  async getLanguageServiceForUri(fileUri) {
    return this._connectionToLanguageService.getForUri(fileUri);
  }

  async isFileInProject(fileUri) {
    const languageService = this._connectionToLanguageService.getExistingForUri(fileUri);

    if (languageService == null) {
      return false;
    }

    return (await languageService).isFileInProject(fileUri);
  }

  getCachedLanguageServices() {
    return this._connectionToLanguageService.entries();
  }

  observeLanguageServices() {
    return this._connectionToLanguageService.observeValues().switchMap(languageService => {
      return _RxMin.Observable.fromPromise(languageService);
    });
  }

  observeConnectionLanguageEntries() {
    return this._connectionToLanguageService.observeEntries().switchMap(([connection, servicePromise]) => {
      return _RxMin.Observable.fromPromise(servicePromise).map(languageService => [connection, languageService]);
    });
  }

  _registerOnWillSave(config) {
    const callback = editor => {
      return _RxMin.Observable.defer(async () => {
        const fileVersion = await (0, _nuclideOpenFiles().getFileVersionOfEditor)(editor);
        const languageService = await this._connectionToLanguageService.getForUri(editor.getPath());
        return [languageService, fileVersion];
      }).flatMap(([languageService, fileVersion]) => {
        if (languageService == null || fileVersion == null) {
          return _RxMin.Observable.empty();
        }

        return languageService.onWillSave(fileVersion).refCount();
      });
    };

    const {
      onWillSavePriority,
      onWillSaveTimeout
    } = config;
    return (0, _FileEventHandlers().registerOnWillSave)({
      name: this._config.name,
      grammarScopes: this._config.grammars,
      callback,
      priority: onWillSavePriority == null ? 0 : onWillSavePriority,
      timeout: onWillSaveTimeout == null ? 50 : onWillSaveTimeout
    });
  }

  dispose() {
    this._subscriptions.dispose();
  }

}

exports.AtomLanguageService = AtomLanguageService;