"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
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

function _textEdit() {
  const data = require("../../../modules/nuclide-commons-atom/text-edit");

  _textEdit = function () {
    return data;
  };

  return data;
}

function _passesGK() {
  const data = _interopRequireDefault(require("../../commons-node/passesGK"));

  _passesGK = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _constantsForClient() {
  const data = require("../../nuclide-js-imports-server/src/utils/constantsForClient");

  _constantsForClient = function () {
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

function _nuclideLanguageServiceRpc() {
  const data = require("../../nuclide-language-service-rpc");

  _nuclideLanguageServiceRpc = function () {
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

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _nuclideUiComponentToolsCommon() {
  const data = require("../../nuclide-ui-component-tools-common");

  _nuclideUiComponentToolsCommon = function () {
    return data;
  };

  return data;
}

function _QuickOpenProvider() {
  const data = _interopRequireDefault(require("./QuickOpenProvider"));

  _QuickOpenProvider = function () {
    return data;
  };

  return data;
}

function _JSSymbolSearchProvider() {
  const data = _interopRequireDefault(require("./JSSymbolSearchProvider"));

  _JSSymbolSearchProvider = function () {
    return data;
  };

  return data;
}

function _DashProjectSymbolProvider() {
  const data = _interopRequireDefault(require("./DashProjectSymbolProvider"));

  _DashProjectSymbolProvider = function () {
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
// $FlowFB
async function connectToJSImportsService(connection) {
  const [fileNotifier, host] = await Promise.all([(0, _nuclideOpenFiles().getNotifierByConnection)(connection), (0, _nuclideLanguageService().getHostServices)()]);
  const service = (0, _nuclideRemoteConnection().getVSCodeLanguageServiceByConnection)(connection);
  const lspService = await service.createMultiLspLanguageService('jsimports', './pkg/nuclide-js-imports-server/src/index-entry.js', [], {
    fileNotifier,
    host,
    logCategory: 'jsimports',
    logLevel: _featureConfig().default.get('nuclide-js-imports-client.logLevel'),
    projectFileNames: ['.flowconfig'],
    fileExtensions: ['.js', '.jsx'],
    initializationOptions: await getAutoImportSettings(),
    fork: true
  });
  return lspService || new (_nuclideLanguageServiceRpc().NullLanguageService)();
}

function createLanguageService() {
  const diagnosticsConfig = {
    version: '0.2.0',
    analyticsEventName: 'jsimports.observe-diagnostics'
  };
  const autocompleteConfig = {
    inclusionPriority: 1,
    suggestionPriority: 3,
    excludeLowerPriority: false,
    analytics: {
      eventName: 'nuclide-js-imports',
      shouldLogInsertedSuggestion: true
    },
    disableForSelector: null,
    autocompleteCacherConfig: null,
    supportsResolve: false
  };
  const codeActionConfig = {
    version: '0.1.0',
    priority: 0,
    analyticsEventName: 'jsimports.codeAction',
    applyAnalyticsEventName: 'jsimports.applyCodeAction'
  };
  const atomConfig = {
    name: 'JSAutoImports',
    grammars: ['source.js.jsx', 'source.js'],
    diagnostics: diagnosticsConfig,
    autocomplete: autocompleteConfig,
    codeAction: codeActionConfig,
    typeHint: {
      version: '0.0.0',
      priority: 0.1,
      analyticsEventName: 'jsimports.typeHint'
    }
  };
  return new (_nuclideLanguageService().AtomLanguageService)(connectToJSImportsService, atomConfig, onDidInsertSuggestion);
}

function onDidInsertSuggestion({
  suggestion
}) {
  const {
    description,
    displayText,
    extraData,
    remoteUri,
    replacementPrefix,
    snippet,
    text,
    type
  } = suggestion;
  (0, _nuclideAnalytics().track)('nuclide-js-imports:insert-suggestion', {
    suggestion: {
      description,
      displayText,
      extraData,
      remoteUri,
      replacementPrefix,
      snippet,
      text,
      type
    }
  });
}

async function getAutoImportSettings() {
  // Currently, we will get the settings when the package is initialized. This
  // means that the user would need to restart Nuclide for a change in their
  // settings to take effect. In the future, we would most likely want to observe
  // their settings and send DidChangeConfiguration requests to the server.
  // TODO: Observe settings changes + send to the server.
  return {
    componentModulePathFilter: _featureConfig().default.get('nuclide-js-imports-client.componentModulePathFilter'),
    diagnosticsWhitelist: _featureConfig().default.get('nuclide-js-imports-client.diagnosticsWhitelist'),
    requiresWhitelist: _featureConfig().default.get('nuclide-js-imports-client.requiresWhitelist'),
    uiComponentToolsIndexingGkEnabled: await (0, _passesGK().default)(_nuclideUiComponentToolsCommon().UI_COMPONENT_TOOLS_INDEXING_GK)
  };
}

class Activation {
  constructor() {
    this._languageService = createLanguageService();

    this._languageService.activate();

    this._quickOpenProvider = new (_QuickOpenProvider().default)(this._languageService);
    this._commandSubscription = new (_UniversalDisposable().default)();
  }

  provideProjectSymbolSearch() {
    return new (_DashProjectSymbolProvider().default)(this._languageService);
  }

  provideJSSymbolSearchService() {
    return new (_JSSymbolSearchProvider().default)(this._languageService);
  }

  dispose() {
    this._languageService.dispose();

    this._commandSubscription.dispose();
  }

  registerQuickOpenProvider() {
    return this._quickOpenProvider;
  }

  consumeOrganizeRequiresService(organizeRequires) {
    this._commandSubscription.add(atom.commands.add('atom-text-editor', 'nuclide-js-imports:auto-require', async () => {
      const editor = atom.workspace.getActiveTextEditor();

      if (editor == null) {
        return;
      }

      const fileVersion = await (0, _nuclideOpenFiles().getFileVersionOfEditor)(editor);

      if (fileVersion == null) {
        return;
      }

      const buffer = editor.getBuffer();
      const range = buffer.getRange();
      const languageService = await this._languageService.getLanguageServiceForUri(editor.getPath());

      if (languageService == null) {
        return;
      }

      const triggerOptions = {
        // secret code
        tabSize: _constantsForClient().TAB_SIZE_SIGNIFYING_FIX_ALL_IMPORTS_FORMATTING,
        // just for typechecking to pass
        insertSpaces: true
      };
      const result = await languageService.formatSource(fileVersion, range, triggerOptions);
      const beforeEditsCheckpoint = buffer.createCheckpoint(); // First add all new imports naively

      if (result != null) {
        if (!(0, _textEdit().applyTextEditsToBuffer)(buffer, result)) {
          // TODO(T24077432): Show the error to the user
          throw new Error('Could not apply edits to text buffer.');
        }
      } // Then use nuclide-format-js to properly format the imports


      const successfulEdits = (result || []).filter(edit => edit.newText !== '');
      organizeRequires({
        addedRequires: successfulEdits.length > 0,
        missingExports: successfulEdits.length !== (result || []).length
      });
      buffer.groupChangesSinceCheckpoint(beforeEditsCheckpoint);
    }));

    return this._commandSubscription;
  }

}

(0, _createPackage().default)(module.exports, Activation);