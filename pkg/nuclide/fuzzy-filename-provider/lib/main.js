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
} from 'nuclide-quick-open-interfaces';

var {
  CompositeDisposable,
  Disposable,
} = require('atom');

var providerInstance: ?Provider;
function getProviderInstance(): Provider {
  if (providerInstance == null) {
    var FuzzyFileNameProvider = require('./FuzzyFileNameProvider');
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

var activation: ?Activation = null;
function getActivation() {
  if (activation == null) {
    activation = new Activation();
    activation.activate();
  }
  return activation;
}
var projectRoots: Set<string> = new Set();

/**
 * @param projectPaths All the root directories in the Atom workspace.
 */
function initSearch(projectPaths: Array<string>): void {
  var {getClient} = require('nuclide-client');
  var newProjectRoots = new Set();
  projectPaths.forEach((projectPath) => {
    newProjectRoots.add(projectPath);
    if (projectRoots.has(projectPath)) {
      return;
    }
    var client = getClient(projectPath);
    if (client) {
      // It doesn't matter what the search term is. Empirically, doing an initial
      // search speeds up the next search much more than simply doing the setup
      // kicked off by 'fileSearchForDirectory'.
      client.searchDirectory(projectPath, 'a');
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
