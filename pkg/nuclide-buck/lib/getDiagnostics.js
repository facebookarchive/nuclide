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

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DIAGNOSTIC_REGEX = /^([^\s:]+):([0-9]+):[0-9]+: (.*)$/gm;

/**
 * Consumes Buck console output and emits a set of file-level diagnostic messages.
 * Ideally Buck should do this for us, but let's parse the messages manually for now.
 * This only (officially) handles Clang/g++ output.
 */

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (message, level, root) {
    // Only fetch the file system service if we need it.
    let fileSystemService;
    // Global regexps need to be reset before use.
    DIAGNOSTIC_REGEX.lastIndex = 0;
    // Collect promises and check all matches at once.
    const promises = [];
    let match;
    while (match = DIAGNOSTIC_REGEX.exec(message)) {
      var _match = match;

      var _match2 = _slicedToArray(_match, 4);

      const file = _match2[1];
      const strLine = _match2[2];
      const text = _match2[3];

      if (fileSystemService == null) {
        fileSystemService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(root);
      }
      if (fileSystemService != null) {
        const filePath = (_nuclideUri || _load_nuclideUri()).default.join(root, file);
        const localPath = (_nuclideUri || _load_nuclideUri()).default.getPath(filePath);
        promises.push(fileSystemService.exists(localPath).then(function (exists) {
          if (!exists) {
            return null;
          }
          const line = parseInt(strLine, 10);
          return !exists ? null : {
            scope: 'file',
            providerName: 'Buck',
            type: level === 'error' ? 'Error' : 'Warning',
            filePath: filePath,
            text: text,
            range: new _atom.Range([line - 1, 0], [line, 0])
          };
        },
        // Silently ignore files resulting in an error.
        function () {
          return null;
        }));
      }
    }
    const diagnostics = yield Promise.all(promises);
    return diagnostics.filter(Boolean);
  });

  function getDiagnostics(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  }

  return getDiagnostics;
})();

module.exports = exports['default'];