'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = {
  // Workaround for https://github.com/AtomLinter/Linter/issues/248.
  grammarScopes: atom.grammars.getGrammars().map(grammar => grammar.scopeName),
  providerName: 'Arc',
  scope: 'file',
  lintOnFly: false,
  async lint(textEditor: TextEditor): Promise<Array<Object>> {
    var filePath = textEditor.getPath();
    if (!filePath) {
      return [];
    }
    try {
      var diagnostics = await require('nuclide-arcanist-client').findDiagnostics(textEditor.getPath());
      var {Range} = require('atom');
      return diagnostics.map(diagnostic => {
        var range = new Range(
          [diagnostic.row, diagnostic.col],
          [diagnostic.row, textEditor.getBuffer().lineLengthForRow(diagnostic.row)]
        );
        return {
          type: diagnostic.type,
          text: diagnostic.text,
          filePath: diagnostic.filePath,
          range
        };
      });
    } catch (error) {
      return [];
    }
  },
};
