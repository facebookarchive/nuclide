'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {getServiceByNuclideUri} = require('nuclide-client');

module.exports = {
  async getAutocompleteSuggestions(
      request: {editor: TextEditor; bufferPosition: Point; scopeDescriptor: any; prefix: string}):
      Promise<?Array<{snippet: string; rightLabel: string}>> {

    var {editor, prefix} = request;

    // OCaml.Pervasives has a lot of stuff that gets shown on every keystroke without this.
    if (prefix.trim().length === 0) {
      return [];
    }

    var path = editor.getPath();
    var ocamlmerlin = getServiceByNuclideUri('MerlinService', path);
    var text = editor.getText();
    var [line, col] = editor.getCursorBufferPosition().toArray();

    // The default prefix at something like `Printf.[cursor]` is just the dot. Compute
    // `linePrefix` so that ocamlmerlin gets more context. Compute `replacementPrefix`
    // to make sure that the existing dot doesn't get clobbered when autocompleting.
    var linePrefix = editor.lineTextForBufferRow(line).substring(0, col);
    if (linePrefix.length > 0) {
      linePrefix = linePrefix.split(/([ \t\[\](){}<>,+*\/-])/).slice(-1)[0];
    }
    var replacementPrefix = prefix;
    if (replacementPrefix.startsWith('.')) {
      replacementPrefix = replacementPrefix.substring(1);
    }

    await ocamlmerlin.pushNewBuffer(path, text);
    var output = await ocamlmerlin.complete(path, line, col, linePrefix);
    if (!output) {
      return null;
    }
    return output.entries.map((item) => {
      return {
        text: item.name,
        rightLabel: (item.desc === '' ? '(module)' : item.desc),
        replacementPrefix: replacementPrefix,
      };
    });
  },
};
