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

import typeof * as FuzzyFileSearchService from '../../nuclide-fuzzy-file-search-rpc';

import {
  CompositeDisposable,
} from 'atom';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {BusySignalProviderBase} from '../../nuclide-busy-signal';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';
import {getIgnoredNames} from './utils';
import FuzzyFileNameProvider from './FuzzyFileNameProvider';

class Activation {
  _disposables: CompositeDisposable;

  constructor(state: ?Object) {
    this._disposables = new CompositeDisposable();
  }

  activate() {
    // Do search preprocessing for all existing and future root directories.
    initSearch(atom.project.getPaths());
    this._disposables.add(atom.project.onDidChangePaths(initSearch));
  }

  dispose() {
    this._disposables.dispose();
  }
}

let activation: ?Activation = null;
function getActivation() {
  if (activation == null) {
    activation = new Activation();
    activation.activate();
  }
  return activation;
}
let projectRoots: Set<string> = new Set();
let busySignalProvider: ?BusySignalProviderBase = null;

/**
 * @param projectPaths All the root directories in the Atom workspace.
 */
function initSearch(projectPaths: Array<string>): void {
  const newProjectRoots = new Set();
  projectPaths.forEach(projectPath => {
    newProjectRoots.add(projectPath);
    if (projectRoots.has(projectPath)) {
      return;
    }
    const service: ?FuzzyFileSearchService = getServiceByNuclideUri(
      'FuzzyFileSearchService', projectPath);
    if (service) {
      // It doesn't matter what the search term is. Empirically, doing an initial
      // search speeds up the next search much more than simply doing the setup
      // kicked off by 'fileSearchForDirectory'.
      service.isFuzzySearchAvailableFor(projectPath).then(isAvailable => {
        if (isAvailable) {
          const queryPromise = service.queryFuzzyFile(projectPath, 'a', getIgnoredNames());
          if (busySignalProvider != null) {
            busySignalProvider.reportBusy(
              `File search: indexing files for project ${projectPath}`,
              () => queryPromise,
            );
          }
        }
      });
    }
  });
  // Clean up removed project roots.
  projectRoots.forEach(projectPath => {
    if (!newProjectRoots.has(projectPath)) {
      const service: ?FuzzyFileSearchService = getServiceByNuclideUri(
        'FuzzyFileSearchService', projectPath);
      if (service != null) {
        service.disposeFuzzySearch(projectPath);
      }
    }
  });
  projectRoots = newProjectRoots;
}

export function registerProvider(): Provider {
  return FuzzyFileNameProvider;
}

export function provideBusySignal(): BusySignalProviderBase {
  if (busySignalProvider == null) {
    busySignalProvider = new BusySignalProviderBase();
  }
  return busySignalProvider;
}

export function activate(state: ?Object) {
  getActivation();
}

export function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}
