'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MultiProjectLanguageService = undefined;

var _promise;

function _load_promise() {
  return _promise = require('../../../modules/nuclide-commons/promise');
}

var _string;

function _load_string() {
  return _string = require('../../../modules/nuclide-commons/string');
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _cache;

function _load_cache() {
  return _cache = require('../../../modules/nuclide-commons/cache');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _observable;

function _load_observable() {
  return _observable = require('../../../modules/nuclide-commons/observable');
}

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _ConfigCache;

function _load_ConfigCache() {
  return _ConfigCache = require('../../../modules/nuclide-commons/ConfigCache');
}

var _;

function _load_() {
  return _ = require('..');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MultiProjectLanguageService {
  // Promises for when AtomLanguageService has called into this feature

  // Maps project dir => LanguageService
  constructor() {
    this._observeDiagnosticsPromise = new Promise((resolve, reject) => {
      this._observeDiagnosticsPromiseResolver = resolve;
    });
    this._observeStatusPromise = new Promise((resolve, reject) => {
      this._observeStatusPromiseResolver = resolve;
    });
  }

  initialize(logger, fileCache, host, projectFileNames, projectFileSearchStrategy, fileExtensions, languageServiceFactory) {
    this._logger = logger;
    this._resources = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._configCache = new (_ConfigCache || _load_ConfigCache()).ConfigCache(projectFileNames, projectFileSearchStrategy != null ? projectFileSearchStrategy : undefined);

    this._processes = new (_cache || _load_cache()).Cache(languageServiceFactory, value => {
      value.then(process => {
        if (process != null) {
          process.dispose();
        }
      });
    });

    this._resources.add(host, this._processes);

    // Observe projects as they are opened
    const configObserver = new (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).ConfigObserver(fileCache, fileExtensions, filePath => this._configCache.getConfigDir(filePath));
    this._resources.add(configObserver, configObserver.observeConfigs().subscribe(configs => {
      this._ensureProcesses(configs);
    }));
    this._resources.add(() => {
      this._closeProcesses();
    });

    // Remove fileCache when the remote connection shuts down
    this._resources.add(fileCache.observeFileEvents().ignoreElements().subscribe(undefined, // next
    undefined, // error
    () => {
      this._logger.info('fileCache shutting down.');
      this._closeProcesses();
    }));
  }

  findProjectDir(filePath) {
    return this._configCache.getConfigDir(filePath);
  }

  async _getLanguageServiceForFile(filePath) {
    const service = await this.getLanguageServiceForFile(filePath);
    if (service != null) {
      return service;
    } else {
      return new (_ || _load_()).NullLanguageService();
    }
  }

  async _getLanguageServicesForFiles(filePaths) {
    const promises = filePaths.map(async filePath => {
      const service = await this._getLanguageServiceForFile(filePath);
      return service ? [service, filePath] : null;
    });

    const fileServices = await Promise.all(promises);

    const results = (0, (_collection || _load_collection()).collect)((0, (_collection || _load_collection()).arrayCompact)(fileServices));

    return Array.from(results);
  }

  async getLanguageServiceForFile(filePath) {
    const projectDir = await this.findProjectDir(filePath);
    if (projectDir == null) {
      return null;
    }

    const process = this._processes.get(projectDir);
    process.then(result => {
      // If we fail to connect, then retry on next request.
      if (result == null) {
        this._processes.delete(projectDir);
      }
    });
    return process;
  }

  // Ensures that the only attached LanguageServices are those
  // for the given configPaths.
  // Closes all LanguageServices not in configPaths, and starts
  // new LanguageServices for any paths in configPaths.
  _ensureProcesses(configPaths) {
    this._logger.info(`MultiProjectLanguageService ensureProcesses. ${Array.from(configPaths).join(', ')}`);
    this._processes.setKeys(configPaths);
  }

  // Closes all LanguageServices for this fileCache.
  _closeProcesses() {
    this._logger.info('Shutting down LanguageServices ' + `${Array.from(this._processes.keys()).join(',')}`);
    this._processes.clear();
  }

  observeLanguageServices() {
    this._logger.info('observing connections');
    return (0, (_observable || _load_observable()).compact)(this._processes.observeValues().switchMap(process => _rxjsBundlesRxMinJs.Observable.fromPromise(process)));
  }

  async getAllLanguageServices() {
    const lsPromises = [...this._processes.values()];
    return (0, (_collection || _load_collection()).arrayCompact)((await Promise.all(lsPromises)));
  }

  async getDiagnostics(fileVersion) {
    return (await this._getLanguageServiceForFile(fileVersion.filePath)).getDiagnostics(fileVersion);
  }

  hasObservedDiagnostics() {
    return this._observeDiagnosticsPromise;
  }

  observeDiagnostics() {
    this._observeDiagnosticsPromiseResolver();

    return this.observeLanguageServices().mergeMap(process => {
      this._logger.trace('observeDiagnostics');
      return (0, (_ || _load_()).ensureInvalidations)(this._logger, process.observeDiagnostics().refCount().catch(error => {
        this._logger.error('Error: observeDiagnostics', error);
        return _rxjsBundlesRxMinJs.Observable.empty();
      }));
    }).publish();
  }

  hasObservedStatus() {
    return this._observeStatusPromise;
  }

  observeStatus(fileVersion) {
    this._observeStatusPromiseResolver();
    return _rxjsBundlesRxMinJs.Observable.fromPromise(this._getLanguageServiceForFile(fileVersion.filePath)).flatMap(ls => ls.observeStatus(fileVersion).refCount()).publish();
  }

  async clickStatus(fileVersion, id, button) {
    return (await this._getLanguageServiceForFile(fileVersion.filePath)).clickStatus(fileVersion, id, button);
  }

  async getAutocompleteSuggestions(fileVersion, position, request) {
    return (await this._getLanguageServiceForFile(fileVersion.filePath)).getAutocompleteSuggestions(fileVersion, position, request);
  }

  async resolveAutocompleteSuggestion(suggestion) {
    if (!(suggestion.remoteUri != null)) {
      throw new Error('remoteUri for autocomplete resolution should have been set by AutocompleteProvider.');
    }

    // We're running this "locally" (from RPC point of view), so strip remote
    // URIs and just take the path.


    const languageService = await this._getLanguageServiceForFile(suggestion.remoteUri);
    return languageService.resolveAutocompleteSuggestion(suggestion);
  }

  async getDefinition(fileVersion, position) {
    return (await this._getLanguageServiceForFile(fileVersion.filePath)).getDefinition(fileVersion, position);
  }

  findReferences(fileVersion, position) {
    return _rxjsBundlesRxMinJs.Observable.fromPromise(this._getLanguageServiceForFile(fileVersion.filePath)).concatMap(ls => ls.findReferences(fileVersion, position).refCount()).publish();
  }

  async rename(fileVersion, position, newName) {
    return (await this._getLanguageServiceForFile(fileVersion.filePath)).rename(fileVersion, position, newName);
  }

  async getCoverage(filePath) {
    return (await this._getLanguageServiceForFile(filePath)).getCoverage(filePath);
  }

  async onToggleCoverage(set) {
    await Promise.all((await this.getAllLanguageServices()).map(async languageService => {
      const ls = await languageService;
      ls.onToggleCoverage(set);
    }));
  }

  async getOutline(fileVersion) {
    return (await this._getLanguageServiceForFile(fileVersion.filePath)).getOutline(fileVersion);
  }

  async getCodeLens(fileVersion) {
    return (await this._getLanguageServiceForFile(fileVersion.filePath)).getCodeLens(fileVersion);
  }

  async resolveCodeLens(filePath, codeLens) {
    return (await this._getLanguageServiceForFile(filePath)).resolveCodeLens(filePath, codeLens);
  }

  async getAdditionalLogFiles(deadline) {
    const roots = Array.from(this._processes.keys());

    const results = await Promise.all(roots.map(async root => {
      try {
        const service = await (0, (_promise || _load_promise()).timeoutAfterDeadline)(deadline, this._processes.get(root));
        if (service == null) {
          return [{ title: root, data: 'no language service' }];
        } else {
          return (0, (_promise || _load_promise()).timeoutAfterDeadline)(deadline, service.getAdditionalLogFiles(deadline - 1000));
        }
      } catch (e) {
        return [{ title: root, data: (0, (_string || _load_string()).stringifyError)(e) }];
      }
    }));
    return (0, (_collection || _load_collection()).arrayFlatten)(results);
  }

  async getCodeActions(fileVersion, range, diagnostics) {
    return (await this._getLanguageServiceForFile(fileVersion.filePath)).getCodeActions(fileVersion, range, diagnostics);
  }

  async typeHint(fileVersion, position) {
    return (await this._getLanguageServiceForFile(fileVersion.filePath)).typeHint(fileVersion, position);
  }

  async highlight(fileVersion, position) {
    return (await this._getLanguageServiceForFile(fileVersion.filePath)).highlight(fileVersion, position);
  }

  async formatSource(fileVersion, range, options) {
    return (await this._getLanguageServiceForFile(fileVersion.filePath)).formatSource(fileVersion, range, options);
  }

  async formatEntireFile(fileVersion, range, options) {
    return (await this._getLanguageServiceForFile(fileVersion.filePath)).formatEntireFile(fileVersion, range, options);
  }

  async formatAtPosition(fileVersion, position, triggerCharacter, options) {
    return (await this._getLanguageServiceForFile(fileVersion.filePath)).formatAtPosition(fileVersion, position, triggerCharacter, options);
  }

  async signatureHelp(fileVersion, position) {
    return (await this._getLanguageServiceForFile(fileVersion.filePath)).signatureHelp(fileVersion, position);
  }

  async supportsSymbolSearch(directories) {
    const serviceDirectories = await this._getLanguageServicesForFiles(directories);
    const eligibilities = await Promise.all(serviceDirectories.map(([service, dirs]) => service.supportsSymbolSearch(dirs)));
    return eligibilities.some(e => e);
  }

  async symbolSearch(query, directories) {
    if (query.length === 0) {
      return [];
    }
    const serviceDirectories = await this._getLanguageServicesForFiles(directories);
    const results = await Promise.all(serviceDirectories.map(([service, dirs]) => service.symbolSearch(query, dirs)));
    return (0, (_collection || _load_collection()).arrayFlatten)((0, (_collection || _load_collection()).arrayCompact)(results));
  }

  async getProjectRoot(filePath) {
    return (await this._getLanguageServiceForFile(filePath)).getProjectRoot(filePath);
  }

  async isFileInProject(filePath) {
    return (await this._getLanguageServiceForFile(filePath)).isFileInProject(filePath);
  }

  async getExpandedSelectionRange(fileVersion, currentSelection) {
    return (await this._getLanguageServiceForFile(fileVersion.filePath)).getExpandedSelectionRange(fileVersion, currentSelection);
  }

  async getCollapsedSelectionRange(fileVersion, currentSelection, originalCursorPosition) {
    return (await this._getLanguageServiceForFile(fileVersion.filePath)).getCollapsedSelectionRange(fileVersion, currentSelection, originalCursorPosition);
  }

  dispose() {
    this._resources.dispose();
  }
}

exports.MultiProjectLanguageService = MultiProjectLanguageService; // Enforces that an instance of MultiProjectLanguageService satisfies the LanguageService type
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

null;