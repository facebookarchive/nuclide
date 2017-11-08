'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cases = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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
    const [{ start, end }, content] = casesResult;

    editor.getBuffer().setTextInRange(new _atom.Range([start.line - 1, start.col], [end.line - 1, end.col]), content);
  });

  return function cases(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})(); /**
       * Copyright (c) 2015-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the license found in the LICENSE file in
       * the root directory of this source tree.
       *
       * 
       * @format
       */

var _atom = require('atom');

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }