'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CqueryInvalidator = undefined;

var _os = _interopRequireDefault(require('os'));

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _promise;

function _load_promise() {
  return _promise = require('../../../modules/nuclide-commons/promise');
}

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _CqueryProjectManager;

function _load_CqueryProjectManager() {
  return _CqueryProjectManager = require('./CqueryProjectManager');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// As a percentage of os.totalmem()
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

const DEFAULT_MEMORY_LIMIT = 35;

/*
 * Handles invalidation of caches and other data related to cquery projects and
 * processes.
 */
class CqueryInvalidator {

  constructor(fileCache, logger, disposeProject, getMRUProjects, pidForProject) {
    this._fileCache = fileCache;
    this._logger = logger;
    this._disposeProject = disposeProject;
    this._getMRUProjects = getMRUProjects;
    this._pidForProject = pidForProject;
    // Do not let ps calls race each other leading to double-dispose.
    this._checkMemoryUsage = (0, (_promise || _load_promise()).serializeAsyncCall)(this._checkMemoryUsageImpl.bind(this));
  }

  invalidate(project) {
    this._disposeProject(project);
  }

  subscribeFileEvents() {
    return this._observeFileSaveEvents().subscribe(projects => {
      for (const project of projects) {
        this._logger.info('Watch file saved, invalidating: ', project);
        this.invalidate(project);
      }
    });
  }

  subscribeResourceUsage() {
    // Every 30 seconds, check resource usage and kill old processes first.
    return _rxjsBundlesRxMinJs.Observable.interval(30000).subscribe(() => this._checkMemoryUsage());
  }

  async _checkMemoryUsageImpl() {
    const memoryLimit = _os.default.totalmem() * DEFAULT_MEMORY_LIMIT / 100;
    const priorityList = this._getMRUProjects();
    // Generate a map from project to its pid.
    const pidMap = new Map((await Promise.all(priorityList.map(async project => {
      const key = (_CqueryProjectManager || _load_CqueryProjectManager()).CqueryProjectManager.getProjectKey(project);
      const pid = await this._pidForProject(project);
      return [key, pid];
    }))));
    const memoryUsage = await (0, (_process || _load_process()).memoryUsagePerPid)((0, (_collection || _load_collection()).arrayCompact)(Array.from(pidMap.values())));
    let memoryUsed = 0;
    const projectsToDispose = [];
    for (const project of priorityList) {
      const pid = pidMap.get((_CqueryProjectManager || _load_CqueryProjectManager()).CqueryProjectManager.getProjectKey(project));
      if (pid != null) {
        const rss = memoryUsage.get(pid);
        memoryUsed += rss != null ? rss : 0;
      }
      if (memoryUsed > memoryLimit) {
        projectsToDispose.push(project);
      }
    }
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-cquery-lsp:memory-used', {
      projects: priorityList.length,
      memoryUsed
    });
    // Don't dispose all of them: keep at least the most recent one alive.
    if (projectsToDispose.length === priorityList.length) {
      projectsToDispose.shift();
    }
    projectsToDispose.forEach(project => {
      this._logger.warn('Exceeded memory limit, disposing: ', project);
      this.invalidate(project);
    });
  }

  _observeFileSaveEvents() {
    return this._fileCache.observeFileEvents().filter(event => event.kind === 'save').map(({ fileVersion: { filePath } }) => this._getMRUProjects().filter(project => project.hasCompilationDb && project.flagsFile === filePath));
  }
}
exports.CqueryInvalidator = CqueryInvalidator;