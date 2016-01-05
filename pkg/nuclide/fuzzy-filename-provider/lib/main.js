'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  Provider,
} from '../../quick-open-interfaces';

import typeof * as FuzzyFileSearchService from '../../fuzzy-file-search-service';

import {
  CompositeDisposable,
} from 'atom';

import {getServiceByNuclideUri} from '../../client';

let providerInstance: ?Provider;
function getProviderInstance(): Provider {
  if (providerInstance == null) {
    const FuzzyFileNameProvider = require('./FuzzyFileNameProvider');
    providerInstance = {...FuzzyFileNameProvider};
  }
  return providerInstance;
}

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

/**
 * @param projectPaths All the root directories in the Atom workspace.
 */
function initSearch(projectPaths: Array<string>): void {
  const newProjectRoots = new Set();
  projectPaths.forEach((projectPath) => {
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
          service.queryFuzzyFile(projectPath, 'a');
        }
      });
    }
  });
  projectRoots = newProjectRoots;
}

module.exports = {
  registerProvider(): Provider {
    return getProviderInstance();
  },

  activate(state: ?Object) {
    getActivation();
  },

  deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
  },
};
