'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _textEdit;

function _load_textEdit() {
  return _textEdit = require('../../../modules/nuclide-commons-atom/text-edit');
}

var _constantsForClient;

function _load_constantsForClient() {
  return _constantsForClient = require('../../nuclide-js-imports-server/src/utils/constantsForClient');
}

var _nuclideLanguageService;

function _load_nuclideLanguageService() {
  return _nuclideLanguageService = require('../../nuclide-language-service');
}

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _QuickOpenProvider;

function _load_QuickOpenProvider() {
  return _QuickOpenProvider = _interopRequireDefault(require('./QuickOpenProvider'));
}

var _JSSymbolSearchProvider;

function _load_JSSymbolSearchProvider() {
  return _JSSymbolSearchProvider = _interopRequireDefault(require('./JSSymbolSearchProvider'));
}

var _DashProjectSymbolProvider;

function _load_DashProjectSymbolProvider() {
  return _DashProjectSymbolProvider = _interopRequireDefault(require('./DashProjectSymbolProvider'));
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
  const [fileNotifier, host] = await Promise.all([(0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection), (0, (_nuclideLanguageService || _load_nuclideLanguageService()).getHostServices)()]);

  const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getVSCodeLanguageServiceByConnection)(connection);
  const lspService = await service.createMultiLspLanguageService('jsimports', './pkg/nuclide-js-imports-server/src/index-entry.js', [], {
    fileNotifier,
    host,
    logCategory: 'jsimports',
    logLevel: (_featureConfig || _load_featureConfig()).default.get('nuclide-js-imports-client.logLevel'),
    projectFileNames: ['.flowconfig'],
    fileExtensions: ['.js', '.jsx'],
    initializationOptions: getAutoImportSettings(),
    fork: true
  });
  return lspService || new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).NullLanguageService();
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
      shouldLogInsertedSuggestion: false
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
    codeAction: codeActionConfig
  };
  return new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(connectToJSImportsService, atomConfig);
}

function getAutoImportSettings() {
  // Currently, we will get the settings when the package is initialized. This
  // means that the user would need to restart Nuclide for a change in their
  // settings to take effect. In the future, we would most likely want to observe
  // their settings and send DidChangeConfiguration requests to the server.
  // TODO: Observe settings changes + send to the server.
  return {
    diagnosticsWhitelist: (_featureConfig || _load_featureConfig()).default.get('nuclide-js-imports-client.diagnosticsWhitelist'),
    requiresWhitelist: (_featureConfig || _load_featureConfig()).default.get('nuclide-js-imports-client.requiresWhitelist')
  };
}

class Activation {

  constructor() {
    this._languageService = createLanguageService();
    this._languageService.activate();
    this._quickOpenProvider = new (_QuickOpenProvider || _load_QuickOpenProvider()).default(this._languageService);
    this._commandSubscription = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  provideProjectSymbolSearch() {
    return new (_DashProjectSymbolProvider || _load_DashProjectSymbolProvider()).default(this._languageService);
  }

  provideJSSymbolSearchService() {
    return new (_JSSymbolSearchProvider || _load_JSSymbolSearchProvider()).default(this._languageService);
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
      const fileVersion = await (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getFileVersionOfEditor)(editor);
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
        tabSize: (_constantsForClient || _load_constantsForClient()).TAB_SIZE_SIGNIFYING_FIX_ALL_IMPORTS_FORMATTING,
        // just for typechecking to pass
        insertSpaces: true
      };
      const result = await languageService.formatSource(fileVersion, range, triggerOptions);
      const beforeEditsCheckpoint = buffer.createCheckpoint();
      // First add all new imports naively
      if (result != null) {
        if (!(0, (_textEdit || _load_textEdit()).applyTextEditsToBuffer)(buffer, result)) {
          // TODO(T24077432): Show the error to the user
          throw new Error('Could not apply edits to text buffer.');
        }
      }
      // Then use nuclide-format-js to properly format the imports
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

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);