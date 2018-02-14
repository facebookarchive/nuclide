/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {CqueryProject, CqueryProjectKey} from './types';

import * as ClangService from '../../nuclide-clang-rpc';
import nuclideUri from 'nuclide-commons/nuclideUri';

export const COMPILATION_DATABASE_FILE = 'compile_commands.json';

/**
 * Manages the existing projects and the files associated with them
 */
export class CqueryProjectManager {
  _keyToProject: Map<CqueryProjectKey, CqueryProject> = new Map();
  _fileToProjectKey: Map<string, CqueryProjectKey> = new Map();
  _logger: log4js$Logger;

  constructor(logger: log4js$Logger) {
    this._logger = logger;
  }

  getProjectKey(project: CqueryProject): CqueryProjectKey {
    return JSON.stringify(project);
  }

  associateFileWithProject(
    file: string,
    project: CqueryProject,
  ): Promise<void> {
    const key = this.getProjectKey(project);
    this._keyToProject.set(key, project);
    if (this._fileToProjectKey.get(file) === key) {
      return Promise.resolve();
    }
    if (!this._keyToProject.has(key) && project.hasCompilationDb) {
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
    } else {
      this._fileToProjectKey.set(file, key);
      return Promise.resolve();
    }
  }

  getProjectForFile(file: string): ?CqueryProject {
    const key = this._fileToProjectKey.get(file);
    this._logger.debug('key for', file, ':', key);
    return key == null ? null : this._keyToProject.get(key);
  }

  getProjectFromKey(projectKey: string): ?CqueryProject {
    return this._keyToProject.get(projectKey);
  }

  getAllProjects(): Array<CqueryProject> {
    return Array.from(this._keyToProject.values());
  }

  delete(project: CqueryProject): void {
    const key = this.getProjectKey(project);
    for (const [file, _key] of this._fileToProjectKey.entries()) {
      if (_key === key) {
        this._fileToProjectKey.delete(file);
      }
    }
    this._keyToProject.delete(key);
  }
}
