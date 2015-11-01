'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CodeHighlightProvider} from './types';
import type CodeHighlightManager from './CodeHighlightManager';

class Activation {
  _codeHighlightManager: CodeHighlightManager;

  activate() {
    const HighlightManager = require('./CodeHighlightManager');
    // $FlowIssue -- https://github.com/facebook/flow/issues/996
    this._codeHighlightManager = new HighlightManager();
  }

  consumeProvider(provider: CodeHighlightProvider) {
    this._codeHighlightManager.addProvider(provider);
  }

  dispose() {
    this._codeHighlightManager.dispose();
  }
}

let activation: ?Activation = null;

export function activate(state: ?Object) {
  if (!activation) {
    activation = new Activation(state);
    activation.activate();
  }
}

export function consumeProvider(provider: CodeHighlightProvider) {
  if (activation != null) {
    activation.consumeProvider(provider);
  }
}

export function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}
