var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideClient2;

function _nuclideClient() {
  return _nuclideClient2 = require('../../nuclide-client');
}

module.exports = {
  getAutocompleteSuggestions: _asyncToGenerator(function* (request) {
    var editor = request.editor;
    var prefix = request.prefix;

    // OCaml.Pervasives has a lot of stuff that gets shown on every keystroke without this.
    if (prefix.trim().length === 0) {
      return [];
    }

    var path = editor.getPath();
    var ocamlmerlin = (0, (_nuclideClient2 || _nuclideClient()).getServiceByNuclideUri)('MerlinService', path);
    (0, (_assert2 || _assert()).default)(ocamlmerlin);
    var text = editor.getText();

    var _editor$getCursorBufferPosition$toArray = editor.getCursorBufferPosition().toArray();

    var _editor$getCursorBufferPosition$toArray2 = _slicedToArray(_editor$getCursorBufferPosition$toArray, 2);

    var line = _editor$getCursorBufferPosition$toArray2[0];
    var col = _editor$getCursorBufferPosition$toArray2[1];

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

    yield ocamlmerlin.pushNewBuffer(path, text);
    var output = yield ocamlmerlin.complete(path, line, col, linePrefix);
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
  })
};