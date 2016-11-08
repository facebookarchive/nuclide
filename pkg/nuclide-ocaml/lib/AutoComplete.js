'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  getAutocompleteSuggestions: (() => {
    var _ref = (0, _asyncToGenerator.default)(function* (request) {
      const editor = request.editor,
            prefix = request.prefix;

      // OCaml.Pervasives has a lot of stuff that gets shown on every keystroke without this.

      if (prefix.trim().length === 0) {
        return [];
      }

      const path = editor.getPath();
      const ocamlmerlin = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('MerlinService', path);

      if (!ocamlmerlin) {
        throw new Error('Invariant violation: "ocamlmerlin"');
      }

      const text = editor.getText();

      var _editor$getCursorBuff = editor.getCursorBufferPosition().toArray(),
          _editor$getCursorBuff2 = _slicedToArray(_editor$getCursorBuff, 2);

      const line = _editor$getCursorBuff2[0],
            col = _editor$getCursorBuff2[1];

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
          replacementPrefix: replacementPrefix
        };
      });
    });

    return function getAutocompleteSuggestions(_x) {
      return _ref.apply(this, arguments);
    };
  })()
};