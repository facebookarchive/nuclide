/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {CompositeDisposable} from 'atom';

import {
  graphqlLanguageService,
  resetGraphQLLanguageService,
} from './GraphQLLanguage';

class Activation {
  _disposables: CompositeDisposable;

  constructor() {
    this._disposables = new CompositeDisposable();
    graphqlLanguageService.activate();
    this._disposables.add(graphqlLanguageService);
  }

  dispose() {
    resetGraphQLLanguageService();
    this._disposables.dispose();
  }
}

let activation: ?Activation = null;

export function activate(state: ?Object) {
  if (!activation) {
    activation = new Activation();
  }
}

export function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}
