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

import type {TextEditor} from 'atom';

/**
 * Utility to make it easier to register a file extension with a grammar. For example, it makes
 * sense to associate ".flowconfig" or ".buckconfig" with "source.ini", or "BUCK" with
 * "source.python".
 * @param scopeName for the grammar, such as "source.js" or "source.python"
 * @param extension when a file is opened that ends with this extension, its grammar will be updated
 *   to match that of the specified scopeName, if the grammar is available.
 */
function registerGrammarForFileExtension(scopeName: string, extension: string): atom$IDisposable {
  var subscriptions = new CompositeDisposable();

  // If the grammar that corresponds to the scopeName is already registered, then start monitoring
  // TextEditors right away. If not, wait for the grammar to be registered before monitoring
  // TextEditors.
  var registeredGrammar = atom.grammars.grammarForScopeName(scopeName);
  if (registeredGrammar) {
    setEditorObservations(registeredGrammar);
  } else {
    var grammarObserver = atom.grammars.onDidAddGrammar((grammar: atom$Grammar) => {
      if (grammar.scopeName === scopeName) {
        setEditorObservations(grammar);
        subscriptions.remove(grammarObserver);
        grammarObserver.dispose();
      }
    });
    subscriptions.add(grammarObserver);
  }

  function setEditorObservations(grammar: atom$Grammar) {
    var subscription = atom.workspace.observeTextEditors((editor: TextEditor) => {
      var path = editor.getPath();
      if (path && path.endsWith(extension)) {
        editor.setGrammar(grammar);
      }
    });
    subscriptions.add(subscription);
  }

  return subscriptions;
}

module.exports = registerGrammarForFileExtension;
