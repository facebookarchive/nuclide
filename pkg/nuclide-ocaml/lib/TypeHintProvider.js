'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Ignore typehints that span too many lines. These tend to be super spammy.
const MAX_LINES = 10; /**
                       * Copyright (c) 2015-present, Facebook, Inc.
                       * All rights reserved.
                       *
                       * This source code is licensed under the license found in the LICENSE file in
                       * the root directory of this source tree.
                       *
                       * 
                       * @format
                       */

class TypeHintProvider {
  typeHint(editor, position) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-ocaml.typeHint', (0, _asyncToGenerator.default)(function* () {
      const path = editor.getPath();
      if (path == null) {
        return null;
      }
      const instance = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('MerlinService', path);
      if (instance == null) {
        return null;
      }
      yield instance.pushNewBuffer(path, editor.getText());
      const types = yield instance.enclosingType(path, position.row, position.column);
      if (types == null || types.length === 0) {
        return null;
      }
      const type = types[0];
      if (type.end.line - type.start.line > MAX_LINES) {
        return null;
      }
      return {
        hint: type.type,
        range: new _atom.Range(new _atom.Point(type.start.line - 1, type.start.col), new _atom.Point(type.end.line - 1, type.end.col))
      };
    }));
  }
}
exports.default = TypeHintProvider;