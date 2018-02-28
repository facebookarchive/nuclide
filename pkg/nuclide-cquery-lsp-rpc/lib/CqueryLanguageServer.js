'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _utils;

function _load_utils() {
  return _utils = require('../../nuclide-clang-rpc/lib/utils');
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

class CqueryLanguageServer extends (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).MultiProjectLanguageService {

  constructor(languageId, command, logger, fileCache, host, enableLibclangLogs) {
    var _this;

    _this = super();
    // Invalidator disposes a project which then disposes the process.
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const disposeProject = project => this._projectManager.delete(project);
    const disposeProcess = projectKey => {
      this._processes.delete(projectKey);
    };
    this._fileCache = fileCache;
    this._command = command;
    this._host = host;
    this._languageId = languageId;
    this._logger = logger;
    this._projectManager = new (_CqueryProjectManager || _load_CqueryProjectManager()).CqueryProjectManager(logger, disposeProcess);
    this._projectInvalidator = new (_CqueryInvalidator || _load_CqueryInvalidator()).CqueryInvalidator(fileCache, logger, disposeProject, () => this._projectManager.getMRUProjects(), (() => {
      var _ref = (0, _asyncToGenerator.default)(function* (project) {
        const key = (_CqueryProjectManager || _load_CqueryProjectManager()).CqueryProjectManager.getProjectKey(project);
        if (_this._processes.has(key)) {
          const lsp = yield _this._processes.get(key);
          return lsp != null ? lsp._childPid : null;
        }
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })());

    this._processes = new (_cache || _load_cache()).Cache(projectKey => this._createCqueryLanguageClient(projectKey, enableLibclangLogs), value => {
      value.then(service => {
        if (service != null) {
          service.dispose();
        }
      });
    });

    this._registerDisposables();
  }
  // Maps clang settings => settings metadata with same key as _processes field.


  _registerDisposables() {
    this._disposables.add(this._host, this._projectInvalidator.subscribeFileEvents(), this._projectInvalidator.subscribeResourceUsage(), this._processes);
  }

  dispose() {
    this._disposables.dispose();
    super.dispose();
  }

  _createCqueryLanguageClient(projectKey, enableLibclangLogs) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = _this2._projectManager.getProjectFromKey(projectKey);
      if (project == null) {
        return null;
      }

      const initalizationOptions = yield (0, (_CqueryInitialization || _load_CqueryInitialization()).getInitializationOptions)(project);
      if (initalizationOptions == null) {
        return null;
      }

      _this2._logger.info(`Using cache dir: ${initalizationOptions.cacheDirectory}`);

      const [, host] = yield Promise.all([_this2.hasObservedDiagnostics(), (0, (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).forkHostServices)(_this2._host, _this2._logger)]);

      const stderrFd = yield (_fsPromise || _load_fsPromise()).default.open((_nuclideUri || _load_nuclideUri()).default.join(initalizationOptions.cacheDirectory, '..', 'stderr'), 'a');
      const spawnOptions = {
        stdio: ['pipe', 'pipe', stderrFd],
        env: Object.assign({}, (yield (0, (_process || _load_process()).getOriginalEnvironment)()))
      };
      if (enableLibclangLogs) {
        spawnOptions.env.LIBCLANG_LOGGING = 1;
      }
      const lsp = new (_CqueryLanguageClient || _load_CqueryLanguageClient()).CqueryLanguageClient(_this2._logger, _this2._fileCache, host, _this2._languageId, _this2._command, ['--language-server', '--log-file', (_nuclideUri || _load_nuclideUri()).default.join(initalizationOptions.cacheDirectory, '..', 'diagnostics')], spawnOptions, project.hasCompilationDb ? (_nuclideUri || _load_nuclideUri()).default.dirname(project.flagsFile) : project.projectRoot, ['.cpp', '.h', '.hpp', '.cc', '.m', 'mm'], initalizationOptions, 5 * 60 * 1000);

      lsp.setProjectChecker(function (file) {
        const checkProject = _this2._projectManager.getProjectForFile(file);
        return checkProject != null ? (_CqueryProjectManager || _load_CqueryProjectManager()).CqueryProjectManager.getProjectKey(checkProject) === projectKey : // TODO pelmers: header files aren't in the map because they do not
        // appear in compile_commands.json, but they should be cached!
        (0, (_utils || _load_utils()).isHeaderFile)(file);
      });
      lsp.setProgressInfo({ id: projectKey, label: lsp._projectRoot });
      lsp.start(); // Kick off 'Initializing'...
      return lsp;
    })();
  }

  requestLocationsCommand(methodName, path, point) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const cqueryProcess = yield _this3.getLanguageServiceForFile(path);
      if (cqueryProcess) {
        return cqueryProcess.requestLocationsCommand(methodName, path, point);
      } else {
        _this3._host.consoleNotification(_this3._languageId, 'warning', 'Could not freshen: no cquery index found for ' + path);
        return [];
      }
    })();
  }

  freshenIndexForFile(file) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const cqueryProcess = yield _this4.getLanguageServiceForFile(file);
      if (cqueryProcess) {
        cqueryProcess.freshenIndex();
      } else {
        _this4._host.consoleNotification(_this4._languageId, 'warning', 'Could not freshen: no cquery index found for ' + file);
      }
    })();
  }

  associateFileWithProject(file, project) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this5._projectManager.associateFileWithProject(file, project);
      _this5._processes.get((_CqueryProjectManager || _load_CqueryProjectManager()).CqueryProjectManager.getProjectKey(project)); // spawn the process ahead of time
    })();
  }

  getLanguageServiceForFile(file) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = _this6._projectManager.getProjectForFile(file);
      return project == null ? null : _this6._getLanguageServiceForProject(project);
    })();
  }

  _getLanguageServiceForProject(project) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const key = (_CqueryProjectManager || _load_CqueryProjectManager()).CqueryProjectManager.getProjectKey(project);
      const client = _this7._processes.get(key);
      if ((yield client) == null) {
        _this7._logger.warn("Didn't find language service for ", project);
        return null;
      } else {
        _this7._logger.info('Found existing language service for ', project);
        return client;
      }
    })();
  }
}
exports.default = CqueryLanguageServer;