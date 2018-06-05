'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CqueryProjectManager = exports.COMPILATION_DATABASE_FILE = undefined;

var _lruCache;

function _load_lruCache() {
  return _lruCache = _interopRequireDefault(require('lru-cache'));
}

var _nuclideClangRpc;

function _load_nuclideClangRpc() {
  return _nuclideClangRpc = _interopRequireWildcard(require('../../nuclide-clang-rpc'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const COMPILATION_DATABASE_FILE = exports.COMPILATION_DATABASE_FILE = 'compile_commands.json';

// Remark: nuclide-clang-rpc uses server limit of 20.
// This limit is lower because each cquery process may handle many files.
const PROJECT_LIMIT = 8;

/**
 * Manages the existing projects and the files associated with them
 */
class CqueryProjectManager {

  constructor(logger, disposeProcess) {
    this._fileToProjectKey = new Map();

    this._keyToProject = new (_lruCache || _load_lruCache()).default({
      max: PROJECT_LIMIT,
      dispose: key => {
        // Delete files associated with the project and its process.
        logger.info('Cleaning project from LRU cache:', key);
        for (const [file, _key] of this._fileToProjectKey) {
          if (_key === key) {
            this._fileToProjectKey.delete(file);
          }
        }
        disposeProcess(key);
      }
    });

    this._logger = logger;
  }

  static getProjectKey(project) {
    return JSON.stringify(project);
  }

  associateFileWithProject(file, project) {
    const key = CqueryProjectManager.getProjectKey(project);
    this._fileToProjectKey.set(file, key);
    const projectAlreadySet = this._keyToProject.has(key);
    if (!projectAlreadySet) {
      this._keyToProject.set(key, project);
      if (project.hasCompilationDb) {
        const dbFile = (_nuclideUri || _load_nuclideUri()).default.join(project.compilationDbDir, COMPILATION_DATABASE_FILE);
        // Cache keys for all the files in the project.
        return new Promise((resolve, reject) => {
          (_nuclideClangRpc || _load_nuclideClangRpc()).loadFilesFromCompilationDatabaseAndCacheThem(dbFile, project.flagsFile).refCount().subscribe(path => this._fileToProjectKey.set(path, key), reject, // on error
          resolve // on complete
          );
        });
      }
    }
    return Promise.resolve();
  }

  getFilesInProject(projectKey) {
    return Array.from(this._fileToProjectKey.entries()).filter(([_, key]) => projectKey === key).map(([file, _]) => file);
  }

  getProjectForFile(file) {
    const key = this._fileToProjectKey.get(file);
    this._logger.debug('key for', file, ':', key);
    return key == null ? null : this._keyToProject.get(key);
  }

  getProjectFromKey(projectKey) {
    return this._keyToProject.get(projectKey);
  }

  getMRUProjects() {
    const lru = [];
    this._keyToProject.forEach(project => lru.push(project));
    return lru;
  }

  delete(project) {
    const key = CqueryProjectManager.getProjectKey(project);
    this._keyToProject.del(key);
  }
}
exports.CqueryProjectManager = CqueryProjectManager;