'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable, Disposable} = require('atom');

import type {BlameProvider} from 'nuclide-blame-base/blame-types';

var PACKAGES_MISSING_MESSAGE =
`Could not open blame: the nuclide-blame package needs other Atom packages to provide:
  - a gutter UI class
  - at least one blame provider

You are missing one of these.`;


class Activation {
  _packageDisposables: CompositeDisposable;
  _registeredProviders: ?Set<BlameProvider>;
  _blameGutterClass: mixed;
  // Map of a TextEditor to its BlameGutter, if it exists.
  _textEditorToBlameGutter: Map<atom$TextEditor, mixed>;
  // Map of a TextEditor to the subscription on its ::onDidDestroy.
  _textEditorToDestroySubscription: Map<atom$TextEditor, atom$Disposable>;

  constructor() {
    this._textEditorToBlameGutter = new Map();
    this._textEditorToDestroySubscription = new Map();
    this._packageDisposables = new CompositeDisposable();
    this._packageDisposables.add(atom.contextMenu.add(
      {'atom-text-editor': [{label: 'Show Blame', command: 'nuclide-blame:show-blame', shouldDisplay: () => this._canShowBlame()}]}
    ));
    this._packageDisposables.add(atom.contextMenu.add(
      {'atom-text-editor': [{label: 'Hide Blame', command: 'nuclide-blame:hide-blame', shouldDisplay: () => this._canHideBlame()}]}
    ));
    this._packageDisposables.add(
      atom.commands.add('atom-text-editor', 'nuclide-blame:show-blame', () => this._showBlame())
    );
    this._packageDisposables.add(
      atom.commands.add('atom-text-editor', 'nuclide-blame:hide-blame', () => this._hideBlame())
    );
  }

  dispose() {
    this._packageDisposables.dispose();
    if (this._registeredProviders) {
      this._registeredProviders.clear();
    }
    this._textEditorToBlameGutter.clear();
    for (var disposable of this._textEditorToDestroySubscription.values()) {
      disposable.dispose();
    }
    this._textEditorToDestroySubscription.clear();
  }

  /**
   * Section: Managing Gutters
   */

  _removeBlameGutterForEditor(editor: atom$TextEditor): void {
    var blameGutter = this._textEditorToBlameGutter.get(editor);
    if (blameGutter) {
      blameGutter.destroy();
      this._textEditorToBlameGutter.delete(editor);
    }
  }

  _showBlameGutterForEditor(editor: atom$TextEditor): void {
    if (!this._blameGutterClass || !this._registeredProviders) {
      atom.notifications.addInfo(PACKAGES_MISSING_MESSAGE);
      return;
    }

    var blameGutter = this._textEditorToBlameGutter.get(editor);
    if (!blameGutter) {
      var providerForEditor = null;
      for (var blameProvider of this._registeredProviders) {
        if (blameProvider.canProvideBlameForEditor(editor)) {
          providerForEditor = blameProvider;
          break;
        }
      }

      if (providerForEditor) {
        var blameGutterClass = this._blameGutterClass;
        blameGutter = new blameGutterClass('nuclide-blame', editor, providerForEditor);
        this._textEditorToBlameGutter.set(editor, blameGutter);
        var destroySubscription = editor.onDidDestroy(() => this._editorWasDestroyed(editor));
        this._textEditorToDestroySubscription.set(editor, destroySubscription);
        var {track} = require('nuclide-analytics');
        track('blame-open', {
          editorPath: editor.getPath(),
        });
      } else {
        atom.notifications.addInfo('Could not open blame: no blame information currently available for this file.');
        var logger = require('nuclide-logging').getLogger();
        logger.info(`nuclide-blame: Could not open blame: no blame provider currently available for this file: ${String(editor.getPath())}`);
      }
    }
  }

  _editorWasDestroyed(editor: atom$TextEditor): void {
    var blameGutter = this._textEditorToBlameGutter.get(editor);
    if (blameGutter) {
      blameGutter.destroy();
      this._textEditorToBlameGutter.delete(editor);
    }
    this._textEditorToDestroySubscription.delete(editor);
  }

  /**
   * Section: Managing Context Menus
   */

  _showBlame(event): void {
    var editor = atom.workspace.getActiveTextEditor();
    this._showBlameGutterForEditor(editor);
  }

  _hideBlame(event): void {
    var editor = atom.workspace.getActiveTextEditor();
    this._removeBlameGutterForEditor(editor);
  }

  _canShowBlame(): boolean {
    var editor = atom.workspace.getActiveTextEditor();
    return !(this._textEditorToBlameGutter.get(editor));
  }

  _canHideBlame(): boolean {
    var editor = atom.workspace.getActiveTextEditor();
    return !!(this._textEditorToBlameGutter.get(editor));
  }

  /**
   * Section: Consuming Services
   */

  consumeBlameGutterClass(blameGutter: mixed): atom$IDisposable {
    // This package only expects one gutter UI. It will take the first one.
    if (!this._blameGutterClass) {
      this._blameGutterClass = blameGutter;
      return new Disposable(() => {
        this._blameGutterClass = null;
      });
    } else {
      return new Disposable(() => {});
    }
  }

  consumeBlameProvider(provider: BlameProvider): atom$IDisposable {
    if (!this._registeredProviders) {
      this._registeredProviders = new Set();
    }
    this._registeredProviders.add(provider);
    return new Disposable(() => {
      if (this._registeredProviders) {
        this._registeredProviders.delete(provider);
      }
    });
  }
}


var activation: ?Activation;

module.exports = {
  activate(state: ?Object): void {
    if (!activation) {
      activation = new Activation();
    }
  },

  deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
  },

  consumeBlameGutterClass(blameGutter: mixed): atom$IDisposable {
    if (activation) {
      return activation.consumeBlameGutterClass(blameGutter);
    }
  },

  consumeBlameProvider(provider: BlameProvider): atom$IDisposable {
    if (activation) {
      return activation.consumeBlameProvider(provider);
    }
  },
};
