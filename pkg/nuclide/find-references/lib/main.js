'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Reference} from './types';

var {CompositeDisposable} = require('atom');

export type FindReferencesData = {
  type: 'data',
  baseUri: string,
  referencedSymbolName: string,
  references: Array<Reference>,
};

export type FindReferencesError = {
  type: 'error',
  message: string,
};

export type FindReferencesReturn = FindReferencesData | FindReferencesError;

export type FindReferencesProvider = {
  findReferences(editor: TextEditor, position: atom$Point): Promise<?FindReferencesReturn>;
};

var FIND_REFERENCES_URI = 'atom://nuclide/find-references/';
var subscriptions: ?CompositeDisposable = null;
var providers: Array<FindReferencesProvider> = [];

async function getProviderData(): Promise<?FindReferencesReturn> {
  // For some reason, Flow thinks atom.workspace is null here
  var editor = (atom.workspace: any).getActiveTextEditor();
  if (!editor) {
    return null;
  }
  var path = editor.getPath();
  if (!path) {
    return null;
  }
  var point = editor.getCursorBufferPosition();
  var providerData = await Promise.all(providers.map(
    provider => provider.findReferences(editor, point)
  ));
  return providerData.filter(x => !!x)[0];
}

function showError(message: string): void {
  atom.notifications.addError('nuclide-find-references: ' + message, {dismissable: true});
}

async function tryCreateView(): Promise<?HTMLElement> {
  try {
    var data = await getProviderData();
    if (data == null) {
      showError('Symbol references are not available for this project.');
    } else if (data.type === 'error') {
      showError(data.message);
    } else if (!data.references.length) {
      showError('No references found.');
    } else {
      var {baseUri, referencedSymbolName, references} = data;
      var FindReferencesModel = require('./FindReferencesModel');
      var model = new FindReferencesModel(
        baseUri,
        referencedSymbolName,
        references
      );

      var FindReferencesElement = require('./FindReferencesElement');
      return new FindReferencesElement().initialize(model);
    }
  } catch (e) {
    // TODO(peterhal): Remove this when unhandled rejections have a default handler.
    var {getLogger} = require('nuclide-logging');
    getLogger().debug('Exception in nuclide-find-references', e);
    showError(e);
  }
}

module.exports = {

  activate(state: ?any): void {
    subscriptions = new CompositeDisposable();
    subscriptions.add(atom.commands.add(
      'atom-text-editor',
      'nuclide-find-references:activate',
      () => {
        // Generate a unique identifier.
        var crypto = require('crypto');
        var id = (crypto.randomBytes(8) || '').toString('hex');
        atom.workspace.open(FIND_REFERENCES_URI + id);
      }
    ));

    // We can't inline `tryCreateView` with an async callback since addOpener
    // expects a null return value (not a Promise with a null return) if we don't want
    // to handle the new workspace.
    subscriptions.add(atom.workspace.addOpener((uri) => {
      if (uri.startsWith(FIND_REFERENCES_URI)) {
        return tryCreateView();
      }
    }));
  },

  deactivate(): void {
    if (subscriptions) {
      subscriptions.dispose();
      subscriptions = null;
    }
    providers = [];
  },

  consumeProvider(provider: FindReferencesProvider): void {
    providers.push(provider);
  },

};
