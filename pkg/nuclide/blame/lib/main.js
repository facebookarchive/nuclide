'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BlameProvider} from '../../blame-base';

import {CompositeDisposable, Disposable} from 'atom';
import {trackTiming} from '../../analytics';
import invariant from 'assert';

const PACKAGES_MISSING_MESSAGE =
`Could not open blame: the nuclide-blame package needs other Atom packages to provide:
  - a gutter UI class
  - at least one blame provider

You are missing one of these.`;

type BlameGutter = {
  destroy: () => void,
};

type BlameGutterClass = () => BlameGutter;

class Activation {
  _packageDisposables: CompositeDisposable;
  _registeredProviders: Set<BlameProvider>;
  _blameGutterClass: ?BlameGutterClass;
  // Map of a TextEditor to its BlameGutter, if it exists.
  _textEditorToBlameGutter: Map<atom$TextEditor, BlameGutter>;
  // Map of a TextEditor to the subscription on its ::onDidDestroy.
  _textEditorToDestroySubscription: Map<atom$TextEditor, IDisposable>;

  constructor() {
    this._registeredProviders = new Set();
    this._textEditorToBlameGutter = new Map();
    this._textEditorToDestroySubscription = new Map();
    this._packageDisposables = new CompositeDisposable();
    this._packageDisposables.add(atom.contextMenu.add({
      'atom-text-editor': [{
        label: 'Toggle Blame',
        command: 'nuclide-blame:toggle-blame',
        shouldDisplay: (event: MouseEvent) => (this._canShowBlame() || this._canHideBlame()),
      }],
    }));
    this._packageDisposables.add(
      atom.commands.add('atom-text-editor', 'nuclide-blame:toggle-blame', () => {
        if (this._canShowBlame()) {
          this._showBlame();
        } else if (this._canHideBlame()) {
          this._hideBlame();
        }
      })
    );
  }

  dispose() {
    this._packageDisposables.dispose();
    this._registeredProviders.clear();
    this._textEditorToBlameGutter.clear();
    for (const disposable of this._textEditorToDestroySubscription.values()) {
      disposable.dispose();
    }
    this._textEditorToDestroySubscription.clear();
  }

  /**
   * Section: Managing Gutters
   */

  _removeBlameGutterForEditor(editor: atom$TextEditor): void {
    const blameGutter = this._textEditorToBlameGutter.get(editor);
    if (blameGutter != null) {
      blameGutter.destroy();
      this._textEditorToBlameGutter.delete(editor);
    }
  }

  _showBlameGutterForEditor(editor: atom$TextEditor): void {
    if (this._blameGutterClass == null || this._registeredProviders.size === 0) {
      atom.notifications.addInfo(PACKAGES_MISSING_MESSAGE);
      return;
    }

    let blameGutter = this._textEditorToBlameGutter.get(editor);
    if (!blameGutter) {
      let providerForEditor = null;
      for (const blameProvider of this._registeredProviders) {
        if (blameProvider.canProvideBlameForEditor(editor)) {
          providerForEditor = blameProvider;
          break;
        }
      }

      if (providerForEditor) {
        const blameGutterClass = this._blameGutterClass;
        invariant(blameGutterClass);
        blameGutter = new blameGutterClass('nuclide-blame', editor, providerForEditor);
        this._textEditorToBlameGutter.set(editor, blameGutter);
        const destroySubscription = editor.onDidDestroy(() => this._editorWasDestroyed(editor));
        this._textEditorToDestroySubscription.set(editor, destroySubscription);
        const {track} = require('../../analytics');
        track('blame-open', {
          editorPath: editor.getPath() || '',
        });
      } else {
        atom.notifications.addInfo(
          'Could not open blame: no blame information currently available for this file.'
        );
        const logger = require('../../logging').getLogger();
        logger.info(
          'nuclide-blame: Could not open blame: no blame provider currently available for this ' +
          `file: ${String(editor.getPath())}`
        );
      }
    }
  }

  _editorWasDestroyed(editor: atom$TextEditor): void {
    const blameGutter = this._textEditorToBlameGutter.get(editor);
    if (blameGutter) {
      blameGutter.destroy();
      this._textEditorToBlameGutter.delete(editor);
    }
    this._textEditorToDestroySubscription.delete(editor);
  }

  /**
   * Section: Managing Context Menus
   */

   @trackTiming('blame.showBlame')
  _showBlame(event): void {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor != null) {
      this._showBlameGutterForEditor(editor);
    }
  }

  @trackTiming('blame.hideBlame')
  _hideBlame(event): void {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor != null) {
      this._removeBlameGutterForEditor(editor);
    }
  }

  _canShowBlame(): boolean {
    const editor = atom.workspace.getActiveTextEditor();
    return !(editor != null && this._textEditorToBlameGutter.has(editor));
  }

  _canHideBlame(): boolean {
    const editor = atom.workspace.getActiveTextEditor();
    return editor != null && this._textEditorToBlameGutter.has(editor);
  }

  /**
   * Section: Consuming Services
   */

  consumeBlameGutterClass(blameGutterClass: BlameGutterClass): IDisposable {
    // This package only expects one gutter UI. It will take the first one.
    if (this._blameGutterClass == null) {
      this._blameGutterClass = blameGutterClass;
      return new Disposable(() => {
        this._blameGutterClass = null;
      });
    } else {
      return new Disposable(() => {});
    }
  }

  consumeBlameProvider(provider: BlameProvider): IDisposable {
    this._registeredProviders.add(provider);
    return new Disposable(() => {
      if (this._registeredProviders) {
        this._registeredProviders.delete(provider);
      }
    });
  }
}


let activation: ?Activation;

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

  consumeBlameGutterClass(blameGutter: BlameGutterClass): IDisposable {
    invariant(activation);
    return activation.consumeBlameGutterClass(blameGutter);
  },

  consumeBlameProvider(provider: BlameProvider): IDisposable {
    invariant(activation);
    return activation.consumeBlameProvider(provider);
  },
};
