'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports = {
  priority: 20,
  providerName: 'nuclide-ocaml',
  getSuggestionForWord(textEditor, text, range) {
    return (0, _asyncToGenerator.default)(function* () {
      const { scopeName } = textEditor.getGrammar();
      if (!(_constants || _load_constants()).GRAMMARS.has(scopeName)) {
        return null;
      }

      const file = textEditor.getPath();
      if (file == null) {
        return null;
      }

      const instance = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getMerlinServiceByNuclideUri)(file);

      try {
        yield instance.pushNewBuffer(file, textEditor.getText());
      } catch (e) {
        atom.notifications.addError(e.message, { dismissable: true });
        return null;
      }

      const extension = (_nuclideUri || _load_nuclideUri()).default.extname(file);
      const kind = (_constants || _load_constants()).EXTENSIONS.has(extension) ? extension : 'ml';

      try {
        const location = yield instance.locate(file, range.start.row, range.start.column, kind);
        if (location != null) {
          return {
            range,
            callback() {
              return (0, (_goToLocation || _load_goToLocation()).goToLocation)(location.file, location.pos.line - 1, location.pos.col);
            }
          };
        }
      } catch (e) {}

      return null;
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