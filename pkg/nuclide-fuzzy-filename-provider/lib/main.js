'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Provider} from '../../nuclide-quick-open/lib/types';

import {CompositeDisposable} from 'atom';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {BusySignalProviderBase} from '../../nuclide-busy-signal';
import createPackage from '../../commons-atom/createPackage';
import scheduleIdleCallback from '../../commons-node/scheduleIdleCallback';
import {getFuzzyFileSearchServiceByNuclideUri} from '../../nuclide-remote-connection';
import {getLogger} from '../../nuclide-logging';
import FuzzyFileNameProvider from './FuzzyFileNameProvider';
import {getIgnoredNames} from './utils';

const logger = getLogger();

class Activation {
  _busySignalProvider: BusySignalProviderBase;
  _disposables: CompositeDisposable;
  _projectRoots: Set<string>;

  constructor() {
    this._busySignalProvider = new BusySignalProviderBase();
    this._disposables = new CompositeDisposable();
    this._projectRoots = new Set();
    (this: any)._readySearch = this._readySearch.bind(this);

    // Do search preprocessing for all existing and future root directories.
    this._readySearch(atom.project.getPaths());
    this._disposables.add(
      atom.project.onDidChangePaths(this._readySearch),
    );
  }

  _readySearch(projectPaths: Array<string>): void {
    const newProjectPaths = new Set(projectPaths);
    // Add new project roots.
    for (const newProjectPath of newProjectPaths) {
      if (!this._projectRoots.has(newProjectPath)) {
        this._projectRoots.add(newProjectPath);
        // Wait a bit before starting the initial search, since it's a heavy op.
        const disposable = scheduleIdleCallback(() => {
          this._disposables.remove(disposable);
          this._busySignalProvider.reportBusy(
            `File search: indexing files for project ${newProjectPath}`,
            () => this._initialSearch(newProjectPath),
          ).catch(err => {
            logger.error(`Error starting fuzzy filename search for ${newProjectPath}`, err);
            this._disposeSearch(newProjectPath);
          });
        });
        this._disposables.add(disposable);
      }
    }
    // Clean up removed project roots.
    for (const existingProjectPath of this._projectRoots) {
      if (!newProjectPaths.has(existingProjectPath)) {
        this._disposeSearch(existingProjectPath);
      }
    }
  }

  async _initialSearch(projectPath: string): Promise<void> {
    const service = getFuzzyFileSearchServiceByNuclideUri(projectPath);
    const isAvailable = await service.isFuzzySearchAvailableFor(projectPath);
    if (isAvailable) {
      // It doesn't matter what the search term is. Empirically, doing an initial
      // search speeds up the next search much more than simply doing the setup
      // kicked off by 'fileSearchForDirectory'.
      await service.queryFuzzyFile(projectPath, 'a', getIgnoredNames());
    } else {
      throw new Error('Nonexistent directory');
    }
  }

  _disposeSearch(projectPath: string): void {
    try {
      const service = getFuzzyFileSearchServiceByNuclideUri(projectPath);
      service.disposeFuzzySearch(projectPath);
    } catch (err) {
      logger.error(`Error disposing fuzzy filename service for ${projectPath}`, err);
    } finally {
      this._projectRoots.delete(projectPath);
    }
  }

  registerProvider(): Provider {
    return FuzzyFileNameProvider;
  }

  provideBusySignal(): BusySignalProviderBase {
    return this._busySignalProvider;
  }

  dispose(): void {
    this._disposables.dispose();
  }
}

export default createPackage(Activation);
