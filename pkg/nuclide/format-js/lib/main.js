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
      description:
        'This setting is not recommended yet. Instead use the default ' +
        'keyboard shortcut, `cmd-shift-i`.',
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
        'Requires will not be added for identifiers in this list.',
      type: 'array',
      default: [],
      items: {
        type: 'string',
      },
    },
    builtInTypes: {
      title: 'Built-in Types',
      description:
        'Type imports will not be added for identifiers in this list.',
      type: 'array',
      default: [],
      items: {
        type: 'string',
      },
    },
    aliases: {
      title: 'Aliases',
      description:
        'This is used to specify common aliases that you use. Each pair of ' +
        'entries should be in the format "variableName, moduleName".',
      type: 'array',
      default: ['Immutable', 'immutable', 'fbt', 'fbt'],
      items: {
        type: 'string',
      },
    },
    // Enumerate the possible blacklist options so people know what they are.
    nuclideFixHeader: {
      title: 'Nuclide: Fix Header',
      description:
        'This is used to fix the header when developing on Nuclide source ' +
        'code. This should rarely affect anything outside of Nuclide source.',
      type: 'boolean',
      default: true,
    },
    reprint: {
      title: 'Reprint: Format all code',
      type: 'boolean',
      default: false,
    },
    requiresTransferComments: {
      title: 'Requires: Transfer Comments',
      type: 'boolean',
      default: true,
    },
    requiresRemoveUnusedRequires: {
      title: 'Requires: Remove Unused Requires',
      type: 'boolean',
      default: true,
    },
    requiresAddMissingRequires: {
      title: 'Requires: Add Missing Requires',
      type: 'boolean',
      default: true,
    },
    requiresRemoveUnusedTypes: {
      title: 'Requires: Remove Unused Types',
      type: 'boolean',
      default: true,
    },
    requiresAddMissingTypes: {
      title: 'Requires: Add Missing Types',
      type: 'boolean',
      default: true,
    },
    requiresFormatRequires: {
      title: 'Requires: Format Requires',
      type: 'boolean',
      default: true,
    },
  },

};
