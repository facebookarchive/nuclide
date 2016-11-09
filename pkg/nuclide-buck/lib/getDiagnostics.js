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

const DIAGNOSTIC_REGEX = /^([^\s:]+):([0-9]+):([0-9]+): (.*)$/gm;

// An intermediate step towards creating real diagnostics.


function makeDiagnostic(result) {
  return {
    scope: 'file',
    providerName: 'Buck',
    type: result.level === 'error' ? 'Error' : 'Warning',
    filePath: result.filePath,
    text: result.text,
    range: new _atom.Range([result.line - 1, 0], [result.line, 0])
  };
}

function makeTrace(result) {
  const point = new _atom.Point(result.line - 1, result.column - 1);
  return {
    type: 'Trace',
    text: result.text,
    filePath: result.filePath,
    // Display trace locations more precisely, since they don't show in the editor.
    range: new _atom.Range(point, point)
  };
}

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
      var _match = match,
          _match2 = _slicedToArray(_match, 5);

      const file = _match2[1],
            strLine = _match2[2],
            strCol = _match2[3],
            text = _match2[4];

      if (fileSystemService == null) {
        fileSystemService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(root);
      }
      if (fileSystemService != null) {
        const filePath = (_nuclideUri || _load_nuclideUri()).default.join(root, file);
        const localPath = (_nuclideUri || _load_nuclideUri()).default.getPath(filePath);
        promises.push(fileSystemService.exists(localPath).then(function (exists) {
          return !exists ? null : {
            level: level,
            filePath: filePath,
            text: text,
            line: parseInt(strLine, 10),
            column: parseInt(strCol, 10)
          };
        },
        // Silently ignore files resulting in an error.
        function () {
          return null;
        }));
      }
    }
    const results = yield Promise.all(promises);
    // Merge 'note' level messages into diagnostics as traces.
    const diagnostics = [];
    for (const result of results.filter(Boolean)) {
      if (result.text.startsWith('note: ') && diagnostics.length > 0) {
        const previous = diagnostics[diagnostics.length - 1];
        if (previous.trace == null) {
          previous.trace = [];
        }
        previous.trace.push(makeTrace(result));
      } else {
        diagnostics.push(makeDiagnostic(result));
      }
    }
    return diagnostics;
  });

  function getDiagnostics(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  }

  return getDiagnostics;
})();

module.exports = exports['default'];