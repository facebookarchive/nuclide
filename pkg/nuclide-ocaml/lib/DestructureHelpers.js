'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cases = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

let cases = exports.cases = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (editor, position) {
    const path = editor.getPath();
    if (path == null) {
      return;
    }
    const instance = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('MerlinService', path);
    if (instance == null) {
      return;
    }
    yield instance.pushNewBuffer(path, editor.getText());
    const casesResult = yield instance.cases(path, position, position);
    if (casesResult == null) {
      return;
    }

    var _casesResult = _slicedToArray(casesResult, 2),
        _casesResult$ = _casesResult[0];

    const start = _casesResult$.start,
          end = _casesResult$.end,
          content = _casesResult[1];


    editor.getBuffer().setTextInRange(new _atom.Range([start.line - 1, start.col], [end.line - 1, end.col]), content);
  });

  return function cases(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

var _atom = require('atom');

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }