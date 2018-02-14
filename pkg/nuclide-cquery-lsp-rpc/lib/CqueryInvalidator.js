'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CqueryInvalidator = undefined;

var _cache;

function _load_cache() {
  return _cache = require('nuclide-commons/cache');
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

/*
 * Handles invalidation of caches and other data related to cquery projects and
 * processes.
 */
class CqueryInvalidator {

  constructor(fileCache, projectManager, logger, processes) {
    this._fileCache = fileCache;
    this._projectManager = projectManager;
    this._processes = processes;
    this._logger = logger;
  }

  subscribe() {
    return this._observeFileSaveEvents().subscribe(projects => this._invalidateProjects(projects));
  }

  _observeFileSaveEvents() {
    return this._fileCache.observeFileEvents().filter(event => event.kind === 'save').map(({ fileVersion: { filePath } }) => this._projectManager.getAllProjects().filter(project => project.hasCompilationDb && project.flagsFile === filePath));
  }

  _invalidateProjects(projects) {
    for (const project of projects) {
      this._logger.info('Watch file saved, invalidating: ', project);
      this._processes.delete(this._projectManager.getProjectKey(project));
      this._projectManager.delete(project);
    }
  }
}
exports.CqueryInvalidator = CqueryInvalidator; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                * @format
                                                */