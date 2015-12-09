'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {CompositeDisposable} = require('atom');

const featureConfig = require('../../feature-config');

let subscriptions: ?CompositeDisposable = null;

module.exports = {

  activate(state: ?Object): void {
    if (subscriptions) {
      return;
    }

    const formatCode = require('./formatCode');
    const localSubscriptions = new CompositeDisposable();
    localSubscriptions.add(atom.commands.add(
      'atom-text-editor',
      'nuclide-format-js:format',
      // Atom prevents in-command modification to text editor content.
      () => process.nextTick(() => formatCode())
    ));

    // Set up run-on-save based on atom config.
    let runOnSave = featureConfig.get('nuclide-format-js.runOnSave');
    featureConfig.observe('nuclide-format-js.runOnSave', newValue => {
      runOnSave = !!newValue;
    });
    localSubscriptions.add(atom.workspace.observeTextEditors(editor => {
      localSubscriptions.add(editor.onDidSave(
        () => runOnSave && process.nextTick(() => formatCode(editor))
      ));
    }));

    // Work around flow refinements.
    subscriptions = localSubscriptions;
  },

  deactivate(): void {
    if (subscriptions) {
      subscriptions.dispose();
      subscriptions = null;
    }
  },

  // $FlowIssue https://github.com/facebook/flow/issues/620
  config: require('../package.json').nuclide.config,

};
