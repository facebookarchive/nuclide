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

var packageDisposables: CompositeDisposable;
var registeredProviders: ?Set<BlameProvider>;
var blameGutterClass;
// Map of a TextEditor to its BlameGutter, if it exists.
var textEditorToBlameGutter: Map<atom$TextEditor, mixed>;


/**
 * Section: Managing Gutters
 */
var PACKAGES_MISSING_MESSAGE =
`Could not open blame: the nuclide-blame package needs other Atom packages to provide:
  - a gutter UI class
  - at least one blame provider

You are missing one of these.`;

function removeBlameGutterForEditor(editor: atom$TextEditor): void {
  var blameGutter = textEditorToBlameGutter.get(editor);
  if (blameGutter) {
    blameGutter.destroy();
    textEditorToBlameGutter.delete(editor);
  }
}

function showBlameGutterForEditor(editor: atom$TextEditor): void {
  if (!blameGutterClass || !registeredProviders) {
    atom.notifications.addInfo(PACKAGES_MISSING_MESSAGE);
    return;
  }

  var blameGutter = textEditorToBlameGutter.get(editor);
  if (!blameGutter) {
    var providerForEditor = null;
    for (var blameProvider of registeredProviders) {
      if (blameProvider.canProvideBlameForEditor(editor)) {
        providerForEditor = blameProvider;
        break;
      }
    }

    if (providerForEditor) {
      blameGutter = new blameGutterClass('nuclide-blame', editor, providerForEditor);
      textEditorToBlameGutter.set(editor, blameGutter);
    } else {
      atom.notifications.addInfo('Could not open blame: no blame information available for this file.');
      var logger = require('nuclide-logging').getLogger();
      logger.info('nuclide-blame: Could not open blame: no blame provider available for this file: ' + editor.getPath());
    }
  }
}


/**
 * Section: Managing Context Menus
 */

function showBlame(event): void {
  var editor = atom.workspace.getActiveTextEditor();
  showBlameGutterForEditor(editor);
}

function hideBlame(event): void {
  var editor = atom.workspace.getActiveTextEditor();
  removeBlameGutterForEditor(editor);
}

function canShowBlame(): boolean {
  var editor = atom.workspace.getActiveTextEditor();
  return !(textEditorToBlameGutter.get(editor));
}

function canHideBlame(): boolean {
  var editor = atom.workspace.getActiveTextEditor();
  return !!(textEditorToBlameGutter.get(editor));
}

module.exports = {
  activate(state: ?Object): void {
    textEditorToBlameGutter = new Map();
    packageDisposables = new CompositeDisposable();
    packageDisposables.add(atom.contextMenu.add(
      {'atom-text-editor': [{label: 'Show Blame', command: 'nuclide-blame:show-blame', shouldDisplay: canShowBlame}]}
    ));
    packageDisposables.add(atom.contextMenu.add(
      {'atom-text-editor': [{label: 'Hide Blame', command: 'nuclide-blame:hide-blame', shouldDisplay: canHideBlame}]}
    ));
    packageDisposables.add(
      atom.commands.add('atom-text-editor', 'nuclide-blame:show-blame', showBlame)
    );
    packageDisposables.add(
      atom.commands.add('atom-text-editor', 'nuclide-blame:hide-blame', hideBlame)
    );
  },

  deactivate() {
    packageDisposables.dispose();
    if (registeredProviders) {
      registeredProviders.clear();
    }
    textEditorToBlameGutter.clear();
  },

  consumeBlameGutterClass(blameGutter: mixed): atom$IDisposable {
    // This package only expects one gutter UI. It will take the first one.
    if (!blameGutterClass) {
      blameGutterClass = blameGutter;
      return new Disposable(() => {
        blameGutterClass = null;
      });
    } else {
      return new Disposable(() => {});
    }
  },

  consumeBlameProvider(provider: BlameProvider): atom$IDisposable {
    if (!registeredProviders) {
      registeredProviders = new Set();
    }
    registeredProviders.add(provider);
    return new Disposable(() => {
      if (registeredProviders) {
        registeredProviders.delete(provider);
      }
    });
  },
};
