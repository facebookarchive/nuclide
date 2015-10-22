'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import {CompositeDisposable} from 'atom';
import invariant from 'assert';

var subscriptions: ?CompositeDisposable = null;

module.exports = {

  config: {
    blacklistedLinters: {
      type: 'array',
      description: 'Comma-separated list of linter names that should not be displayed',
      // Flow wants this annotated.
      default: ([]: Array<string>),
      items: {
        type: 'string',
      },
    },
  },

  activate(): void {
    if (subscriptions) {
      return;
    }

    var {registerGrammarForFileExtension} = require('nuclide-atom-helpers');
    subscriptions = new CompositeDisposable();
    subscriptions.add(registerGrammarForFileExtension('source.json', '.arcconfig'));
  },

  dactivate(): void {
    if (subscriptions) {
      subscriptions.dispose();
      subscriptions = null;
    }
  },

  provideDiagnostics() {
    const {ArcanistDiagnosticsProvider} = require('./ArcanistDiagnosticsProvider');
    const provider = new ArcanistDiagnosticsProvider();
    invariant(subscriptions != null);
    subscriptions.add(provider);
    return provider;
  },
};
