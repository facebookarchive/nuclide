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

import type {Subscription, Observable} from 'rxjs';
import type {CqueryProjectManager} from './CqueryProjectManager';
import type {CqueryProject} from './types';

import {Cache} from 'nuclide-commons/cache';
import {FileCache} from '../../nuclide-open-files-rpc';

/*
 * Handles invalidation of caches and other data related to cquery projects and
 * processes.
 */
export class CqueryInvalidator<T> {
  _fileCache: FileCache;
  _logger: log4js$Logger;
  _projectManager: CqueryProjectManager;
  _processes: Cache<string, T>;

  constructor(
    fileCache: FileCache,
    projectManager: CqueryProjectManager,
    logger: log4js$Logger,
    processes: Cache<string, T>,
  ) {
    this._fileCache = fileCache;
    this._projectManager = projectManager;
    this._processes = processes;
    this._logger = logger;
  }

  subscribe(): Subscription {
    return this._observeFileSaveEvents().subscribe(projects =>
      this._invalidateProjects(projects),
    );
  }

  _observeFileSaveEvents(): Observable<Array<CqueryProject>> {
    return this._fileCache
      .observeFileEvents()
      .filter(event => event.kind === 'save')
      .map(({fileVersion: {filePath}}) =>
        this._projectManager
          .getAllProjects()
          .filter(
            project =>
              project.hasCompilationDb && project.flagsFile === filePath,
          ),
      );
  }

  _invalidateProjects(projects: CqueryProject[]): void {
    for (const project of projects) {
      this._logger.info('Watch file saved, invalidating: ', project);
      this._processes.delete(this._projectManager.getProjectKey(project));
      this._projectManager.delete(project);
    }
  }
}
