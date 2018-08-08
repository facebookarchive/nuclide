"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MultiProjectLanguageService = void 0;

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../../../modules/nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _nuclideOpenFilesRpc() {
  const data = require("../../nuclide-open-files-rpc");

  _nuclideOpenFilesRpc = function () {
    return data;
  };

  return data;
}

function _cache() {
  const data = require("../../../modules/nuclide-commons/cache");

  _cache = function () {
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

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _ConfigCache() {
  const data = require("../../../modules/nuclide-commons/ConfigCache");

  _ConfigCache = function () {
    return data;
  };

  return data;
}

function _ServerLanguageService() {
  const data = require("./ServerLanguageService");

  _ServerLanguageService = function () {
    return data;
  };

  return data;
}

function _NullLanguageService() {
  const data = require("./NullLanguageService");

  _NullLanguageService = function () {
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
class MultiProjectLanguageService {
  // Maps project dir => LanguageService
  // Promises for when AtomLanguageService has called into this feature
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
    this._resources = new (_UniversalDisposable().default)();
    this._configCache = new (_ConfigCache().ConfigCache)(projectFileNames, projectFileSearchStrategy != null ? projectFileSearchStrategy : undefined);
    this._processes = new (_cache().Cache)(languageServiceFactory, value => {
      value.then(process => {
        if (process != null) {
          process.dispose();
        }
      });
    });

    this._resources.add(host, this._processes); // Observe projects as they are opened


    const configObserver = new (_nuclideOpenFilesRpc().ConfigObserver)(fileCache, fileExtensions, filePath => this._configCache.getConfigDir(filePath));

    this._resources.add(configObserver, configObserver.observeConfigs().subscribe(configs => {
      this._ensureProcesses(configs);
    }));

    this._resources.add(() => {
      this._closeProcesses();
    }); // Remove fileCache when the remote connection shuts down


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
      return new (_NullLanguageService().NullLanguageService)();
    }
  }

  async _getLanguageServicesForFiles(filePaths) {
    const promises = filePaths.map(async filePath => {
      const service = await this._getLanguageServiceForFile(filePath);
      return service ? [service, filePath] : null;
    });
    const fileServices = await Promise.all(promises);
    const results = (0, _collection().collect)((0, _collection().arrayCompact)(fileServices));
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
  } // Ensures that the only attached LanguageServices are those
  // for the given configPaths.
  // Closes all LanguageServices not in configPaths, and starts
  // new LanguageServices for any paths in configPaths.


  _ensureProcesses(configPaths) {
    this._logger.info(`MultiProjectLanguageService ensureProcesses. ${Array.from(configPaths).join(', ')}`);

    this._processes.setKeys(configPaths);
  } // Closes all LanguageServices for this fileCache.


  _closeProcesses() {
    this._logger.info('Shutting down LanguageServices ' + `${Array.from(this._processes.keys()).join(',')}`);

    this._processes.clear();
  }

  observeLanguageServices() {
    this._logger.info('observing connections');

    return (0, _observable().compact)(this._processes.observeValues().switchMap(process => _RxMin.Observable.fromPromise(process)));
  }

  async getAllLanguageServices() {
    const lsPromises = [...this._processes.values()];
    return (0, _collection().arrayCompact)((await Promise.all(lsPromises)));
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

      return (0, _ServerLanguageService().ensureInvalidations)(this._logger, process.observeDiagnostics().refCount().catch(error => {
        this._logger.error('Error: observeDiagnostics', error);

        return _RxMin.Observable.empty();
      }));
    }).publish();
  }

  hasObservedStatus() {
    return this._observeStatusPromise;
  }

  observeStatus(fileVersion) {
    this._observeStatusPromiseResolver();

    return _RxMin.Observable.fromPromise(this._getLanguageServiceForFile(fileVersion.filePath)).flatMap(ls => ls.observeStatus(fileVersion).refCount()).publish();
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
    } // We're running this "locally" (from RPC point of view), so strip remote
    // URIs and just take the path.


    const languageService = await this._getLanguageServiceForFile(suggestion.remoteUri);
    return languageService.resolveAutocompleteSuggestion(suggestion);
  }

  async getDefinition(fileVersion, position) {
    return (await this._getLanguageServiceForFile(fileVersion.filePath)).getDefinition(fileVersion, position);
  }

  findReferences(fileVersion, position) {
    return _RxMin.Observable.fromPromise(this._getLanguageServiceForFile(fileVersion.filePath)).concatMap(ls => ls.findReferences(fileVersion, position).refCount()).publish();
  }

  rename(fileVersion, position, newName) {
    return _RxMin.Observable.fromPromise(this._getLanguageServiceForFile(fileVersion.filePath)).concatMap(ls => ls.rename(fileVersion, position, newName).refCount()).publish();
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
        const service = await (0, _promise().timeoutAfterDeadline)(deadline, this._processes.get(root));

        if (service == null) {
          return [{
            title: root,
            data: 'no language service'
          }];
        } else {
          return (0, _promise().timeoutAfterDeadline)(deadline, service.getAdditionalLogFiles(deadline - 1000));
        }
      } catch (e) {
        return [{
          title: root,
          data: (0, _string().stringifyError)(e)
        }];
      }
    }));
    return (0, _collection().arrayFlatten)(results);
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
    return (0, _collection().arrayFlatten)((0, _collection().arrayCompact)(results));
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

  onWillSave(fileVersion) {
    return _RxMin.Observable.fromPromise(this._getLanguageServiceForFile(fileVersion.filePath)).flatMap(languageService => languageService.onWillSave(fileVersion).refCount()).publish();
  }

  async sendLspRequest(filePath, method, params) {
    return (await this._getLanguageServiceForFile(filePath)).sendLspRequest(filePath, method, params);
  }

  async sendLspNotification(filePath, method, params) {
    return (await this._getLanguageServiceForFile(filePath)).sendLspNotification(filePath, method, params);
  }

  observeLspNotifications(notificationMethod) {
    return this.observeLanguageServices().mergeMap(process => process.observeLspNotifications(notificationMethod).refCount().catch(error => {
      this._logger.error('Error: observeLspNotifications', error);

      return _RxMin.Observable.empty();
    })).publish();
  }

  dispose() {
    this._resources.dispose();
  }

} // Enforces that an instance of MultiProjectLanguageService satisfies the LanguageService type


exports.MultiProjectLanguageService = MultiProjectLanguageService;
null;