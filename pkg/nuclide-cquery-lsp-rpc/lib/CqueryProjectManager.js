/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {CqueryProject, CqueryProjectKey} from './types';

import LRUCache from 'lru-cache';
import * as ClangService from '../../nuclide-clang-rpc';
import nuclideUri from 'nuclide-commons/nuclideUri';

export const COMPILATION_DATABASE_FILE = 'compile_commands.json';

// Remark: nuclide-clang-rpc uses server limit of 20.
// This limit is lower because each cquery process may handle many files.
const PROJECT_LIMIT = 8;

/**
 * Manages the existing projects and the files associated with them
 */
export class CqueryProjectManager {
  _keyToProject: LRUCache<CqueryProjectKey, CqueryProject>;
  _fileToProjectKey: Map<string, CqueryProjectKey> = new Map();
  _logger: log4js$Logger;

  constructor(logger: log4js$Logger, disposeProcess: CqueryProjectKey => void) {
    this._keyToProject = new LRUCache({
      max: PROJECT_LIMIT,
      dispose: (key: CqueryProjectKey) => {
        // Delete files associated with the project and its process.
        logger.info('Cleaning project from LRU cache:', key);
        for (const [file, _key] of this._fileToProjectKey) {
          if (_key === key) {
            this._fileToProjectKey.delete(file);
          }
        }
        disposeProcess(key);
      },
    });

    this._logger = logger;
  }

  static getProjectKey(project: CqueryProject): CqueryProjectKey {
    return JSON.stringify(project);
  }

  associateFileWithProject(
    file: string,
    project: CqueryProject,
  ): Promise<void> {
    const key = CqueryProjectManager.getProjectKey(project);
    this._fileToProjectKey.set(file, key);
    const projectAlreadySet = this._keyToProject.has(key);
    if (!projectAlreadySet) {
      this._keyToProject.set(key, project);
      if (project.hasCompilationDb) {
        const dbFile = nuclideUri.join(
          project.compilationDbDir,
          COMPILATION_DATABASE_FILE,
        );
        // Cache keys for all the files in the project.
        return new Promise((resolve, reject) => {
          ClangService.loadFilesFromCompilationDatabaseAndCacheThem(
            dbFile,
            project.flagsFile,
          )
            .refCount()
            .subscribe(
              path => this._fileToProjectKey.set(path, key),
              reject, // on error
              resolve, // on complete
            );
        });
      }
    }
    return Promise.resolve();
  }

  getFilesInProject(projectKey: CqueryProjectKey): Array<string> {
    return Array.from(this._fileToProjectKey.entries())
      .filter(([_, key]) => projectKey === key)
      .map(([file, _]) => file);
  }

  getProjectForFile(file: string): ?CqueryProject {
    const key = this._fileToProjectKey.get(file);
    this._logger.debug('key for', file, ':', key);
    return key == null ? null : this._keyToProject.get(key);
  }

  getProjectFromKey(projectKey: string): ?CqueryProject {
    return this._keyToProject.get(projectKey);
  }

  getMRUProjects(): Array<CqueryProject> {
    const lru = [];
    this._keyToProject.forEach(project => lru.push(project));
    return lru;
  }

  delete(project: CqueryProject): void {
    const key = CqueryProjectManager.getProjectKey(project);
    this._keyToProject.del(key);
  }
}
