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

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../commons-atom/go-to-location');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const EXTENSIONS = new Set(['ml', 'mli']);

module.exports = {
  priority: 20,
  providerName: 'nuclide-ocaml',
  getSuggestionForWord: (() => {
    var _ref = (0, _asyncToGenerator.default)(function* (textEditor, text, range) {

      if (!(_constants || _load_constants()).GRAMMARS.has(textEditor.getGrammar().scopeName)) {
        return null;
      }

      const file = textEditor.getPath();

      if (file == null) {
        return null;
      }

      let kind = 'ml';
      const extension = (_nuclideUri || _load_nuclideUri()).default.extname(file);
      if (EXTENSIONS.has(extension)) {
        kind = extension;
      }

      const instance = yield (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('MerlinService', file);

      if (!instance) {
        throw new Error('Invariant violation: "instance"');
      }

      const start = range.start;

      return {
        range: range,
        callback: (() => {
          var _ref2 = (0, _asyncToGenerator.default)(function* () {
            try {
              yield instance.pushNewBuffer(file, textEditor.getText());
              const location = yield instance.locate(file, start.row, start.column, kind);
              if (!location) {
                return;
              }

              (0, (_goToLocation || _load_goToLocation()).goToLocation)(location.file, location.pos.line - 1, location.pos.col);
            } catch (e) {
              atom.notifications.addError(e.message, { dismissable: true });
            }
          });

          return function callback() {
            return _ref2.apply(this, arguments);
          };
        })()
      };
    });

    return function getSuggestionForWord(_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  })()
};