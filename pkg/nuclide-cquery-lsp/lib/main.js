"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
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

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _libclang() {
  const data = require("../../nuclide-clang/lib/libclang");

  _libclang = function () {
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

function _convert() {
  const data = require("../../nuclide-vscode-language-service-rpc/lib/convert");

  _convert = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("./utils");

  _utils = function () {
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
// TODO pelmers: maybe don't import from libclang
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
const NUCLIDE_CQUERY_GK = 'nuclide_cquery_lsp'; // Must match string in nuclide-clang/lib/constants.js

const NUCLIDE_CLANG_PACKAGE_NAME = 'nuclide-clang';
const USE_CQUERY_CONFIG = 'nuclide-cquery-lsp.use-cquery';
const GRAMMARS = ['source.cpp', 'source.c', 'source.objc', 'source.objcpp'];

let _referencesViewService;

class CqueryNullLanguageService extends _nuclideLanguageServiceRpc().NullLanguageService {
  async restartProcessForFile(file) {}

}

async function requestLocations(service, method, path, point) {
  const hostname = _nuclideUri().default.getHostnameOpt(path);

  const response = await service.sendLspRequest(path, method, {
    textDocument: {
      uri: (0, _convert().localPath_lspUri)(_nuclideUri().default.getPath(path))
    },
    position: (0, _convert().atomPoint_lspPosition)(point)
  });
  return response == null ? [] : // $FlowIgnore: type matches Out_LocationList: https://git.io/fNcSI
  response.map(({
    uri,
    range
  }) => {
    const lspPath = (0, _convert().lspUri_localPath)(uri);
    return {
      uri: hostname == null ? lspPath : _nuclideUri().default.createRemoteUri(hostname, lspPath),
      range: (0, _convert().lspRange_atomRange)(range)
    };
  });
}

function addCommands(atomService) {
  const notificationCommands = [// This command just sends a notification to the server.
  atom.commands.add('atom-text-editor', 'cquery:freshen-index', async () => {
    const editor = atom.workspace.getActiveTextEditor();

    if (editor) {
      const path = editor.getPath();
      const service = await atomService.getLanguageServiceForUri(path);

      if (path != null && service != null) {
        // identical to vscode extension, https://git.io/vbUbQ
        await service.sendLspNotification(path, '$cquery/freshenIndex', {});
      }
    }
  }), // Equivalent to 'clang:clean-and-rebuild'
  atom.commands.add('atom-text-editor', 'cquery:clean-and-restart', async () => {
    const editor = atom.workspace.getActiveTextEditor();

    if (editor) {
      const path = editor.getPath();
      const service = await atomService.getLanguageServiceForUri(path);

      if (path != null && service != null) {
        await (0, _libclang().resetForSource)(editor);
        await service.restartProcessForFile(path);
      }
    }
  })]; // These commands all request locations in response to a position
  // which we can display in a find references pane.

  const requestCommands = [{
    command: 'cquery:find-variables',
    methodName: '$cquery/vars',
    title: 'Variables'
  }, {
    command: 'cquery:find-callers',
    methodName: '$cquery/callers',
    title: 'Callers'
  }, {
    command: 'cquery:find-base-class',
    methodName: '$cquery/base',
    title: 'Base classes'
  }, {
    command: 'cquery:find-derived-class',
    methodName: '$cquery/derived',
    title: 'Derived classes'
  }].map(({
    command,
    methodName,
    title
  }) => atom.commands.add('atom-text-editor', command, async () => {
    const editor = atom.workspace.getActiveTextEditor();

    if (editor) {
      const point = editor.getCursorBufferPosition();
      const path = editor.getPath();
      const name = (0, _utils().wordUnderPoint)(editor, point);
      const service = await atomService.getLanguageServiceForUri(path);

      if (service != null && path != null && name != null) {
        const locations = await requestLocations(service, methodName, path, point);

        if (_referencesViewService != null) {
          _referencesViewService.viewResults({
            type: 'data',
            baseUri: path,
            referencedSymbolName: name,
            title,
            references: locations.map(loc => Object.assign({}, loc, {
              name: ''
            }))
          });
        }
      }
    }
  }));
  return new (_UniversalDisposable().default)(...notificationCommands, ...requestCommands);
}

async function getConnection(connection) {
  const [fileNotifier, host] = await Promise.all([(0, _nuclideOpenFiles().getNotifierByConnection)(connection), (0, _nuclideLanguageService().getHostServices)()]);
  const {
    defaultFlags
  } = (0, _libclang().getServerSettings)();
  const cqueryService = await (0, _nuclideRemoteConnection().getCqueryLSPServiceByConnection)(connection).createCqueryService({
    fileNotifier,
    host,
    logCategory: 'cquery-language-server',
    logLevel: 'WARN',
    enableLibclangLogs: (0, _utils().enableLibclangLogsConfig)(),
    indexerThreads: (0, _utils().indexerThreadsConfig)(),
    memoryLimitPercent: (0, _utils().memoryLimitConfig)(),
    defaultFlags: defaultFlags != null ? defaultFlags : []
  });

  if (cqueryService == null && _featureConfig().default.get(USE_CQUERY_CONFIG)) {
    const notification = atom.notifications.addWarning('Could not enable cquery, would you like to switch to built-in C++ support?', {
      buttons: [{
        text: 'Use built-in C++ services',
        onDidClick: () => {
          _featureConfig().default.set(USE_CQUERY_CONFIG, false);

          notification.dismiss();
        }
      }, {
        text: 'Ignore',
        onDidClick: () => {
          notification.dismiss();
        }
      }]
    });
  }

  return cqueryService != null ? cqueryService : new CqueryNullLanguageService();
}

class Activation {
  constructor(state) {
    this._subscriptions = new (_UniversalDisposable().default)();
    this._lastGkResult = false;

    if (state != null) {
      this._lastGkResult = Boolean(state.savedGkResult);
    }

    this._subscriptions.add(_RxMin.Observable.fromPromise((0, _passesGK().default)(NUCLIDE_CQUERY_GK)).subscribe(result => {
      // Only update the config if the GK value changed, since someone may
      // not pass GK but still want to have the feature on.
      if (this._lastGkResult !== result) {
        this._lastGkResult = result;

        _featureConfig().default.set(USE_CQUERY_CONFIG, result);
      }
    }), _featureConfig().default.observeAsStream(USE_CQUERY_CONFIG).subscribe(config => {
      if (config === true) {
        if (this._languageService == null) {
          this._languageService = this.initializeLsp();
        }
      } else {
        if (this._languageService != null) {
          this._languageService.dispose();

          this._languageService = null;
        }
      }
    }));
  }

  serialize() {
    return {
      savedGkResult: this._lastGkResult
    };
  }

  consumeClangConfigurationProvider(provider) {
    return (0, _libclang().registerClangProvider)(provider);
  }

  consumeReferencesView(provider) {
    _referencesViewService = provider;
    return new (_UniversalDisposable().default)(() => {
      _referencesViewService = null;
    });
  }

  provideCodeFormat() {
    return {
      grammarScopes: GRAMMARS,
      priority: 1,
      formatEntireFile: _libclang().formatCode
    };
  }

  initializeLsp() {
    // First disable the built-in clang package if it's running.
    const disableNuclideClang = () => {
      if (atom.packages.isPackageActive(NUCLIDE_CLANG_PACKAGE_NAME)) {
        const pack = atom.packages.disablePackage(NUCLIDE_CLANG_PACKAGE_NAME);
        atom.packages.deactivatePackage(NUCLIDE_CLANG_PACKAGE_NAME).then(() => {
          if (pack != null) {
            // $FlowFixMe: fix failure to re-enable, at see atom/issues #16824
            pack.activationDisposables = null;
          }
        });
      }
    };

    disableNuclideClang();
    const atomConfig = {
      name: 'cquery',
      grammars: GRAMMARS,
      autocomplete: {
        inclusionPriority: 1,
        suggestionPriority: 3,
        disableForSelector: null,
        excludeLowerPriority: false,
        autocompleteCacherConfig: {
          updateResults: _nuclideLanguageService().updateAutocompleteResults,
          updateFirstResults: _nuclideLanguageService().updateAutocompleteFirstResults
        },
        analytics: {
          eventName: 'nuclide-cquery-lsp',
          shouldLogInsertedSuggestion: false
        },
        supportsResolve: false
      },
      definition: {
        version: '0.1.0',
        priority: 1,
        definitionEventName: 'cquery.getDefinition'
      },
      diagnostics: {
        version: '0.2.0',
        analyticsEventName: 'cquery.observe-diagnostics'
      },
      codeAction: {
        version: '0.1.0',
        priority: 1,
        analyticsEventName: 'cquery.getActions',
        applyAnalyticsEventName: 'cquery.applyAction'
      },
      outline: {
        version: '0.1.0',
        analyticsEventName: 'cquery.outline',
        updateOnEdit: true,
        priority: 1
      },
      typeHint: {
        version: '0.0.0',
        priority: 1,
        analyticsEventName: 'cquery.typeHint'
      },
      findReferences: {
        version: '0.1.0',
        analyticsEventName: 'cquery.findReferences'
      },
      signatureHelp: {
        version: '0.1.0',
        priority: 1,
        triggerCharacters: new Set(['(', ',']),
        analyticsEventName: 'cquery.signatureHelp'
      },
      status: {
        version: '0.1.0',
        priority: 1,
        observeEventName: 'cquery.statusObserve',
        clickEventName: 'cquery.statusClick',
        description: 'cquery provides autocomplete, hover, hyperclick, find-references for C++.',
        iconMarkdown: 'cquery'
      }
    };
    const languageService = new (_nuclideLanguageService().AtomLanguageService)(getConnection, atomConfig, null, (0, _log4js().getLogger)('cquery-language-server'));
    languageService.activate();
    return new (_UniversalDisposable().default)(languageService, addCommands(languageService), atom.packages.onDidActivatePackage(disableNuclideClang), () => atom.packages.activatePackage(NUCLIDE_CLANG_PACKAGE_NAME));
  }

  dispose() {
    this._subscriptions.dispose();

    if (this._languageService != null) {
      this._languageService.dispose();
    }
  }

}

(0, _createPackage().default)(module.exports, Activation);