'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {SourceOptions} from '../../nuclide-format-js-common/lib/options/SourceOptions';
import type {Settings} from './settings';

import {CompositeDisposable} from 'atom';

let subscriptions: ?CompositeDisposable = null;

export function activate(state: ?Object): void {
  if (subscriptions) {
    return;
  }

  const formatCode = require('./formatCode');
  const {calculateOptions, observeSettings} = require('./settings');

  const localSubscriptions = new CompositeDisposable();
  localSubscriptions.add(atom.commands.add(
    'atom-text-editor',
    'nuclide-format-js:format',
    // Atom prevents in-command modification to text editor content.
    () => process.nextTick(() => formatCode(options)),
  ));

  // Keep settings up to date with Nuclide config and precalculate options.
  let settings: Settings;
  let options: SourceOptions;
  localSubscriptions.add(observeSettings(newSettings => {
    settings = newSettings;
    options = calculateOptions(settings);
  }));

  // Format code on save if settings say so
  localSubscriptions.add(atom.workspace.observeTextEditors(editor => {
    localSubscriptions.add(editor.onDidSave(() => {
      if (settings.runOnSave) {
        process.nextTick(() => formatCode(options, editor));
      }
    }));
  }));

  // Work around flow refinements.
  subscriptions = localSubscriptions;
}

export function deactivate(): void {
  if (subscriptions) {
    subscriptions.dispose();
    subscriptions = null;
  }
}
