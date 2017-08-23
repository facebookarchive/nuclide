'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports = {
  getAutocompleteSuggestions(request) {
    return (0, _asyncToGenerator.default)(function* () {
      const { editor, prefix } = request;

      const path = editor.getPath();
      if (path == null) {
        return null;
      }

      // OCaml.Pervasives has a lot of stuff that gets shown on every keystroke without this.
      if (prefix.trim().length === 0) {
        return [];
      }

      const ocamlmerlin = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getMerlinServiceByNuclideUri)(path);
      const text = editor.getText();
      const [line, col] = editor.getCursorBufferPosition().toArray();

      // The default prefix at something like `Printf.[cursor]` is just the dot. Compute
      // `linePrefix` so that ocamlmerlin gets more context. Compute `replacementPrefix`
      // to make sure that the existing dot doesn't get clobbered when autocompleting.
      let linePrefix = editor.lineTextForBufferRow(line).substring(0, col);
      if (linePrefix.length > 0) {
        linePrefix = linePrefix.split(/([ \t[\](){}<>,+*/-])/).slice(-1)[0];
      }
      let replacementPrefix = prefix;
      if (replacementPrefix.startsWith('.')) {
        replacementPrefix = replacementPrefix.substring(1);
      }

      yield ocamlmerlin.pushNewBuffer(path, text);
      const output = yield ocamlmerlin.complete(path, line, col, linePrefix);
      if (!output) {
        return null;
      }
      return output.entries.map(function (item) {
        return {
          text: item.name,
          rightLabel: item.desc === '' ? '(module)' : item.desc,
          replacementPrefix
        };
      });
    })();
  }
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */