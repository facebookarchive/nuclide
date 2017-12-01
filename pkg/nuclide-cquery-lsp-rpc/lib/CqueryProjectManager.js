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

import fsPromise from 'nuclide-commons/fsPromise';

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

  async associateFileWithProject(
    file: string,
    project: CqueryProject,
  ): Promise<void> {
    const key = this.getProjectKey(project);
    this._keyToProject.set(key, project);
    this._fileToProjectKey.set(await fsPromise.realpath(file), key);
  }

  async getProjectForFile(file: string): Promise<?CqueryProject> {
    const key = this._fileToProjectKey.get(await fsPromise.realpath(file));
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
