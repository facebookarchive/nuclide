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
var logger;

type CodeFormatProvider = {
  formatCode(editor: TextEditor, range: Range): Promise<string>;
};

class CodeFormatManager {

  constructor() {
    this._subscriptions = new CompositeDisposable();
    this._subscriptions.add(atom.commands.add(
      'atom-text-editor',
      'nuclide-code-format:format-code',
      // Atom doesn't accept in-command modification of the text editor contents.
      () => process.nextTick(() => this._formatCodeInActiveTextEditor(this._editor))
    ));
    this._codeFormatProviders = [];
  }

  async _formatCodeInActiveTextEditor(): Promise {
    var editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
      return getLogger().info('No active text editor to format its code!');
    }

    var {scopeName} = editor.getGrammar();
    var matchingProviders = this._getMatchingProvidersForScopeName(scopeName);

    if (!matchingProviders.length) {
      return getLogger().info('No code format providers registered for scopeName:', scopeName);
    }

    var buffer = editor.getBuffer();
    var selectionRange = editor.getSelectedBufferRange();
    var {start: selectionStart, end: selectionEnd} = selectionRange;
    var formatRange = null;
    if (selectionStart.isEqual(selectionEnd)) {
      // If no selection is done, then, the whole file is wanted to be formatted.
      formatRange = buffer.getRange();
    } else {
      // Format selections should start at the begining of the line,
      // and end at the end of the selection line.
      var {Range} = require('atom');
      formatRange = new Range(
          {row: selectionStart.row, column: 0},
          {row: selectionEnd.row, column: buffer.lineLengthForRow(selectionEnd.row)}
      );
    }

    var codeReplacement = await matchingProviders[0].formatCode(editor, formatRange);
    // TODO(most): save cursor location.
    editor.setTextInBufferRange(formatRange, codeReplacement);
  }

  _getMatchingProvidersForScopeName(scopeName: string): Array<CodeFormatProvider> {
    return this._codeFormatProviders.filter((provider: CodeFormatProvider) => {
      var providerGrammars = provider.selector.split(/, ?/);
      return provider.inclusionPriority > 0 && providerGrammars.indexOf(scopeName) !== -1;
    }).sort((providerA: CodeFormatProvider, providerB: CodeFormatProvider) => {
      return providerA.inclusionPriority < providerB.inclusionPriority;
    });
  }

  addProvider(provider: CodeFormatProvider) {
    this._codeFormatProviders.push(provider);
  }

  dispose() {
    if (this._subscriptions) {
      this._subscriptions.dispose();
      this._subscriptions = null;
    }
  }
}

function getLogger() {
  return logger || (logger = require('nuclide-logging').getLogger());
}

module.exports = CodeFormatManager;
