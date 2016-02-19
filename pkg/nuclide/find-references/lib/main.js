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

import {CompositeDisposable} from 'atom';
import {array} from '../../commons';
import {track} from '../../analytics';

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
  // Return true if your provider supports finding references for the provided TextEditor.
  isEditorSupported(editor: TextEditor): Promise<boolean>,

  // `findReferences` will only be called if `isEditorSupported` previously returned true
  // for the given TextEditor.
  findReferences(editor: TextEditor, position: atom$Point): Promise<?FindReferencesReturn>,
};

const FIND_REFERENCES_URI = 'atom://nuclide/find-references/';

let subscriptions: ?CompositeDisposable = null;
let providers: Array<FindReferencesProvider> = [];
const supportedProviders: Map<TextEditor, Array<FindReferencesProvider>> = new Map();

async function getProviderData(): Promise<?FindReferencesReturn> {
  const editor = atom.workspace.getActiveTextEditor();
  if (!editor) {
    return null;
  }
  const path = editor.getPath();
  if (!path) {
    return null;
  }
  const point = editor.getCursorBufferPosition();
  track('find-references:activate', {
    path,
    row: point.row.toString(),
    column: point.column.toString(),
  });
  const supported = supportedProviders.get(editor);
  if (!supported) {
    return null;
  }
  const providerData = await Promise.all(supported.map(
    provider => provider.findReferences(editor, point)
  ));
  return providerData.filter(x => !!x)[0];
}

function showError(message: string): void {
  atom.notifications.addError('nuclide-find-references: ' + message, {dismissable: true});
}

async function tryCreateView(): Promise<?HTMLElement> {
  try {
    const data = await getProviderData();
    if (data == null) {
      showError('Symbol references are not available for this project.');
    } else if (data.type === 'error') {
      track('find-references:error', {message: data.message});
      showError(data.message);
    } else if (!data.references.length) {
      track('find-references:success', {resultCount: '0'});
      showError('No references found.');
    } else {
      const {baseUri, referencedSymbolName, references} = data;
      track('find-references:success', {
        baseUri,
        referencedSymbolName,
        resultCount: references.length.toString(),
      });
      const FindReferencesModel = require('./FindReferencesModel');
      const model = new FindReferencesModel(
        baseUri,
        referencedSymbolName,
        references
      );

      const FindReferencesElement = require('./FindReferencesElement');
      return new FindReferencesElement().initialize(model);
    }
  } catch (e) {
    // TODO(peterhal): Remove this when unhandled rejections have a default handler.
    const {getLogger} = require('../../logging');
    getLogger().error('Exception in nuclide-find-references', e);
    showError(e);
  }
}

function enableForEditor(editor: TextEditor): void {
  const elem = atom.views.getView(editor);
  elem.classList.add('enable-nuclide-find-references');
}

module.exports = {

  activate(state: ?any): void {
    subscriptions = new CompositeDisposable();
    subscriptions.add(atom.commands.add(
      'atom-text-editor',
      'nuclide-find-references:activate',
      async () => {
        const view = await tryCreateView();
        if (view != null) {
          // Generate a unique identifier.
          const crypto = require('crypto');
          const id = (crypto.randomBytes(8) || '').toString('hex');
          const uri = FIND_REFERENCES_URI + id;
          const disposable = atom.workspace.addOpener(newUri => {
            if (uri === newUri) {
              return view;
            }
          });
          atom.workspace.open(uri);
          // The new tab opens instantly, so this is no longer needed.
          disposable.dispose();
        }
      }
    ));

    // Mark text editors with a working provider with a special CSS class.
    // This ensures the context menu option only appears in supported projects.
    subscriptions.add(atom.workspace.observeTextEditors(async editor => {
      const path = editor.getPath();
      if (!path || supportedProviders.get(editor)) {
        return;
      }
      let supported = await Promise.all(providers.map(
        async provider => {
          if (await provider.isEditorSupported(editor)) {
            return provider;
          }
          return null;
        },
      ));
      supported = array.compact(supported);
      if (supported.length) {
        enableForEditor(editor);
      }
      supportedProviders.set(editor, supported);
      if (subscriptions) {
        const disposable = editor.onDidDestroy(() => {
          supportedProviders.delete(editor);
          if (subscriptions) {
            subscriptions.remove(disposable);
          }
        });
        subscriptions.add(disposable);
      }
    }));

    // Enable text copy from the symbol reference view
    subscriptions.add(atom.commands.add(
      'nuclide-find-references-view',
      'core:copy',
      () => {
        const selectedText = window.getSelection().toString();
        atom.clipboard.write(selectedText);
      }
    ));
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
    // Editors are often open before providers load, so update existing ones too.
    supportedProviders.forEach(async (supported, editor) => {
      if (await provider.isEditorSupported(editor)) {
        if (!supported.length) {
          enableForEditor(editor);
        }
        supported.push(provider);
      }
    });
  },

};
