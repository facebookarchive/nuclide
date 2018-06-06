'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _libclang;

function _load_libclang() {
  return _libclang = require('../../nuclide-clang/lib/libclang');
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
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

var _CqueryProject;

function _load_CqueryProject() {
  return _CqueryProject = require('./CqueryProject');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO pelmers: maybe don't import from libclang
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
const NUCLIDE_CQUERY_GK = 'nuclide_cquery_lsp';
// Must match string in nuclide-clang/lib/constants.js
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

const NUCLIDE_CLANG_PACKAGE_NAME = 'nuclide-clang';
const USE_CQUERY_CONFIG = 'nuclide-cquery-lsp.use-cquery';
const GRAMMARS = ['source.cpp', 'source.c', 'source.objc', 'source.objcpp'];
let _referencesViewService;

// Wrapper that queries for clang settings when new files seen.
class CqueryLSPClient extends (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).NullLanguageService {

  constructor(service) {
    super();
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._service = service;
    this._logger = (0, (_log4js || _load_log4js()).getLogger)('cquery-language-server');
    this._subscriptions.add(service, this._addCommands());
  }

  dispose() {
    this._subscriptions.dispose();
  }

  _addCommands() {
    // This command just sends a notification to the server.
    const notificationCommands = [atom.commands.add('atom-text-editor', 'cquery:freshen-index', () => {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor) {
        const path = editor.getPath();
        if (this._service && path != null) {
          this._service.freshenIndexForFile(path);
        }
      }
    }),
    // Equivalent to 'clang:clean-and-rebuild'
    atom.commands.add('atom-text-editor', 'cquery:clean-and-restart', async () => {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor) {
        const path = editor.getPath();
        if (this._service && path != null) {
          const project = await (0, (_CqueryProject || _load_CqueryProject()).determineCqueryProject)(path);
          await (0, (_libclang || _load_libclang()).resetForSource)(editor);
          await this._service.deleteProject(project);
        }
      }
    })];
    // These commands all request locations in response to a position
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
    }].map(({ command, methodName, title }) => atom.commands.add('atom-text-editor', command, () => {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor) {
        const point = editor.getCursorBufferPosition();
        const path = editor.getPath();
        const name = (0, (_utils || _load_utils()).wordUnderPoint)(editor, point);
        if (this._service && path != null && name != null) {
          this._service.requestLocationsCommand(methodName, path, point).then(locations => {
            if (_referencesViewService != null) {
              _referencesViewService.viewResults({
                type: 'data',
                baseUri: path,
                referencedSymbolName: name,
                title,
                references: locations.map(loc => Object.assign({}, loc, { name: '' }))
              });
            }
          });
        }
      }
    }));
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(...notificationCommands, ...requestCommands);
  }

  async ensureProject(file) {
    const project = await (0, (_CqueryProject || _load_CqueryProject()).determineCqueryProject)(file);
    return this._service.associateFileWithProject(file, project).then(() => project, () => null);
  }

  async getDiagnostics(fileVersion) {
    const project = await this.ensureProject(fileVersion.filePath);
    return project == null ? null : this._service.getDiagnostics(fileVersion);
  }

  async getAutocompleteSuggestions(fileVersion, position, request) {
    const project = await this.ensureProject(fileVersion.filePath);
    return project == null ? null : this._service.getAutocompleteSuggestions(fileVersion, position, request);
  }

  resolveAutocompleteSuggestion(suggestion) {
    return Promise.resolve(null);
  }

  async getAdditionalLogFiles(deadline) {
    return this._service.getAdditionalLogFiles(deadline);
  }

  async getDefinition(fileVersion, position) {
    const project = await this.ensureProject(fileVersion.filePath);
    return project == null ? null : this._service.getDefinition(fileVersion, position);
  }

  findReferences(fileVersion, position) {
    return _rxjsBundlesRxMinJs.Observable.fromPromise(this.ensureProject(fileVersion.filePath)).concatMap(project => {
      return project == null ? _rxjsBundlesRxMinJs.Observable.of(null) : this._service.findReferences(fileVersion, position).refCount();
    }).publish();
  }

  async getCoverage(filePath) {
    const project = await this.ensureProject(filePath);
    return project == null ? null : this._service.getCoverage(filePath);
  }

  async getOutline(fileVersion) {
    const project = await this.ensureProject(fileVersion.filePath);
    return project == null ? null : this._service.getOutline(fileVersion);
  }

  async getCodeLens(fileVersion) {
    const project = await this.ensureProject(fileVersion.filePath);
    return project == null ? null : this._service.getCodeLens(fileVersion);
  }

  async resolveCodeLens(filePath, codeLens) {
    return null;
  }

  async getCodeActions(fileVersion, range, diagnostics) {
    const project = await this.ensureProject(fileVersion.filePath);
    return project == null ? [] : this._service.getCodeActions(fileVersion, range, diagnostics);
  }

  async highlight(fileVersion, position) {
    const project = await this.ensureProject(fileVersion.filePath);
    return project == null ? null : this._service.highlight(fileVersion, position);
  }

  async getProjectRoot(filePath) {
    const project = await this.ensureProject(filePath);
    return project == null ? null : this._service.getProjectRoot(filePath);
  }

  async isFileInProject(filePath) {
    const project = await this.ensureProject(filePath);
    return project != null;
  }

  observeDiagnostics() {
    return this._service.observeDiagnostics();
  }

  async typeHint(fileVersion, position) {
    const project = await this.ensureProject(fileVersion.filePath);
    return project == null ? null : this._service.typeHint(fileVersion, position);
  }

  async signatureHelp(fileVersion, position) {
    const project = await this.ensureProject(fileVersion.filePath);
    return project == null ? null : this._service.signatureHelp(fileVersion, position);
  }

  async supportsSymbolSearch(directories) {
    // TODO pelmers: wrap with ensure server
    return this._service.supportsSymbolSearch(directories);
  }

  async symbolSearch(query, directories) {
    return this._service.symbolSearch(query, directories);
  }
}

async function getConnection(connection) {
  const [fileNotifier, host] = await Promise.all([(0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection), (0, (_nuclideLanguageService || _load_nuclideLanguageService()).getHostServices)()]);
  const cqueryService = await (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getCqueryLSPServiceByConnection)(connection).createCqueryService({
    fileNotifier,
    host,
    logCategory: 'cquery-language-server',
    logLevel: 'WARN',
    enableLibclangLogs: (_featureConfig || _load_featureConfig()).default.get('nuclide-cquery-lsp.enable-libclang-logs') === true
  });
  if (cqueryService == null && (_featureConfig || _load_featureConfig()).default.get(USE_CQUERY_CONFIG)) {
    const notification = atom.notifications.addWarning('Could not enable cquery, would you like to switch to built-in C++ support?', {
      buttons: [{
        text: 'Use built-in C++ services',
        onDidClick: () => {
          (_featureConfig || _load_featureConfig()).default.set(USE_CQUERY_CONFIG, false);
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
  return cqueryService != null ? new CqueryLSPClient(cqueryService) : new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).NullLanguageService();
}

class Activation {

  constructor(state) {
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._lastGkResult = false;

    if (state != null) {
      this._lastGkResult = Boolean(state.savedGkResult);
    }
    this._subscriptions.add(_rxjsBundlesRxMinJs.Observable.fromPromise((0, (_passesGK || _load_passesGK()).default)(NUCLIDE_CQUERY_GK)).subscribe(result => {
      // Only update the config if the GK value changed, since someone may
      // not pass GK but still want to have the feature on.
      if (this._lastGkResult !== result) {
        this._lastGkResult = result;
        (_featureConfig || _load_featureConfig()).default.set(USE_CQUERY_CONFIG, result);
      }
    }), (_featureConfig || _load_featureConfig()).default.observeAsStream(USE_CQUERY_CONFIG).subscribe(config => {
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
    return { savedGkResult: this._lastGkResult };
  }

  consumeClangConfigurationProvider(provider) {
    return (0, (_libclang || _load_libclang()).registerClangProvider)(provider);
  }

  consumeReferencesView(provider) {
    _referencesViewService = provider;
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      _referencesViewService = null;
    });
  }

  provideCodeFormat() {
    return {
      grammarScopes: GRAMMARS,
      priority: 1,
      formatEntireFile: (_libclang || _load_libclang()).formatCode
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
          updateResults: (_nuclideLanguageService || _load_nuclideLanguageService()).updateAutocompleteResults,
          updateFirstResults: (_nuclideLanguageService || _load_nuclideLanguageService()).updateAutocompleteFirstResults
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
      }
    };

    const languageService = new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(getConnection, atomConfig, null, (0, (_log4js || _load_log4js()).getLogger)('cquery-language-server'));
    languageService.activate();
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(languageService, atom.packages.onDidActivatePackage(disableNuclideClang), () => atom.packages.activatePackage(NUCLIDE_CLANG_PACKAGE_NAME));
  }

  dispose() {
    this._subscriptions.dispose();
    if (this._languageService != null) {
      this._languageService.dispose();
    }
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);