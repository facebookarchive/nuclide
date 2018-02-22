'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CqueryProjectManager = exports.COMPILATION_DATABASE_FILE = undefined;

var _nuclideClangRpc;

function _load_nuclideClangRpc() {
  return _nuclideClangRpc = _interopRequireWildcard(require('../../nuclide-clang-rpc'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const COMPILATION_DATABASE_FILE = exports.COMPILATION_DATABASE_FILE = 'compile_commands.json';

/**
 * Manages the existing projects and the files associated with them
 */
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

class CqueryProjectManager {

  constructor(logger) {
    this._keyToProject = new Map();
    this._fileToProjectKey = new Map();

    this._logger = logger;
  }

  getProjectKey(project) {
    return JSON.stringify(project);
  }

  associateFileWithProject(file, project) {
    const key = this.getProjectKey(project);
    this._keyToProject.set(key, project);
    if (this._fileToProjectKey.get(file) === key) {
      return Promise.resolve();
    }
    if (!this._keyToProject.has(key) && project.hasCompilationDb) {
      const dbFile = (_nuclideUri || _load_nuclideUri()).default.join(project.compilationDbDir, COMPILATION_DATABASE_FILE);
      // Cache keys for all the files in the project.
      return new Promise((resolve, reject) => {
        (_nuclideClangRpc || _load_nuclideClangRpc()).loadFilesFromCompilationDatabaseAndCacheThem(dbFile, project.flagsFile).refCount().subscribe(path => this._fileToProjectKey.set(path, key), reject, // on error
        resolve // on complete
        );
      });
    } else {
      this._fileToProjectKey.set(file, key);
      return Promise.resolve();
    }
  }

  getProjectForFile(file) {
    const key = this._fileToProjectKey.get(file);
    this._logger.debug('key for', file, ':', key);
    return key == null ? null : this._keyToProject.get(key);
  }

  getProjectFromKey(projectKey) {
    return this._keyToProject.get(projectKey);
  }

  getAllProjects() {
    return Array.from(this._keyToProject.values());
  }

  delete(project) {
    const key = this.getProjectKey(project);
    for (const [file, _key] of this._fileToProjectKey.entries()) {
      if (_key === key) {
        this._fileToProjectKey.delete(file);
      }
    }
    this._keyToProject.delete(key);
  }
}
exports.CqueryProjectManager = CqueryProjectManager;