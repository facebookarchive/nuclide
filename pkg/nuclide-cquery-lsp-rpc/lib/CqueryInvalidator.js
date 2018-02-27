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

import os from 'os';
import type {Subscription} from 'rxjs';
import type {CqueryProject} from './types';

import {arrayCompact} from 'nuclide-commons/collection';
import {serializeAsyncCall} from 'nuclide-commons/promise';
import {memoryUsagePerPid} from 'nuclide-commons/process';
import {Observable} from 'rxjs';
import {track} from '../../nuclide-analytics';
import {FileCache} from '../../nuclide-open-files-rpc';
import {CqueryProjectManager} from './CqueryProjectManager';

// As a percentage of os.totalmem()
const DEFAULT_MEMORY_LIMIT = 35;

/*
 * Handles invalidation of caches and other data related to cquery projects and
 * processes.
 */
export class CqueryInvalidator {
  _fileCache: FileCache;
  _logger: log4js$Logger;
  _disposeProject: CqueryProject => void;
  _getMRUProjects: () => CqueryProject[];
  _pidForProject: CqueryProject => Promise<?number>;
  _checkMemoryUsage: () => Promise<void>;

  constructor(
    fileCache: FileCache,
    logger: log4js$Logger,
    disposeProject: CqueryProject => void,
    getMRUProjects: () => CqueryProject[],
    pidForProject: CqueryProject => Promise<?number>,
  ) {
    this._fileCache = fileCache;
    this._logger = logger;
    this._disposeProject = disposeProject;
    this._getMRUProjects = getMRUProjects;
    this._pidForProject = pidForProject;
    // Do not let ps calls race each other leading to double-dispose.
    this._checkMemoryUsage = serializeAsyncCall(
      this._checkMemoryUsageImpl.bind(this),
    );
  }

  invalidate(project: CqueryProject): void {
    this._disposeProject(project);
  }

  subscribeFileEvents(): Subscription {
    return this._observeFileSaveEvents().subscribe(projects => {
      for (const project of projects) {
        this._logger.info('Watch file saved, invalidating: ', project);
        this.invalidate(project);
      }
    });
  }

  subscribeResourceUsage(): Subscription {
    // Every 30 seconds, check resource usage and kill old processes first.
    return Observable.interval(30000).subscribe(() => this._checkMemoryUsage());
  }

  async _checkMemoryUsageImpl(): Promise<void> {
    const memoryLimit = os.totalmem() * DEFAULT_MEMORY_LIMIT / 100;
    const priorityList = this._getMRUProjects();
    // Generate a map from project to its pid.
    const pidMap = new Map(
      await Promise.all(
        priorityList.map(async project => {
          const key = CqueryProjectManager.getProjectKey(project);
          const pid = await this._pidForProject(project);
          return [key, pid];
        }),
      ),
    );
    const memoryUsage = await memoryUsagePerPid(
      arrayCompact(Array.from(pidMap.values())),
    );
    let memoryUsed = 0;
    const projectsToDispose = [];
    for (const project of priorityList) {
      const pid = pidMap.get(CqueryProjectManager.getProjectKey(project));
      if (pid != null) {
        const rss = memoryUsage.get(pid);
        memoryUsed += rss != null ? rss : 0;
      }
      if (memoryUsed > memoryLimit) {
        projectsToDispose.push(project);
      }
    }
    track('nuclide-cquery-lsp:memory-used', {
      projects: priorityList.length,
      memoryUsed,
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

  _observeFileSaveEvents(): Observable<Array<CqueryProject>> {
    return this._fileCache
      .observeFileEvents()
      .filter(event => event.kind === 'save')
      .map(({fileVersion: {filePath}}) =>
        this._getMRUProjects().filter(
          project => project.hasCompilationDb && project.flagsFile === filePath,
        ),
      );
  }
}
