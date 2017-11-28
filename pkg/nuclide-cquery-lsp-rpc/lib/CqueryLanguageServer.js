'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.COMPILATION_DATABASE_FILE = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _cache;

function _load_cache() {
  return _cache = require('nuclide-commons/cache');
}

var _CqueryInitialization;

function _load_CqueryInitialization() {
  return _CqueryInitialization = require('./CqueryInitialization');
}

var _CqueryInvalidator;

function _load_CqueryInvalidator() {
  return _CqueryInvalidator = require('./CqueryInvalidator');
}

var _CqueryLanguageClient;

function _load_CqueryLanguageClient() {
  return _CqueryLanguageClient = require('./CqueryLanguageClient');
}

var _CqueryProjectManager;

function _load_CqueryProjectManager() {
  return _CqueryProjectManager = require('./CqueryProjectManager');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const COMPILATION_DATABASE_FILE = exports.COMPILATION_DATABASE_FILE = 'compile_commands.json'; /**
                                                                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                * All rights reserved.
                                                                                                *
                                                                                                * This source code is licensed under the license found in the LICENSE file in
                                                                                                * the root directory of this source tree.
                                                                                                *
                                                                                                * 
                                                                                                * @format
                                                                                                */

class CqueryLanguageServer extends (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).MultiProjectLanguageService {
  // Maps clang settings => settings metadata with same key as _processes field.
  constructor(languageId, command, logger, fileCache, host) {
    super();

    this._projectManager = new (_CqueryProjectManager || _load_CqueryProjectManager()).CqueryProjectManager();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._fileCache = fileCache;
    this._command = command;
    this._host = host;
    this._languageId = languageId;
    this._logger = logger;

    this._processes = new (_cache || _load_cache()).Cache(projectKey => this._createCqueryLanguageClient(projectKey), value => {
      value.then(service => {
        if (service != null) {
          service.dispose();
        }
      });
    });

    this._registerDisposables();
  }

  _registerDisposables() {
    this._disposables.add(this._host, this._processes, new (_CqueryInvalidator || _load_CqueryInvalidator()).CqueryInvalidator(this._fileCache, this._projectManager, this._logger, this._processes).subscribe(), () => this._closeProcesses());
  }

  dispose() {
    this._disposables.dispose();
    super.dispose();
  }

  _createCqueryLanguageClient(projectKey) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = yield _this._projectManager.getProjectFromKey(projectKey);
      // TODO(wallace): handle the case when there is no compilation db
      if (project == null || !project.hasCompilationDb) {
        return null;
      }
      const { projectRoot, compilationDbDir } = project;
      yield _this.hasObservedDiagnostics();

      const lsp = new (_CqueryLanguageClient || _load_CqueryLanguageClient()).CqueryLanguageClient(_this._logger, _this._fileCache, (yield (0, (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).forkHostServices)(_this._host, _this._logger)), _this._languageId, _this._command, ['--language-server'], // args
      {}, // spawnOptions
      projectRoot, ['.cpp', '.h', '.hpp', '.cc'], (0, (_CqueryInitialization || _load_CqueryInitialization()).getInitializationOptions)(compilationDbDir), 5 * 60 * 1000);

      lsp.start(); // Kick off 'Initializing'...
      return lsp;
    })();
  }

  associateFileWithProject(file, project) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this2._projectManager.associateFileWithProject(file, project);
      _this2._processes.get(_this2._projectManager.getProjectKey(project));
    })();
  }

  getLanguageServiceForFile(file) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = yield _this3._projectManager.getProjectForFile(file);
      return project == null ? null : _this3._getLanguageServiceForProject(project);
    })();
  }

  _getLanguageServiceForProject(project) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const key = _this4._projectManager.getProjectKey(project);
      const client = _this4._processes.get(key);
      if (client == null) {
        _this4._logger.warn("Didn't find language service for ", project);
        return null;
      }
      if ((yield client) == null) {
        _this4._logger.warn('Found invalid language service for ', project);
        _this4._processes.delete(key); // Delete so we retry next time.
        return null;
      } else {
        _this4._logger.info('Found existing language service for ', project);
        return client;
      }
    })();
  }
}
exports.default = CqueryLanguageServer;