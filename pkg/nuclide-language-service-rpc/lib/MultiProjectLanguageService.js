'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MultiProjectLanguageService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _cache;

function _load_cache() {
  return _cache = require('nuclide-commons/cache');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _ConfigCache;

function _load_ConfigCache() {
  return _ConfigCache = require('nuclide-commons/ConfigCache');
}

var _;

function _load_() {
  return _ = require('..');
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
  // A promise for when AtomLanguageService has called into this feature

  // Maps project dir => LanguageService
  constructor() {
    this._observeDiagnosticsPromise = new Promise((resolve, reject) => {
      this._observeDiagnosticsPromiseResolver = resolve;
    });
  }

  initialize(logger, fileCache, host, projectFileNames, fileExtensions, languageServiceFactory) {
    this._logger = logger;
    this._resources = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._configCache = new (_ConfigCache || _load_ConfigCache()).ConfigCache(projectFileNames);

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

  _getLanguageServiceForFile(filePath) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const service = yield _this.getLanguageServiceForFile(filePath);
      if (service != null) {
        return service;
      } else {
        return new (_ || _load_()).NullLanguageService();
      }
    })();
  }

  _getLanguageServicesForFiles(filePaths) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const promises = filePaths.map((() => {
        var _ref = (0, _asyncToGenerator.default)(function* (filePath) {
          const service = yield _this2._getLanguageServiceForFile(filePath);
          return service ? [service, filePath] : null;
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      })());

      const fileServices = yield Promise.all(promises);

      const results = (0, (_collection || _load_collection()).collect)((0, (_collection || _load_collection()).arrayCompact)(fileServices));

      return Array.from(results);
    })();
  }

  getLanguageServiceForFile(filePath) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const projectDir = yield _this3.findProjectDir(filePath);
      if (projectDir == null) {
        return null;
      }

      const process = _this3._processes.get(projectDir);
      process.then(function (result) {
        // If we fail to connect, then retry on next request.
        if (result == null) {
          _this3._processes.delete(projectDir);
        }
      });
      return process;
    })();
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

  getAllLanguageServices() {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const lsPromises = [..._this4._processes.values()];
      return (0, (_collection || _load_collection()).arrayCompact)((yield Promise.all(lsPromises)));
    })();
  }

  getDiagnostics(fileVersion) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this5._getLanguageServiceForFile(fileVersion.filePath)).getDiagnostics(fileVersion);
    })();
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

  getAutocompleteSuggestions(fileVersion, position, request) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this6._getLanguageServiceForFile(fileVersion.filePath)).getAutocompleteSuggestions(fileVersion, position, request);
    })();
  }

  getDefinition(fileVersion, position) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this7._getLanguageServiceForFile(fileVersion.filePath)).getDefinition(fileVersion, position);
    })();
  }

  findReferences(fileVersion, position) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this8._getLanguageServiceForFile(fileVersion.filePath)).findReferences(fileVersion, position);
    })();
  }

  getCoverage(filePath) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this9._getLanguageServiceForFile(filePath)).getCoverage(filePath);
    })();
  }

  getOutline(fileVersion) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this10._getLanguageServiceForFile(fileVersion.filePath)).getOutline(fileVersion);
    })();
  }

  getCodeActions(fileVersion, range, diagnostics) {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this11._getLanguageServiceForFile(fileVersion.filePath)).getCodeActions(fileVersion, range, diagnostics);
    })();
  }

  typeHint(fileVersion, position) {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this12._getLanguageServiceForFile(fileVersion.filePath)).typeHint(fileVersion, position);
    })();
  }

  highlight(fileVersion, position) {
    var _this13 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this13._getLanguageServiceForFile(fileVersion.filePath)).highlight(fileVersion, position);
    })();
  }

  formatSource(fileVersion, range, options) {
    var _this14 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this14._getLanguageServiceForFile(fileVersion.filePath)).formatSource(fileVersion, range, options);
    })();
  }

  formatEntireFile(fileVersion, range, options) {
    var _this15 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this15._getLanguageServiceForFile(fileVersion.filePath)).formatEntireFile(fileVersion, range, options);
    })();
  }

  formatAtPosition(fileVersion, position, triggerCharacter, options) {
    var _this16 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this16._getLanguageServiceForFile(fileVersion.filePath)).formatAtPosition(fileVersion, position, triggerCharacter, options);
    })();
  }

  getEvaluationExpression(fileVersion, position) {
    var _this17 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this17._getLanguageServiceForFile(fileVersion.filePath)).getEvaluationExpression(fileVersion, position);
    })();
  }

  supportsSymbolSearch(directories) {
    var _this18 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const serviceDirectories = yield _this18._getLanguageServicesForFiles(directories);
      const eligibilities = yield Promise.all(serviceDirectories.map(function ([service, dirs]) {
        return service.supportsSymbolSearch(dirs);
      }));
      return eligibilities.some(function (e) {
        return e;
      });
    })();
  }

  symbolSearch(query, directories) {
    var _this19 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (query.length === 0) {
        return [];
      }
      const serviceDirectories = yield _this19._getLanguageServicesForFiles(directories);
      const results = yield Promise.all(serviceDirectories.map(function ([service, dirs]) {
        return service.symbolSearch(query, dirs);
      }));
      return (0, (_collection || _load_collection()).arrayFlatten)((0, (_collection || _load_collection()).arrayCompact)(results));
    })();
  }

  getProjectRoot(filePath) {
    var _this20 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this20._getLanguageServiceForFile(filePath)).getProjectRoot(filePath);
    })();
  }

  isFileInProject(filePath) {
    var _this21 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (yield _this21._getLanguageServiceForFile(filePath)).isFileInProject(filePath);
    })();
  }

  dispose() {
    this._resources.dispose();
  }
}

exports.MultiProjectLanguageService = MultiProjectLanguageService; // Enforces that an instance of MultiProjectLanguageService satisfies the LanguageService type

null;