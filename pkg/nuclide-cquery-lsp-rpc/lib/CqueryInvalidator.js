'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CqueryInvalidator = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _os = _interopRequireDefault(require('os'));

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _utils;

function _load_utils() {
  return _utils = require('../../nuclide-clang-rpc/lib/utils');
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

  subscribeFileEvents() {
    return this._observeFileSaveEvents().subscribe(projects => {
      for (const project of projects) {
        this._logger.info('Watch file saved, invalidating: ', project);
        this._disposeProject(project);
      }
    });
  }

  subscribeResourceUsage() {
    // Every 30 seconds, check resource usage and kill old processes first.
    return _rxjsBundlesRxMinJs.Observable.interval(30000).subscribe(() => this._checkMemoryUsage());
  }

  _checkMemoryUsageImpl() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const memoryLimit = _os.default.totalmem() * DEFAULT_MEMORY_LIMIT / 100;
      const priorityList = _this._getMRUProjects();
      // Generate a map from project to its pid.
      const pidMap = new Map((yield Promise.all(priorityList.map((() => {
        var _ref = (0, _asyncToGenerator.default)(function* (project) {
          const key = (_CqueryProjectManager || _load_CqueryProjectManager()).CqueryProjectManager.getProjectKey(project);
          const pid = yield _this._pidForProject(project);
          return [key, pid];
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      })()))));
      const memoryUsage = yield (0, (_utils || _load_utils()).memoryUsagePerPid)((0, (_collection || _load_collection()).arrayCompact)(Array.from(pidMap.values())));
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
      projectsToDispose.forEach(function (project) {
        _this._logger.warn('Exceeded memory limit, disposing: ', project);
        _this._disposeProject(project);
      });
    })();
  }

  _observeFileSaveEvents() {
    return this._fileCache.observeFileEvents().filter(event => event.kind === 'save').map(({ fileVersion: { filePath } }) => this._getMRUProjects().filter(project => project.hasCompilationDb && project.flagsFile === filePath));
  }
}
exports.CqueryInvalidator = CqueryInvalidator;