function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

module.exports = {
  name: 'nuclide-ocaml',
  grammarScopes: Array.from((_constants || _load_constants()).GRAMMARS),
  scope: 'file',
  lintOnFly: false,
  invalidateOnClose: true,

  lint: function lint(textEditor) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)('nuclide-ocaml.lint', _asyncToGenerator(function* () {
      var filePath = textEditor.getPath();
      if (filePath == null) {
        return [];
      }

      var instance = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('MerlinService', filePath);
      if (instance == null) {
        return [];
      }
      yield instance.pushNewBuffer(filePath, textEditor.getText());
      var diagnostics = yield instance.errors(filePath);
      if (diagnostics == null) {
        return [];
      }
      return diagnostics.map(function (diagnostic) {
        return {
          type: diagnostic.type === 'warning' ? 'Warning' : 'Error',
          filePath: filePath,
          text: diagnostic.message,
          range: new (_atom || _load_atom()).Range([diagnostic.start.line - 1, diagnostic.start.col], [diagnostic.end.line - 1, diagnostic.end.col])
        };
      });
    }));
  }
};