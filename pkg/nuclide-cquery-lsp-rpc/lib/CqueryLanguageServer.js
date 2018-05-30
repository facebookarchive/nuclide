'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
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
  return _cache = require('../../../modules/nuclide-commons/cache');
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

class CqueryLanguageServer extends (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).MultiProjectLanguageService {

  constructor(languageId, command, logger, fileCache, host, enableLibclangLogs) {
    super();
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
    this._projectInvalidator = new (_CqueryInvalidator || _load_CqueryInvalidator()).CqueryInvalidator(fileCache, logger, disposeProject, () => this._projectManager.getMRUProjects(), async project => {
      const key = (_CqueryProjectManager || _load_CqueryProjectManager()).CqueryProjectManager.getProjectKey(project);
      if (this._processes.has(key)) {
        const lsp = await this._processes.get(key);
        return lsp != null ? lsp._childPid : null;
      }
    });

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
  }

  async _createCqueryLanguageClient(projectKey, enableLibclangLogs) {
    const project = this._projectManager.getProjectFromKey(projectKey);
    if (project == null) {
      return null;
    }

    const initalizationOptions = await (0, (_CqueryInitialization || _load_CqueryInitialization()).getInitializationOptions)(project);
    if (initalizationOptions == null) {
      return null;
    }

    this._logger.info(`Using cache dir: ${initalizationOptions.cacheDirectory}`);

    const [, host] = await Promise.all([this.hasObservedDiagnostics(), (0, (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).forkHostServices)(this._host, this._logger)]);

    const stderrFd = await (_fsPromise || _load_fsPromise()).default.open((_nuclideUri || _load_nuclideUri()).default.join(initalizationOptions.cacheDirectory, '..', 'stderr'), 'a');
    const spawnOptions = {
      stdio: ['pipe', 'pipe', stderrFd],
      env: Object.assign({}, (await (0, (_process || _load_process()).getOriginalEnvironment)()))
    };
    if (enableLibclangLogs) {
      spawnOptions.env.LIBCLANG_LOGGING = 1;
    }
    const projectRoot = project.hasCompilationDb ? (_nuclideUri || _load_nuclideUri()).default.dirname(project.flagsFile) : project.projectRoot;
    const logFile = (_nuclideUri || _load_nuclideUri()).default.join(initalizationOptions.cacheDirectory, '..', 'diagnostics');
    const lsp = new (_CqueryLanguageClient || _load_CqueryLanguageClient()).CqueryLanguageClient(this._logger, this._fileCache, host, this._languageId, this._command, ['--language-server', '--log-file', logFile], spawnOptions, projectRoot, ['.cpp', '.h', '.hpp', '.cc', '.m', 'mm'], initalizationOptions, 5 * 60 * 1000, // 5 minutes
    logFile, { id: projectKey, label: projectRoot }, projectKey, this._projectManager);
    lsp.start(); // Kick off 'Initializing'...
    return lsp;
  }

  async requestLocationsCommand(methodName, path, point) {
    const cqueryProcess = await this.getLanguageServiceForFile(path);
    if (cqueryProcess) {
      return cqueryProcess.requestLocationsCommand(methodName, path, point);
    } else {
      this._host.consoleNotification(this._languageId, 'warning', 'Could not freshen: no cquery index found for ' + path);
      return [];
    }
  }

  async freshenIndexForFile(file) {
    const cqueryProcess = await this.getLanguageServiceForFile(file);
    if (cqueryProcess) {
      cqueryProcess.freshenIndex();
    } else {
      this._host.consoleNotification(this._languageId, 'warning', 'Could not freshen: no cquery index found for ' + file);
    }
  }

  async associateFileWithProject(file, project) {
    await this._projectManager.associateFileWithProject(file, project);
    this._processes.get((_CqueryProjectManager || _load_CqueryProjectManager()).CqueryProjectManager.getProjectKey(project)); // spawn the process ahead of time
  }

  async deleteProject(project) {
    const key = (_CqueryProjectManager || _load_CqueryProjectManager()).CqueryProjectManager.getProjectKey(project);
    if (this._processes.has(key)) {
      const client = await this._processes.get(key);
      if (client != null) {
        const { cacheDirectory } = client._initializationOptions;
        // Delete the project (which closes the process), then the cache directory
        this._projectInvalidator.invalidate(project);
        await (_fsPromise || _load_fsPromise()).default.rimraf(cacheDirectory);
      }
    }
  }

  async getLanguageServiceForFile(file) {
    const project = this._projectManager.getProjectForFile(file);
    return project == null ? null : this._getLanguageServiceForProject(project);
  }

  async _getLanguageServiceForProject(project) {
    const key = (_CqueryProjectManager || _load_CqueryProjectManager()).CqueryProjectManager.getProjectKey(project);
    const client = this._processes.get(key);
    if ((await client) == null) {
      this._logger.warn("Didn't find language service for ", project);
      return null;
    } else {
      this._logger.info('Found existing language service for ', project);
      return client;
    }
  }
}
exports.default = CqueryLanguageServer; /**
                                         * Copyright (c) 2015-present, Facebook, Inc.
                                         * All rights reserved.
                                         *
                                         * This source code is licensed under the license found in the LICENSE file in
                                         * the root directory of this source tree.
                                         *
                                         *  strict-local
                                         * @format
                                         */