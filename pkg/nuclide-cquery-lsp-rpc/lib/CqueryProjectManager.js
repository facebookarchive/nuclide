'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CqueryProjectManager = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const key = _this.getProjectKey(project);
      _this._keyToProject.set(key, project);
      _this._fileToProjectKey.set((yield (_fsPromise || _load_fsPromise()).default.realpath(file)), key);
    })();
  }

  getProjectForFile(file) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const key = _this2._fileToProjectKey.get((yield (_fsPromise || _load_fsPromise()).default.realpath(file)));
      _this2._logger.debug('key for', file, ':', key);
      return key == null ? null : _this2._keyToProject.get(key);
    })();
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