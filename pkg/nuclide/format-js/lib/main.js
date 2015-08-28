'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable} = require('atom');

var subscriptions: ?CompositeDisposable = null;

module.exports = {

  activate(state: ?Object): void {
    if (subscriptions) {
      return;
    }

    var formatCode = require('./formatCode');
    var localSubscriptions = new CompositeDisposable();
    localSubscriptions.add(atom.commands.add(
      'atom-text-editor',
      'nuclide-format-js:format',
      // Atom prevents in-command modification to text editor content.
      () => process.nextTick(() => formatCode())
    ));

    var {refreshOptions} = require('./options');

    // Set the initial options.
    refreshOptions();

    // Observe changes to the config and remove them when they change.
    atom.config.observe('nuclide-format-js.builtIns', refreshOptions);
    atom.config.observe('nuclide-format-js.builtInBlacklist', refreshOptions);
    atom.config.observe('nuclide-format-js.builtInTypes', refreshOptions);
    atom.config.observe(
      'nuclide-format-js.builtInTypeBlacklist',
      refreshOptions
    );
    atom.config.observe('nuclide-format-js.commonAliases', refreshOptions);

    // Set up run-on-save based on atom config.
    var runOnSave = atom.config.get('nuclide-format-js.runOnSave');
    atom.config.observe('nuclide-format-js.runOnSave', newValue => {
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

  config: {
    runOnSave: {
      title: 'Run on save',
      type: 'boolean',
      default: false,
    },
    saveAfterRun: {
      title: 'Save after run',
      description: 'Save any changes the transform makes after it has run.',
      type: 'boolean',
      default: false,
    },
    builtIns: {
      title: 'Built-ins',
      description:
        'Module names here will be ignored if undeclared. Defaults in here ' +
        'are hard-coded, use the blacklist to override the defaults.',
      type: 'array',
      default: ['Array', 'Object'],
      items: {
        type: 'string',
      },
    },
    builtInBlacklist: {
      title: 'Built-in Blacklist',
      description:
        'Module names here will be be removed from the default list of built-' +
        'ins. For example adding "Object" here will cause "Object" to be ' +
        'required when it is used.',
      type: 'array',
      default: [],
      items: {
        type: 'string',
      },
    },
    builtInTypes: {
      title: 'Built-in Types',
      description: 'Similar to "Built-ins" but applies to Flow types.',
      type: 'array',
      default: ['FBID'],
      items: {
        type: 'string',
      },
    },
    builtInTypeBlacklist: {
      title: 'Built-in Types Blacklist',
      description: 'Similar to "Built-in Blacklist" but applies to Flow types.',
      type: 'array',
      default: [],
      items: {
        type: 'string',
      },
    },
    commonAliases: {
      title: 'Common Aliases',
      description:
        'This is used to specify common aliases that you use. Each pair of ' +
        'entries should be in the format "variableName, moduleName".',
      type: 'array',
      default: ['Immutable', 'immutable'],
      items: {
        type: 'string',
      },
    },
  },

};
